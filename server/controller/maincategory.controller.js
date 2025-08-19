const { ADD_MAIN_CATEGORY, FAILED_MAIN_CATEGORY, GET_FAILED_MAIN_CATEGORY, GET_MAIN_CATEGORY, EDIT_MAIN_CATEGORY_SUCCESS, EDIT_MAIN_CATEGORY_FAILED, DELETE_MAIN_CATEGORY_SUCCESS, DELETE_MAIN_CATEGORY_FAILED } = require("../helper/message.helper");
const { successResponse, errorResponse } = require("../helper/response.helper");
const { MainCategorySchema, ProductSchema, SubcategorySchema } = require("./models_import");

const addmain = async (req, res) => {
  try {
    const result = await MainCategorySchema.create(req.body);
    return successResponse(res, ADD_MAIN_CATEGORY);
  } catch (err) {
    console.log(err);
    return errorResponse(res, FAILED_MAIN_CATEGORY);
  }
};

const getmain = async (req, res) => {
  try {
    const mainCategory = await MainCategorySchema.find().sort({ createdAt: -1 });
    return successResponse(res, GET_MAIN_CATEGORY, mainCategory);
  } catch (err) {
    console.log(err);
    return errorResponse(res, GET_FAILED_MAIN_CATEGORY);
  }
};

const editMain = async (req, res) => {
  const { categoryId = "" } = req.params;
  try {
    const result = await MainCategorySchema.findByIdAndUpdate(categoryId, { $set: req.body });

    return successResponse(res, EDIT_MAIN_CATEGORY_SUCCESS);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, "Duplicate Position");
    }
    return errorResponse(res, EDIT_MAIN_CATEGORY_FAILED);
  }
};

const deleteMain = async (req, res) => {
  const { categoryId = "" } = req.params;
  try {
    const linkedProducts = await ProductSchema.findOne({ category_details: categoryId });
    if (linkedProducts) {
      return errorResponse(res, "Cannot delete main category. Delete associated products first.");
    }

    const linkedSubCategories = await SubcategorySchema.findOne({ select_main_category: categoryId });
    if (linkedSubCategories) {
      return errorResponse(res, "Cannot delete main category. Delete associated subcategories first.");
    }

    await MainCategorySchema.deleteOne({ _id: categoryId });
    return successResponse(res, DELETE_MAIN_CATEGORY_SUCCESS);
  } catch (error) {
    console.log(error);
    return errorResponse(res, DELETE_MAIN_CATEGORY_FAILED);
  }
};

const getAllCategory = async (req, res) => {
  try {
    const result = await MainCategorySchema.aggregate([
      {
        $lookup: {
          from: "sub category",
          localField: "_id",
          foreignField: "select_main_category",
          as: "sub_categories_details",
        },
      },

      {
        $lookup: {
          from: "product",
          localField: "_id",
          foreignField: "category_details",
          as: "product_details",
        },
      },
    ]);

    successResponse(res, "Fetched all categories with subcategories, subproducts, and products", result);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

module.exports = {
  addmain,
  getmain,
  editMain,
  deleteMain,
  getAllCategory,
};
