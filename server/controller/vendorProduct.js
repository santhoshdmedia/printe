const _ = require("lodash");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { ProductVendorSchema } = require("./models_import");
const {
  INVALID_ACCOUNT_DETAILS,
  INCORRECT_PASSWORD,
  LOGIN_SUCCESS,
  PASSWORD_CHANGED_SUCCESSFULLY,
  SIGNUP_SUCCESS,
  PASSWORD_CHANGED_FAILED,
  CLIENT_USERS_GETTING_SUCESS,
  CLIENT_USERS_GETTING_FAILED,
  CLIENT_USER_UPDATED_SUCCESS,
  CLIENT_USER_UPDATED_FAILED,
  CLIENT_USER_DELETED_SUCCESS,
  CLIENT_USER_DELETED_FAILED,
  CLIENT_USER_ACCOUNT_ALREADY_EXISTS,
} = require("../helper/message.helper");

const createvendorProduct = async (req, res) => {
  try {
    const result = await ProductVendorSchema.create(req.body);
    successResponse(res, "Vendor product Created Successfully", result);
  } catch (err) {
    errorResponse(
      res,
      "Something went wrong while creating the vendor product"
    );
  }
};
const getAllVendorProduct = async (req, res) => {
  try {
     const result = await ProductVendorSchema.find({});
    return successResponse(res, successResponse, result);
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    return errorResponse(res, errorResponse);
  }
};
const getSingleVendorProduct = async (req, res) => {
  try {
     const result = await ProductVendorSchema.findById(
      req.params.id
    );
    return successResponse(res, successResponse, result);
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    return errorResponse(res, errorResponse);
  }
};
const updatevendorProduct = async (req, res) => {
  try {
    const result = await ProductVendorSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    successResponse(res, "Vendor product updated Successfully", result);
  } catch (err) {
    errorResponse(
      res,
      "Something went wrong while updating the vendor product"
    );
  }
};
const deletevendorProduct = async (req, res) => {
  try {
    const product = await ProductVendorSchema.findOne({
      _id: req.params.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await ProductVendorSchema.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const togglevendorProductStatus = async (req, res) => {
  try {
    const product = await ProductVendorSchema.findOne({
      _id: req.params.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.status = product.status === "active" ? "inactive" : "active";
    await product.save();

    res.json({
      success: true,
      message: `Product ${
        product.status === "active" ? "activated" : "deactivated"
      } successfully`,
      product,
    });
  } catch (error) {
    console.error("Toggle product status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getvendorProductStats = async (req, res) => {
  try {
    const stats = await ProductVendorSchema.aggregate([
      
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          inactive: {
            $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
          },
          draft: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          totalStock: { $sum: "$quantity" },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      active: 0,
      inactive: 0,
      draft: 0,
      totalStock: 0,
    };

    res.json({
      success: true,
      stats: result,
    });
  } catch (error) {
    console.error("Get product stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export the correct function name
module.exports = {
  createvendorProduct, // Changed from addVendors to addVendor
  updatevendorProduct,
  deletevendorProduct,
  togglevendorProductStatus,
  getvendorProductStats,
  getAllVendorProduct,
  getSingleVendorProduct
};
