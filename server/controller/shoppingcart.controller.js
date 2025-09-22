const { default: mongoose } = require("mongoose");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { ShoppingCardSchema } = require("./models_import");

// Generate a unique guest ID
const generateGuestId = () => {
  return new mongoose.Types.ObjectId().toString();
};

// Middleware to handle guest ID
const attachGuestId = (req, res, next) => {
  if (!req.userData) {
    req.guestId = req.headers['x-guest-id'] || req.cookies?.guestId || generateGuestId();
    
    res.cookie('guestId', req.guestId, { 
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true 
    });
  }
  next();
};

const addToShoppingCart = async (req, res) => {
  try {
    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier = req.userData.id;
      identifierField = 'user_id';
    } else {
      userIdentifier = req.guestId;
      identifierField = 'guest_id';
    }

    // Create cart item with default values for required fields
    const cartItem = {
      [identifierField]: userIdentifier,
      product_id: req.body.product_id,
      quantity: req.body.quantity || 1,
      
      // Set default values for required fields
      final_total: req.body.final_total || 0,
      cgst: req.body.cgst || 0,
      sgst: req.body.sgst || 0,
      product_seo_url: req.body.product_seo_url || '',
      product_quantity: req.body.product_quantity || req.body.quantity || 1,
      product_price: req.body.product_price || 0,
      subcategory_name: req.body.subcategory_name || '',
      category_name: req.body.category_name || '',
      product_name: req.body.product_name || 'Product',
      product_image: req.body.product_image || '',
      
      // Add optional fields
      ...(req.body.size && { size: req.body.size }),
      ...(req.body.color && { color: req.body.color }),
      created_at: new Date(),
      updated_at: new Date()
    };

    // Check if item already exists in cart
    const existingItem = await ShoppingCardSchema.findOne({
      [identifierField]: userIdentifier,
      product_id: req.body.product_id,
      ...(req.body.size && { size: req.body.size }),
      ...(req.body.color && { color: req.body.color })
    });

    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += (req.body.quantity || 1);
      existingItem.updated_at = new Date();
      await existingItem.save();
    } else {
      // Create new cart item
      await ShoppingCardSchema.create(cartItem);
    }

    // Get current cart count
    const cartCount = await ShoppingCardSchema.countDocuments({ 
      [identifierField]: userIdentifier 
    });

    successResponse(res, "Product added to cart successfully", { 
      data: cartCount,
      guestId: !req.userData ? req.guestId : undefined 
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    errorResponse(res, "Error adding to shopping cart");
  }
};

const getMyShoppingCart = async (req, res) => {
  try {
    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier = new mongoose.Types.ObjectId(req.userData.id);
      identifierField = 'user_id';
    } else {
      userIdentifier = req.guestId;
      identifierField = 'guest_id';
    }

    const result = await ShoppingCardSchema.aggregate([
      {
        $match: { [identifierField]: identifierField === 'user_id' ? userIdentifier : userIdentifier }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product_id',
          foreignField: '_id',
          as: 'product_details'
        }
      },
      {
        $unwind: {
          path: '$product_details',
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    successResponse(res, "", result);
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error fetching shopping cart");
  }
};

const removeMyShoppingCart = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, "No cart items provided for removal");
    }

    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier = req.userData.id;
      identifierField = 'user_id';
    } else {
      userIdentifier = req.guestId;
      identifierField = 'guest_id';
    }

    await ShoppingCardSchema.deleteMany({ 
      _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) },
      [identifierField]: userIdentifier
    });
    
    successResponse(res, "Products removed from shopping cart");
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to remove products from shopping cart");
  }
};

const mergeCartsAfterLogin = async (req, res) => {
  try {
    const { id } = req.userData;
    const { guestId } = req.body;

    if (!guestId) {
      return errorResponse(res, "Guest ID is required");
    }

    const guestCartItems = await ShoppingCardSchema.find({ guest_id: guestId });

    if (guestCartItems.length === 0) {
      return successResponse(res, "No guest cart items to merge");
    }

    for (const guestItem of guestCartItems) {
      const existingUserItem = await ShoppingCardSchema.findOne({
        user_id: id,
        product_id: guestItem.product_id,
        size: guestItem.size,
        color: guestItem.color
      });

      if (existingUserItem) {
        existingUserItem.quantity += guestItem.quantity;
        existingUserItem.updated_at = new Date();
        await existingUserItem.save();
        await ShoppingCardSchema.findByIdAndDelete(guestItem._id);
      } else {
        await ShoppingCardSchema.findByIdAndUpdate(guestItem._id, {
          user_id: id,
          guest_id: null,
          updated_at: new Date()
        });
      }
    }

    const updatedCart = await ShoppingCardSchema.find({ user_id: id });
    successResponse(res, "Cart merged successfully", updatedCart);
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error merging carts");
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    
    if (!itemId || quantity === undefined) {
      return errorResponse(res, "Item ID and quantity are required");
    }

    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier = req.userData.id;
      identifierField = 'user_id';
    } else {
      userIdentifier = req.guestId;
      identifierField = 'guest_id';
    }

    const updatedItem = await ShoppingCardSchema.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(itemId),
        [identifierField]: userIdentifier
      },
      { 
        quantity: Math.max(0, quantity),
        updated_at: new Date()
      },
      { new: true }
    );

    if (!updatedItem) {
      return errorResponse(res, "Cart item not found");
    }

    if (quantity === 0) {
      await ShoppingCardSchema.findByIdAndDelete(itemId);
      successResponse(res, "Item removed from cart");
    } else {
      successResponse(res, "Cart item updated successfully", updatedItem);
    }
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error updating cart item");
  }
};

module.exports = { 
  addToShoppingCart, 
  getMyShoppingCart, 
  removeMyShoppingCart, 
  mergeCartsAfterLogin,
  updateCartItemQuantity,
  attachGuestId
};