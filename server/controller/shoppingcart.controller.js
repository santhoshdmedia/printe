const mongoose               = require("mongoose");
const { errorResponse,
        successResponse }    = require("../helper/response.helper");
const { ShoppingCardSchema } = require("./models_import");

// ─────────────────────────────────────────────────────────────────────────────
// Helper: resolve phone + email for a logged-in user
//
// Priority order:
//   1. req.body (frontend explicitly sent it — fastest, no DB hit)
//   2. req.userData JWT payload
//   3. Database lookup (fallback)
// ─────────────────────────────────────────────────────────────────────────────

const resolveUserContact = async (userData, bodyOverrides = {}) => {
  // 1️⃣ Accept whatever the frontend sent directly
  let phone = bodyOverrides.phone_number || bodyOverrides.phone || null;
  let email = bodyOverrides.email        || null;

  // 2️⃣ Fill gaps from JWT payload
  if (!phone) phone = userData.phone || userData.phoneNumber || userData.mobile || null;
  if (!email) email = userData.email  || null;

  // 3️⃣ DB lookup if still missing
  if (!phone || !email) {
    try {
      // ⚠ Adjust path to your actual User model location
      // Common locations: ../models/user.model  OR  ../modals/user.modal
      let User;
      try {
        User = require("../models/user.model");
      } catch {
        User = require("../modals/user.modal");
      }

      const user = await User.findById(userData.id)
        .select("phone phoneNumber mobile email")
        .lean();

      if (user) {
        if (!phone) phone = user.phone || user.phoneNumber || user.mobile || null;
        if (!email) email = user.email || null;
      }
    } catch (err) {
      // Non-fatal — cart still saves, just without contact info
      console.warn("[Cart] Could not fetch user contact info:", err.message);
    }
  }

  // Normalize phone: strip non-digits, ensure 91 country prefix
  if (phone) {
    phone = String(phone).replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;
  }

  return { phone: phone || null, email: email || null };
};

// ─────────────────────────────────────────────────────────────────────────────
// Add to Cart
// ─────────────────────────────────────────────────────────────────────────────

