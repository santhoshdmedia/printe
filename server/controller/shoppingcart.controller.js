const { default: mongoose } = require("mongoose");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { ShoppingCardSchema } = require("./models_import");

const addToShoppingCart = async (req, res) => {
  try {
    const { id } = req.userData;
    req.body.user_id = id;
    await ShoppingCardSchema.create(req.body);
    const currentLength = await ShoppingCardSchema.countDocuments();
    successResponse(res, "Product added to cart successfully", { data: currentLength });
  } catch (err) {
    errorResponse(res, "Error adding to shopping cart");
  }
};

const getMyShoppingCart = async (req, res) => {
  try {
    const { id } = req.userData;

    const result = await ShoppingCardSchema.aggregate([
      {
        $match: { user_id: new mongoose.Types.ObjectId(id) },
      },
    ]);

    successResponse(res, "", result);
  } catch (err) {
    errorResponse(res, "Error adding to shopping cart");
  }
};

// backend controller
const removeMyShoppingCart = async (req, res) => {
  try {
    const { ids } = req.body; // Now expecting an array of IDs
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, "No cart items provided for removal");
    }

    await ShoppingCardSchema.deleteMany({ 
      _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) } 
    });
    
    successResponse(res, "Products removed from shopping cart");
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to remove products from shopping cart");
  }
};



module.exports = { addToShoppingCart, getMyShoppingCart, removeMyShoppingCart };
