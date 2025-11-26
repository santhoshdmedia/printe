const { default: mongoose } = require("mongoose");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { ShoppingCardSchema } = require("./models_import");

const addToShoppingCart = async (req, res) => {
  try {
    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier = req.userData.id;
      identifierField = 'user_id';
    } else {
      userIdentifier = req.body.guestId;
      identifierField = 'guest_id';
      
      if (!userIdentifier) {
        return errorResponse(res, "Guest ID is required for guest users");
      }
    }

    // Validate required fields
    if (!req.body.product_id) {
      return errorResponse(res, "Product ID is required");
    }

    // Create cart item with default values for required fields
    const cartItem = {
      [identifierField]: userIdentifier,
      product_id: new mongoose.Types.ObjectId(req.body.product_id),
      quantity: req.body.quantity || 1,
      
      // Set default values for required fields
      final_total: req.body.final_total || 0,
      cgst: req.body.cgst || 0,
      sgst: req.body.sgst || 0,
      MRP_savings: req.body.MRP_savings || 0,
      TotalSavings: req.body.TotalSavings || 0,
      product_design_file: req.body.product_design_file || "",
      product_seo_url: req.body.product_seo_url || '',
      product_quantity: req.body.product_quantity || req.body.quantity || 1,
      product_price: req.body.product_price || 0,
      subcategory_name: req.body.subcategory_name || '',
      category_name: req.body.category_name || '',
      product_name: req.body.product_name || 'Product',
      product_image: req.body.product_image || '',
      FreeDelivery: req.body.FreeDelivery || false,
      noCustomtation: req.body.noCustomtation || false,
      DeliveryCharges: req.body.DeliveryCharges || 0,

      // Add optional fields
      ...(req.body.size && { size: req.body.size }),
      ...(req.body.color && { color: req.body.color }),
      ...(req.body.instructions && { instructions: req.body.instructions }),
      ...(req.body.product_variants && { product_variants: req.body.product_variants }),
      created_at: new Date(),
      updated_at: new Date()
    };

    // Check if item already exists in cart
    const existingItemQuery = {
      [identifierField]: userIdentifier,
      product_id: new mongoose.Types.ObjectId(req.body.product_id)
    };

    // Add variant filters if they exist
    if (req.body.size) existingItemQuery.size = req.body.size;
    if (req.body.color) existingItemQuery.color = req.body.color;

    const existingItem = await ShoppingCardSchema.findOne(existingItemQuery);

    let result;
    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += (req.body.quantity || 1);
      existingItem.updated_at = new Date();
      result = await existingItem.save();
    } else {
      // Create new cart item
      result = await ShoppingCardSchema.create(cartItem);
    }

    // Get current cart count
    const cartCount = await ShoppingCardSchema.countDocuments({ 
      [identifierField]: userIdentifier 
    });

    successResponse(res, "Product added to cart successfully", { 
      cartCount: cartCount,
      guestId: !req.userData ? userIdentifier : undefined 
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
      userIdentifier = req.query.guestId;
      identifierField = 'guest_id';
      
      if (!userIdentifier) {
        return errorResponse(res, "Guest ID is required for guest users");
      }
    }

    const matchCondition = { [identifierField]: userIdentifier };

    const result = await ShoppingCardSchema.aggregate([
      {
        $match: matchCondition
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
      },
      {
        $project: {
          _id: 1,
          product_id: 1,
          product_design_file: 1,
          FreeDelivery: 1,
          noCustomtation: 1,
          DeliveryCharges: 1,
          product_image: 1,
          product_name: 1,
          category_name: 1,
          subcategory_name: 1,
          product_price: 1,
          MRP_savings: 1,
          TotalSavings: 1,
          product_quantity: 1,
          product_seo_url: 1,
          product_variants: 1,
          sgst: 1,
          cgst: 1,
          final_total: 1,
          quantity: 1,
          size: 1,
          color: 1,
          instructions: 1,
          createdAt: "$created_at",
          updatedAt: "$updated_at",
          __v: 1
        }
      }
    ]);

    // Transform the result to match the exact format you want
    const transformedResult = result.map(item => ({
      _id: item._id,
      product_id: item.product_id,
      product_design_file: item.product_design_file || "",
      FreeDelivery: item.FreeDelivery || false,
      noCustomtation: item.noCustomtation || false,
      DeliveryCharges: item.DeliveryCharges || 0,
      product_image: item.product_image || "",
      product_name: item.product_name || "",
      category_name: item.category_name || "",
      subcategory_name: item.subcategory_name || "",
      product_price: item.product_price || 0,
      MRP_savings: typeof item.MRP_savings === 'number' ? item.MRP_savings.toFixed(2) : "0.00",
      TotalSavings: typeof item.TotalSavings === 'number' ? item.TotalSavings.toFixed(2) : "0.00",
      product_quantity: item.product_quantity ? item.product_quantity.toString() : "1",
      product_seo_url: item.product_seo_url || "",
      product_variants: item.product_variants || [],
      sgst: item.sgst ? item.sgst.toString() : "0",
      cgst: item.cgst ? item.cgst.toString() : "0",
      final_total: item.final_total || 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      __v: item.__v || 0
    }));

    // Return in the exact format you specified
    return res.status(200).json({
      message: "",
      data: transformedResult
    });

  } catch (err) {
    console.error("Get cart error:", err);
    return res.status(500).json({
      message: "Error fetching shopping cart",
      data: []
    });
  }
};