const addToShoppingCart = async (req, res) => {
  try {
    // ── Identify owner ────────────────────────────────────────────────────────
    let userIdentifier;
    let identifierField;
    let phone = null;
    let email = null;

    if (req.userData && req.userData.id) {
      // ── Logged-in user ───────────────────────────────────────────────────
      userIdentifier  = req.userData.id;
      identifierField = "user_id";

      // Resolve contact: body override → JWT → DB
      const contact = await resolveUserContact(req.userData, req.body);
      phone = contact.phone;
      email = contact.email;

    } else {
      // ── Guest user ───────────────────────────────────────────────────────
      userIdentifier  = req.body.guestId || req.body.GuestId;
      identifierField = "guest_id";

      if (!userIdentifier) {
        return errorResponse(res, "Guest ID is required for guest users");
      }

      // Guests must send phone/email from the frontend
      phone = req.body.phone_number || req.body.phone || null;
      if (phone) {
        phone = String(phone).replace(/\D/g, "");
        if (phone.length === 10) phone = "91" + phone;
      }
      email = req.body.email || null;
    }

    if (!req.body.product_id) {
      return errorResponse(res, "Product ID is required");
    }

    // ── Check for existing item (same product + variant) ──────────────────────
    const existingItemQuery = {
      [identifierField]: userIdentifier,
      product_id: new mongoose.Types.ObjectId(req.body.product_id),
    };
    if (req.body.size)  existingItemQuery.size  = req.body.size;
    if (req.body.color) existingItemQuery.color = req.body.color;

    const existingItem = await ShoppingCardSchema.findOne(existingItemQuery);

    let result;

    if (existingItem) {
      // ── Update existing cart item ─────────────────────────────────────────
      existingItem.quantity         += req.body.product_quantity || req.body.quantity || 1;
      existingItem.product_quantity  = existingItem.quantity;
      existingItem.updated_at        = new Date();
      existingItem.reminder_sent     = false;
      existingItem.reminder_sent_at  = null;

      // Always refresh contact info (phone/email may have been missing before)
      if (phone) existingItem.phone_number = phone;
      if (email) existingItem.email        = email;

      // Refresh platform links if re-adding a QR product
      if (req.body.selected_platforms) {
        existingItem.selected_platforms = req.body.selected_platforms;
      }
      if (req.body.platform_links) {
        existingItem.platform_links = req.body.platform_links;
      }

      result = await existingItem.save();

    } else {
      // ── Create new cart item ──────────────────────────────────────────────
      const cartItem = {
        [identifierField]:        userIdentifier,
        product_id:               new mongoose.Types.ObjectId(req.body.product_id),
        quantity:                 req.body.product_quantity       || req.body.quantity || 1,
        product_quantity:         req.body.product_quantity       || req.body.quantity || 1,
        product_price:            req.body.product_price          || 0,
        product_name:             req.body.product_name           || "Product",
        product_image:            req.body.product_image          || "",
        product_seo_url:          req.body.product_seo_url        || "",
        product_design_file:      req.body.product_design_file    || "",
        category_name:            req.body.category_name          || "",
        subcategory_name:         req.body.subcategory_name       || "",
        final_total:              req.body.final_total            || 0,
        final_total_withoutGst:   req.body.final_total_withoutGst || 0,
        cgst:                     req.body.cgst                   || 0,
        sgst:                     req.body.sgst                   || 0,
        MRP_savings:              req.body.MRP_savings            || 0,
        TotalSavings:             req.body.TotalSavings           || 0,
        FreeDelivery:             req.body.FreeDelivery           || false,
        noCustomtation:           req.body.noCustomtation         || false,
        DeliveryCharges:          req.body.DeliveryCharges        || 0,
        is_qr_product:            req.body.is_qr_product          || false,
        selected_platforms:       req.body.selected_platforms     || [],
        platform_links:           req.body.platform_links         || {},
        ...(req.body.size             && { size:             req.body.size }),
        ...(req.body.color            && { color:            req.body.color }),
        ...(req.body.instructions     && { instructions:     req.body.instructions }),
        ...(req.body.product_variants && { product_variants: req.body.product_variants }),
        // ✅ Contact info — resolved above
        phone_number:     phone,
        email:            email,
        // Reminder tracking
        reminder_sent:    false,
        reminder_sent_at: null,
        created_at:       new Date(),
        updated_at:       new Date(),
      };

      result = await ShoppingCardSchema.create(cartItem);
    }

    const cartCount = await ShoppingCardSchema.countDocuments({
      [identifierField]: userIdentifier,
    });

    return successResponse(res, "Product added to cart successfully", {
      data: result,
      cartCount,
      guestId: !req.userData ? userIdentifier : undefined,
    });

  } catch (err) {
    console.error("Add to cart error:", err);
    return errorResponse(res, "Error adding to shopping cart");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get My Cart
// ─────────────────────────────────────────────────────────────────────────────

const getMyShoppingCart = async (req, res) => {
  try {
    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier  = new mongoose.Types.ObjectId(req.userData.id);
      identifierField = "user_id";
    } else {
      userIdentifier  = req.query.guestId;
      identifierField = "guest_id";

      if (!userIdentifier) {
        return errorResponse(res, "Guest ID is required for guest users");
      }
    }

    const result = await ShoppingCardSchema.aggregate([
      { $match: { [identifierField]: userIdentifier } },
      {
        $lookup: {
          from:         "products",
          localField:   "product_id",
          foreignField: "_id",
          as:           "product_details",
        },
      },
      {
        $unwind: {
          path:                       "$product_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id:                    1,
          product_id:             1,
          product_design_file:    1,
          FreeDelivery:           1,
          noCustomtation:         1,
          DeliveryCharges:        1,
          product_image:          1,
          product_name:           1,
          category_name:          1,
          subcategory_name:       1,
          product_price:          1,
          MRP_savings:            1,
          TotalSavings:           1,
          product_quantity:       1,
          product_seo_url:        1,
          product_variants:       1,
          sgst:                   1,
          cgst:                   1,
          final_total:            1,
          final_total_withoutGst: 1,
          quantity:               1,
          size:                   1,
          color:                  1,
          instructions:           1,
          is_qr_product:          1,
          selected_platforms:     1,
          platform_links:         1,
          phone_number:           1,
          email:                  1,
          createdAt:              "$created_at",
          updatedAt:              "$updated_at",
          __v:                    1,
        },
      },
    ]);

    const transformedResult = result.map((item) => ({
      _id:                    item._id,
      product_id:             item.product_id,
      product_design_file:    item.product_design_file    || "",
      FreeDelivery:           item.FreeDelivery            || false,
      noCustomtation:         item.noCustomtation          || false,
      DeliveryCharges:        item.DeliveryCharges         || 0,
      product_image:          item.product_image           || "",
      product_name:           item.product_name            || "",
      category_name:          item.category_name           || "",
      subcategory_name:       item.subcategory_name        || "",
      product_price:          item.product_price           || 0,
      MRP_savings:            typeof item.MRP_savings  === "number" ? item.MRP_savings.toFixed(2)  : "0.00",
      TotalSavings:           typeof item.TotalSavings === "number" ? item.TotalSavings.toFixed(2) : "0.00",
      product_quantity:       item.product_quantity ? item.product_quantity.toString() : "1",
      product_seo_url:        item.product_seo_url         || "",
      product_variants:       item.product_variants        || [],
      sgst:                   item.sgst  ? item.sgst.toString()  : "0",
      cgst:                   item.cgst  ? item.cgst.toString()  : "0",
      final_total:            item.final_total             || 0,
      final_total_withoutGst: item.final_total_withoutGst  || 0,
      quantity:               item.quantity                || 1,
      size:                   item.size                    || null,
      color:                  item.color                   || null,
      instructions:           item.instructions            || null,
      is_qr_product:          item.is_qr_product           || false,
      selected_platforms:     item.selected_platforms      || [],
      platform_links:         item.platform_links          || {},
      phone_number:           item.phone_number            || null,
      email:                  item.email                   || null,
      createdAt:              item.createdAt,
      updatedAt:              item.updatedAt,
      __v:                    item.__v || 0,
    }));

    return res.status(200).json({
      message: "",
      data:    transformedResult,
    });
  } catch (err) {
    console.error("Get cart error:", err);
    return res.status(500).json({
      message: "Error fetching shopping cart",
      data:    [],
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Remove Cart Items
// ─────────────────────────────────────────────────────────────────────────────

const removeMyShoppingCart = async (req, res) => {
  try {
    const { ids, guestId } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, "No cart items provided for removal");
    }

    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier  = req.userData.id;
      identifierField = "user_id";
    } else {
      userIdentifier  = guestId;
      identifierField = "guest_id";

      if (!userIdentifier) {
        return errorResponse(res, "Guest ID is required for guest users");
      }
    }

    await ShoppingCardSchema.deleteMany({
      _id:               { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
      [identifierField]: userIdentifier,
    });

    return res.status(200).json({
      message: "Products removed from shopping cart",
      data:    [],
    });
  } catch (err) {
    console.error("Remove cart error:", err);
    return res.status(500).json({
      message: "Failed to remove products from shopping cart",
      data:    [],
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Update Cart Item Quantity
// ─────────────────────────────────────────────────────────────────────────────

const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId, quantity, guestId } = req.body;

    if (!itemId || quantity === undefined) {
      return res.status(400).json({
        message: "Item ID and quantity are required",
        data:    [],
      });
    }

    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier  = req.userData.id;
      identifierField = "user_id";
    } else {
      userIdentifier  = guestId;
      identifierField = "guest_id";

      if (!userIdentifier) {
        return res.status(400).json({
          message: "Guest ID is required for guest users",
          data:    [],
        });
      }
    }

    // quantity 0 → delete
    if (quantity === 0) {
      await ShoppingCardSchema.findOneAndDelete({
        _id:               new mongoose.Types.ObjectId(itemId),
        [identifierField]: userIdentifier,
      });
      return res.status(200).json({ message: "Item removed from cart", data: [] });
    }

    const updatedItem = await ShoppingCardSchema.findOneAndUpdate(
      {
        _id:               new mongoose.Types.ObjectId(itemId),
        [identifierField]: userIdentifier,
      },
      {
        quantity:         Math.max(1, quantity),
        product_quantity: Math.max(1, quantity),
        updated_at:       new Date(),
        // Reset reminder so the 5-min / 1-hour window restarts
        reminder_sent:    false,
        reminder_sent_at: null,
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found", data: [] });
    }

    return res.status(200).json({
      message: "Cart item updated successfully",
      data:    [updatedItem],
    });
  } catch (err) {
    console.error("Update cart error:", err);
    return res.status(500).json({ message: "Error updating cart item", data: [] });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Merge Guest Cart → User Cart (after login)
// Also backfills phone/email on migrated items
// ─────────────────────────────────────────────────────────────────────────────

const mergeCartsAfterLogin = async (req, res) => {
  try {
    const userId      = req.userData?.id;
    const { guestId } = req.body;

    if (!userId)  return res.status(400).json({ message: "User ID is required",  data: [] });
    if (!guestId) return res.status(400).json({ message: "Guest ID is required", data: [] });

    // Resolve contact info to backfill merged items
    const contact = await resolveUserContact(req.userData, req.body);

    const guestCartItems = await ShoppingCardSchema.find({ guest_id: guestId });

    for (const guestItem of guestCartItems) {
      const existingQuery = {
        user_id:    userId,
        product_id: guestItem.product_id,
      };
      if (guestItem.size)  existingQuery.size  = guestItem.size;
      if (guestItem.color) existingQuery.color = guestItem.color;

      const existingUserItem = await ShoppingCardSchema.findOne(existingQuery);

      if (existingUserItem) {
        existingUserItem.quantity         += guestItem.quantity;
        existingUserItem.product_quantity  = existingUserItem.quantity;
        existingUserItem.updated_at        = new Date();
        existingUserItem.reminder_sent     = false;
        existingUserItem.reminder_sent_at  = null;
        if (contact.phone) existingUserItem.phone_number = contact.phone;
        if (contact.email) existingUserItem.email        = contact.email;
        await existingUserItem.save();
        await ShoppingCardSchema.findByIdAndDelete(guestItem._id);
      } else {
        await ShoppingCardSchema.findByIdAndUpdate(guestItem._id, {
          user_id:          userId,
          guest_id:         null,
          phone_number:     contact.phone || guestItem.phone_number,
          email:            contact.email || guestItem.email,
          updated_at:       new Date(),
          reminder_sent:    false,
          reminder_sent_at: null,
        });
      }
    }

    const updatedCart = await ShoppingCardSchema.find({ user_id: userId });

    return res.status(200).json({
      message: "Cart merged successfully",
      data:    updatedCart,
    });
  } catch (err) {
    console.error("Merge cart error:", err);
    return res.status(500).json({ message: "Error merging carts", data: [] });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Backfill missing phone/email on existing cart items
// Call this as a one-time migration route: POST /cart/backfill-contacts
// ─────────────────────────────────────────────────────────────────────────────

const backfillCartContacts = async (req, res) => {
  try {
    let User;
    try {
      User = require("../models/user.model");
    } catch {
      User = require("../modals/user.modal");
    }

    // Find all logged-in carts missing phone or email
    const itemsMissingContact = await ShoppingCardSchema.find({
      user_id: { $ne: null },
      $or: [
        { phone_number: null },
        { phone_number: { $exists: false } },
        { email: null },
        { email: { $exists: false } },
      ],
    }).lean();

    console.log(`[Backfill] Found ${itemsMissingContact.length} cart items missing contact info`);

    // Group by user_id to avoid redundant DB lookups
    const userIds = [...new Set(itemsMissingContact.map(i => String(i.user_id)))];
    let updated = 0;

    for (const userId of userIds) {
      try {
        const user = await User.findById(userId)
          .select("phone phoneNumber mobile email")
          .lean();

        if (!user) continue;

        let phone = user.phone || user.phoneNumber || user.mobile || null;
        let email = user.email || null;

        if (phone) {
          phone = String(phone).replace(/\D/g, "");
          if (phone.length === 10) phone = "91" + phone;
        }

        if (!phone && !email) continue;

        const updateFields = {};
        if (phone) updateFields.phone_number = phone;
        if (email) updateFields.email        = email;

        const result = await ShoppingCardSchema.updateMany(
          { user_id: userId, $or: [{ phone_number: null }, { email: null }] },
          { $set: updateFields }
        );

        updated += result.modifiedCount;
      } catch (err) {
        console.warn(`[Backfill] Failed for user ${userId}:`, err.message);
      }
    }

    return res.status(200).json({
      message: `Backfill complete. Updated ${updated} cart items across ${userIds.length} users.`,
      data:    { updated, usersProcessed: userIds.length },
    });
  } catch (err) {
    console.error("[Backfill] Error:", err);
    return res.status(500).json({ message: "Backfill failed", data: [] });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Guest ID Validation Middleware
// ─────────────────────────────────────────────────────────────────────────────

const validateGuestId = (req, res, next) => {
  if (!req.userData && !req.body.guestId && !req.query.guestId) {
    return res.status(400).json({
      message: "Guest ID is required for guest operations",
      data:    [],
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  addToShoppingCart,
  getMyShoppingCart,
  removeMyShoppingCart,
  updateCartItemQuantity,
  mergeCartsAfterLogin,
  backfillCartContacts,
  validateGuestId,
};