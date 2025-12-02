const { ADD_MAIN_CATEGORY, FAILED_MAIN_CATEGORY, GET_FAILED_MAIN_CATEGORY, GET_MAIN_CATEGORY, EDIT_MAIN_CATEGORY_SUCCESS, EDIT_MAIN_CATEGORY_FAILED, DELETE_MAIN_CATEGORY_SUCCESS, DELETE_MAIN_CATEGORY_FAILED } = require("../helper/message.helper");
const { successResponse, errorResponse } = require("../helper/response.helper");
const { MainCategorySchema, ProductSchema, SubcategorySchema } = require("./models_import");

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) {
      return true;
    }
  }
  return false;
};

// Helper function to build query based on parameter (could be ID or slug)
const buildQuery = (param) => {
  if (isValidObjectId(param)) {
    return { _id: new ObjectId(param) };
  }
  return { slug: param };
};


const addmain = async (req, res) => {
  try {
    const result = await MainCategorySchema.create(req.body);
    return successResponse(res, ADD_MAIN_CATEGORY);
  } catch (err) {
    console.log(err);
    return errorResponse(res, FAILED_MAIN_CATEGORY);
  }
};

const getMainCategoryProductsBySlug = async (req, res) => {
  const { id, slug } = req.params;
  const { limitVariants = 1 } = req.query;

  try {
    // Build query based on id or slug
    let query;
    if (slug) {
      query = { slug };
    } else if (id) {
      const ObjectId = require('mongoose').Types.ObjectId;
      query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id };
    } else {
      return errorResponse(res, "ID or slug is required", 400);
    }

    const result = await MainCategorySchema.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: "sub category", 
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $eq: ["$select_main_category", "$$categoryId"] 
                },
                show: true // Only get visible subcategories
              }
            },
            {
              $lookup: {
                from: "products", // Your product collection name
                let: { subcategoryId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { 
                        $eq: ["$sub_category_details", "$$subcategoryId"] 
                      },
                      is_visible: true
                    }
                  },
                  {
                    $addFields: {
                      variants_price: {
                        $cond: {
                          if: { $isArray: "$variants_price" },
                          then: { $slice: ["$variants_price", parseInt(limitVariants, 10)] },
                          else: []
                        }
                      }
                    }
                  },
                  {
                    $sort: { createdAt: -1 }
                  }
                ],
                as: "products",
              }
            },
            {
              $sort: { position: 1 } // Sort subcategories by position
            }
          ],
          as: "subcategories",
        },
      },
      {
        $project: {
          _id: 1,
          category_name: 1,
          slug: 1,
          category_image: 1,
          category_banner_image: 1,
          description: 1,
          position: 1,
          createdAt: 1,
          updatedAt: 1,
          subcategories: {
            $map: {
              input: "$subcategories",
              as: "subcategory",
              in: {
                _id: "$$subcategory._id",
                sub_category_name: "$$subcategory.sub_category_name",
                slug: "$$subcategory.slug",
                sub_category_image: "$$subcategory.sub_category_image",
                sub_category_banner_image: "$$subcategory.sub_category_banner_image",
                position: "$$subcategory.position",
                products: "$$subcategory.products"
              }
            }
          }
        }
      }
    ]);

    if (result.length === 0) {
      return errorResponse(res, "Category not found", 404);
    }

    successResponse(res, "Successfully retrieved", result[0]);
  } catch (err) {
    console.error("Error in getMainCategoryProductsBySlug:", err);
    errorResponse(res, "Failed to retrieve data");
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
  getMainCategoryProductsBySlug
};