const removeMyShoppingCart = async (req, res) => {
  try {
    const { ids, guestId } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, "No cart items provided for removal");
    }

    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier = req.userData.id;
      identifierField = 'user_id';
    } else {
      userIdentifier = guestId;
      identifierField = 'guest_id';
      
      if (!userIdentifier) {
        return errorResponse(res, "Guest ID is required for guest users");
      }
    }

    const deleteCondition = {
      _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) },
      [identifierField]: userIdentifier
    };

    await ShoppingCardSchema.deleteMany(deleteCondition);
    
    // Return success response in the same format
    return res.status(200).json({
      message: "Products removed from shopping cart",
      data: []
    });
  } catch (err) {
    console.error("Remove cart error:", err);
    return res.status(500).json({
      message: "Failed to remove products from shopping cart",
      data: []
    });
  }
};

const mergeCartsAfterLogin = async (req, res) => {
  try {
    const userId = req.userData?.id;
    const { guestId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        data: []
      });
    }

    if (!guestId) {
      return res.status(400).json({
        message: "Guest ID is required",
        data: []
      });
    }

    const guestCartItems = await ShoppingCardSchema.find({ guest_id: guestId });

    for (const guestItem of guestCartItems) {
      const existingUserItemQuery = {
        user_id: userId,
        product_id: guestItem.product_id
      };

      // Add variant filters if they exist
      if (guestItem.size) existingUserItemQuery.size = guestItem.size;
      if (guestItem.color) existingUserItemQuery.color = guestItem.color;

      const existingUserItem = await ShoppingCardSchema.findOne(existingUserItemQuery);

      if (existingUserItem) {
        // Merge quantities
        existingUserItem.quantity += guestItem.quantity;
        existingUserItem.updated_at = new Date();
        await existingUserItem.save();
        
        // Remove the guest item
        await ShoppingCardSchema.findByIdAndDelete(guestItem._id);
      } else {
        // Convert guest item to user item
        await ShoppingCardSchema.findByIdAndUpdate(guestItem._id, {
          user_id: userId,
          guest_id: null,
          updated_at: new Date()
        });
      }
    }

    const updatedCart = await ShoppingCardSchema.find({ user_id: userId });
    
    // Transform the updated cart to match the desired format
    const transformedCart = updatedCart.map(item => ({
      _id: item._id,
      product_id: item.product_id,
      product_design_file: item.product_design_file || "",
      FreeDelivery: item.FreeDelivery || false,
      noCustomtation: item.noCustomtation || false,
      DeliveryCharges: item.DeliveryCharges || 0,
      product_image: item.product_image || "",
      product_name: item.product_name || "",
      category_name: item.category_name || "",
      subcategory_name: item.subcategory_name || "",
      product_price: item.product_price || 0,
      MRP_savings: typeof item.MRP_savings === 'number' ? item.MRP_savings.toFixed(2) : "0.00",
      TotalSavings: typeof item.TotalSavings === 'number' ? item.TotalSavings.toFixed(2) : "0.00",
      product_quantity: item.product_quantity ? item.product_quantity.toString() : "1",
      product_seo_url: item.product_seo_url || "",
      product_variants: item.product_variants || [],
      sgst: item.sgst ? item.sgst.toString() : "0",
      cgst: item.cgst ? item.cgst.toString() : "0",
      final_total: item.final_total || 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      __v: item.__v || 0
    }));

    return res.status(200).json({
      message: "Cart merged successfully",
      data: transformedCart
    });
  } catch (err) {
    console.error("Merge cart error:", err);
    return res.status(500).json({
      message: "Error merging carts",
      data: []
    });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId, quantity, guestId } = req.body;
    
    if (!itemId || quantity === undefined) {
      return res.status(400).json({
        message: "Item ID and quantity are required",
        data: []
      });
    }

    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier = req.userData.id;
      identifierField = 'user_id';
    } else {
      userIdentifier = guestId;
      identifierField = 'guest_id';
      
      if (!userIdentifier) {
        return res.status(400).json({
          message: "Guest ID is required for guest users",
          data: []
        });
      }
    }

    const updateCondition = {
      _id: new mongoose.Types.ObjectId(itemId),
      [identifierField]: userIdentifier
    };

    const updatedItem = await ShoppingCardSchema.findOneAndUpdate(
      updateCondition,
      { 
        quantity: Math.max(0, quantity),
        product_quantity: Math.max(0, quantity),
        updated_at: new Date()
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        message: "Cart item not found",
        data: []
      });
    }

    if (quantity === 0) {
      await ShoppingCardSchema.findByIdAndDelete(itemId);
      return res.status(200).json({
        message: "Item removed from cart",
        data: []
      });
    } else {
      // Transform the updated item to match the desired format
      const transformedItem = {
        _id: updatedItem._id,
        product_id: updatedItem.product_id,
        product_design_file: updatedItem.product_design_file || "",
        FreeDelivery: updatedItem.FreeDelivery || false,
        noCustomtation: updatedItem.noCustomtation || false,
        DeliveryCharges: updatedItem.DeliveryCharges || 0,
        product_image: updatedItem.product_image || "",
        product_name: updatedItem.product_name || "",
        category_name: updatedItem.category_name || "",
        subcategory_name: updatedItem.subcategory_name || "",
        product_price: updatedItem.product_price || 0,
        MRP_savings: typeof updatedItem.MRP_savings === 'number' ? updatedItem.MRP_savings.toFixed(2) : "0.00",
        TotalSavings: typeof updatedItem.TotalSavings === 'number' ? updatedItem.TotalSavings.toFixed(2) : "0.00",
        product_quantity: updatedItem.product_quantity ? updatedItem.product_quantity.toString() : "1",
        product_seo_url: updatedItem.product_seo_url || "",
        product_variants: updatedItem.product_variants || [],
        sgst: updatedItem.sgst ? updatedItem.sgst.toString() : "0",
        cgst: updatedItem.cgst ? updatedItem.cgst.toString() : "0",
        final_total: updatedItem.final_total || 0,
        createdAt: updatedItem.created_at,
        updatedAt: updatedItem.updated_at,
        __v: updatedItem.__v || 0
      };

      return res.status(200).json({
        message: "Cart item updated successfully",
        data: [transformedItem]
      });
    }
  } catch (err) {
    console.error("Update cart error:", err);
    return res.status(500).json({
      message: "Error updating cart item",
      data: []
    });
  }
};

// Remove guest ID validation middleware since we're generating from frontend
const validateGuestId = (req, res, next) => {
  if (!req.userData && !req.body.guestId && !req.query.guestId) {
    return res.status(400).json({
      message: "Guest ID is required for guest operations",
      data: []
    });
  }
  next();
};

module.exports = { 
  addToShoppingCart, 
  getMyShoppingCart, 
  removeMyShoppingCart, 
  mergeCartsAfterLogin,
  updateCartItemQuantity,
  validateGuestId
};