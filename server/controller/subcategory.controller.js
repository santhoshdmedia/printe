const { default: mongoose } = require("mongoose");
const { successResponse, errorResponse } = require("../helper/response.helper");
const { MainCategorySchema } = require("./models_import");
const { SubcategorySchema } = require("./models_import");
const { SubProductSchema } = require("./models_import");
const { Product } = require("./models_import");
const { ObjectId } = mongoose.Types;

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

const addsub = async (req, res) => {
  try {
    const result = await SubcategorySchema.create(req.body);
    successResponse(res, ADD_SUB_CATEGORY, result);
  } catch (err) {
    console.log(err);
    return errorResponse(res, FAILED_SUB_CATEGORY);
  }
};

const getsub = async (req, res) => {
  const { filter } = req.query;
  try {
    let where = {};
    if (filter && isValidObjectId(filter)) {
      where.select_main_category = new ObjectId(filter);
    }

    const result = await SubcategorySchema.aggregate([
      {
        $match: where,
      },
      {
        $lookup: {
          from: "main category",
          localField: "select_main_category",
          foreignField: "_id",
          as: "main_category_details",
        },
      },
    ]);
    successResponse(res, "", result);
  } catch (err) {
    console.log(err);
    return errorResponse(res, "No data found ");
  }
};

// Get subcategory by slug
const getSubcategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const subcategory = await SubcategorySchema.findOne({ slug })
      .populate('select_main_category', 'main_category_name slug');

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: subcategory
    });

  } catch (error) {
    console.error("Error fetching subcategory by slug:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllSubProduct = async (req, res) => {
  const { id } = req.params;
  const { limitVariants = 1 } = req.query;

  try {
    let where = {};

    if (id) {
      // Handle both slug and ID
      where = buildQuery(id);
    }

    const result = await SubcategorySchema.aggregate([
      {
        $match: where,
      },
      {
        $lookup: {
          from: "sub product",
          localField: "_id",
          foreignField: "select_sub_category",
          as: "sub_product_category_details",
        },
      },
      {
        $unwind: {
          path: "$sub_product_category_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "product",
          localField: "sub_product_category_details._id",
          foreignField: "sub_product_category",
          as: "Products_details",
        },
      },
      {
        $addFields: {
          Products_details: {
            $map: {
              input: "$Products_details",
              as: "product",
              in: {
                $mergeObjects: [
                  "$$product",
                  {
                    variants_price: {
                      $slice: ["$$product.variants_price", parseInt(limitVariants, 10)],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          sub_category_name: { $first: "$sub_category_name" },
          slug: { $first: "$slug" },
          sub_category_image: { $first: "$sub_category_image" },
          select_main_category: { $first: "$select_main_category" },
          sub_product_category_details: {
            $push: {
              _id: "$sub_product_category_details._id",
              sub_product_name: "$sub_product_category_details.sub_product_name",
              sub_product_image: "$sub_product_category_details.sub_product_image",
              products: "$Products_details",
            },
          },
        },
      },
    ]);

    if (id && result.length === 0) {
      return errorResponse(res, "Subcategory not found", 404);
    }

    successResponse(res, "Successfully retrieved", id ? result[0] : result);
  } catch (err) {
    console.error("Error in getAllSubProduct:", err);
    errorResponse(res, "Failed to retrieve data");
  }
};

const getSubcategoryProductsBySlug = async (req, res) => {
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

    const result = await SubcategorySchema.aggregate([
      {
        $match: query
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
        },
      },
      {
        $project: {
          _id: 1,
          sub_category_name: 1,
          slug: 1,
          sub_category_image: 1,
          sub_category_banner_image: 1,
          position: 1,
          products: 1
        }
      }
    ]);

    if (result.length === 0) {
      return errorResponse(res, "Subcategory not found", 404);
    }

    successResponse(res, "Successfully retrieved", result[0]);
  } catch (err) {
    console.error("Error in getSubcategoryProductsBySlug:", err);
    errorResponse(res, "Failed to retrieve data");
  }
};


const deletesubcategory = async (req, res) => {
  try {
    const result = await SubcategorySchema.findByIdAndDelete({ _id: req.params.id });
    return successResponse(res, DELETE_SUB_CATEGOYR_SUCCESS, result);
  } catch (err) {
    console.log(err);
    return errorResponse(res, DELETE_SUB_CATEGOYR_FAILED);
  }
};

const editsubcategory = async (req, res) => {
  try {
    const result = await SubcategorySchema.findByIdAndUpdate({ _id: req.params.id }, req.body);
    return successResponse(res, EDIT_SUB_CATEGORY_SUCCESS, result);
  } catch (err) {
    console.log(err);
    return errorResponse(res, EDIT_SUB_CATEGORY_FAILED);
  }
};

// ==================== MAIN CATEGORY PRODUCTS ====================
const getAllCategoryProducts = async (req, res) => {
  const { id, slug } = req.params;

  try {
    // Build query based on what's provided
    let query;
    if (slug) {
      query = { slug };
    } else if (id) {
      query = buildQuery(id);
    } else {
      return errorResponse(res, "ID or slug is required", 400);
    }

    // Find main category by slug or ID
    const mainCategory = await MainCategorySchema.findOne(query);
    
    if (!mainCategory) {
      return res.status(404).json({
        success: false,
        message: 'Main category not found'
      });
    }

    // Get all products for this main category using aggregation
    const result = await MainCategorySchema.aggregate([
      {
        $match: { _id: mainCategory._id }
      },
      {
        $lookup: {
          from: "sub category",
          localField: "_id",
          foreignField: "select_main_category",
          as: "subcategories"
        }
      },
      {
        $unwind: {
          path: "$subcategories",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sub product",
          localField: "subcategories._id",
          foreignField: "select_sub_category",
          as: "subcategories.sub_products"
        }
      },
      {
        $unwind: {
          path: "$subcategories.sub_products",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "product",
          let: { subProductId: "$subcategories.sub_products._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$sub_product_category", "$$subProductId"] },
                    { $eq: ["$is_visible", true] }
                  ]
                }
              }
            },
            {
              $sort: { customer_product_price: 1 }
            }
          ],
          as: "subcategories.sub_products.products"
        }
      },
      {
        $group: {
          _id: "$_id",
          main_category_name: { $first: "$main_category_name" },
          slug: { $first: "$slug" },
          main_category_banner_image: { $first: "$main_category_banner_image" },
          subcategories: {
            $push: {
              _id: "$subcategories._id",
              sub_category_name: "$subcategories.sub_category_name",
              sub_category_slug: "$subcategories.slug",
              sub_category_image: "$subcategories.sub_category_image",
              sub_products: {
                _id: "$subcategories.sub_products._id",
                sub_product_name: "$subcategories.sub_products.sub_product_name",
                sub_product_image: "$subcategories.sub_products.sub_product_image",
                products: "$subcategories.sub_products.products"
              }
            }
          }
        }
      },
      {
        $addFields: {
          // Flatten all products from all subcategories
          all_products: {
            $reduce: {
              input: "$subcategories",
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  {
                    $ifNull: [
                      {
                        $reduce: {
                          input: "$$this.sub_products.products",
                          initialValue: [],
                          in: { $concatArrays: ["$$value", "$$this"] }
                        }
                      },
                      []
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    if (result.length === 0) {
      return successResponse(res, "No products found for this category", {
        category: {
          _id: mainCategory._id,
          name: mainCategory.main_category_name,
          slug: mainCategory.slug,
          banner_image: mainCategory.main_category_banner_image
        },
        products: [],
        subcategories: []
      });
    }

    const categoryData = result[0];
    
    // Format response
    const formattedResponse = {
      category: {
        _id: categoryData._id,
        name: categoryData.main_category_name,
        slug: categoryData.slug,
        banner_image: categoryData.main_category_banner_image
      },
      products: categoryData.all_products || [],
      subcategories: categoryData.subcategories || []
    };

    successResponse(res, "Successfully retrieved category products", formattedResponse);
  } catch (err) {
    console.error("Error in getAllCategoryProducts:", err);
    errorResponse(res, "Failed to retrieve category products");
  }
};

// ==================== SUBCATEGORY PRODUCTS ====================
const getAllSubCategoryProducts = async (req, res) => {
  const { id, slug } = req.params;

  try {
    // Build query based on what's provided
    let query;
    if (slug) {
      query = { slug };
    } else if (id) {
      query = buildQuery(id);
    } else {
      return errorResponse(res, "ID or slug is required", 400);
    }

    // Find subcategory by slug or ID
    const subcategory = await SubcategorySchema.findOne(query)
      .populate('select_main_category', 'main_category_name slug');
    
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    // Get products for this subcategory
    const result = await SubcategorySchema.aggregate([
      {
        $match: { _id: subcategory._id }
      },
      {
        $lookup: {
          from: "sub product",
          localField: "_id",
          foreignField: "select_sub_category",
          as: "sub_products"
        }
      },
      {
        $unwind: {
          path: "$sub_products",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "product",
          let: { subProductId: "$sub_products._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$sub_product_category", "$$subProductId"] },
                    { $eq: ["$is_visible", true] }
                  ]
                }
              }
            },
            {
              $sort: { customer_product_price: 1 }
            },
            {
              $addFields: {
                // Add variant min price for sorting
                variant_min_price: {
                  $min: {
                    $map: {
                      input: "$variants_price",
                      as: "variant",
                      in: "$$variant.customer_product_price"
                    }
                  }
                }
              }
            }
          ],
          as: "sub_products.products"
        }
      },
      {
        $group: {
          _id: "$_id",
          sub_category_name: { $first: "$sub_category_name" },
          slug: { $first: "$slug" },
          sub_category_image: { $first: "$sub_category_image" },
          sub_category_banner_image: { $first: "$sub_category_banner_image" },
          main_category: {
            $first: {
              _id: "$select_main_category._id",
              name: "$select_main_category.main_category_name",
              slug: "$select_main_category.slug"
            }
          },
          sub_products: {
            $push: {
              _id: "$sub_products._id",
              sub_product_name: "$sub_products.sub_product_name",
              sub_product_image: "$sub_products.sub_product_image",
              products: "$sub_products.products"
            }
          }
        }
      },
      {
        $addFields: {
          // Flatten all products from all sub-products
          all_products: {
            $reduce: {
              input: "$sub_products",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this.products"] }
            }
          }
        }
      }
    ]);

    if (result.length === 0) {
      return successResponse(res, "No products found for this subcategory", {
        subcategory: {
          _id: subcategory._id,
          name: subcategory.sub_category_name,
          slug: subcategory.slug,
          banner_image: subcategory.sub_category_banner_image,
          main_category: {
            name: subcategory.select_main_category?.main_category_name,
            slug: subcategory.select_main_category?.slug
          }
        },
        products: []
      });
    }

    const subcategoryData = result[0];
    
    // Format response
    const formattedResponse = {
      subcategory: {
        _id: subcategoryData._id,
        name: subcategoryData.sub_category_name,
        slug: subcategoryData.slug,
        image: subcategoryData.sub_category_image,
        banner_image: subcategoryData.sub_category_banner_image,
        main_category: subcategoryData.main_category
      },
      products: subcategoryData.all_products || [],
      sub_products: subcategoryData.sub_products || []
    };

    successResponse(res, "Successfully retrieved subcategory products", formattedResponse);
  } catch (err) {
    console.error("Error in getAllSubCategoryProducts:", err);
    errorResponse(res, "Failed to retrieve subcategory products");
  }
};

// ==================== GET CATEGORY BY SLUG ====================
const getCategoryBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const category = await MainCategorySchema.findOne({ slug });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get subcategories for this main category
    const subcategories = await SubcategorySchema.find({
      select_main_category: category._id
    }).select('sub_category_name slug sub_category_image position show');

    const response = {
      category: {
        _id: category._id,
        name: category.main_category_name,
        slug: category.slug,
        banner_image: category.main_category_banner_image,
        created_at: category.createdAt,
        updated_at: category.updatedAt
      },
      subcategories: subcategories
    };

    successResponse(res, "Successfully retrieved category", response);
  } catch (err) {
    console.error("Error in getCategoryBySlug:", err);
    errorResponse(res, "Failed to retrieve category");
  }
};

// ==================== GET ALL CATEGORIES ====================
const getAllCategory = async (req, res) => {
  try {
    const categories = await MainCategorySchema.aggregate([
      {
        $match: { show: true }
      },
      {
        $lookup: {
          from: "sub category",
          let: { mainCategoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$select_main_category", "$$mainCategoryId"] },
                    { $eq: ["$show", true] }
                  ]
                }
              }
            },
            {
              $sort: { position: 1 }
            },
            {
              $project: {
                _id: 1,
                sub_category_name: 1,
                slug: 1,
                sub_category_image: 1,
                position: 1
              }
            }
          ],
          as: "subcategories"
        }
      },
      {
        $sort: { position: 1 }
      },
      {
        $project: {
          _id: 1,
          main_category_name: 1,
          slug: 1,
          main_category_banner_image: 1,
          position: 1,
          show: 1,
          subcategories: 1,
          created_at: "$createdAt",
          updated_at: "$updatedAt"
        }
      }
    ]);

    successResponse(res, "Successfully retrieved all categories", categories);
  } catch (err) {
    console.error("Error in getAllCategory:", err);
    errorResponse(res, "Failed to retrieve categories");
  }
};

// ==================== LEGACY COMPATIBLE FUNCTION ====================
// This function supports both ID and slug for backward compatibility
const getCategoryProductsLegacy = async (req, res) => {
  const { slugOrId } = req.params;

  try {
    let query;
    
    // Check if parameter is an ObjectId
    if (isValidObjectId(slugOrId)) {
      query = { _id: new ObjectId(slugOrId) };
    } else {
      query = { slug: slugOrId };
    }

    // Try to find by ID first, then by slug
    const category = await MainCategorySchema.findOne(query);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get products for this category
    const subcategories = await SubcategorySchema.find({
      select_main_category: category._id
    }).select('_id');

    const subcategoryIds = subcategories.map(sub => sub._id);
    
    const subProducts = await SubProductSchema.find({
      select_sub_category: { $in: subcategoryIds }
    }).select('_id');

    const subProductIds = subProducts.map(sp => sp._id);
    
    const products = await Product.find({
      sub_product_category: { $in: subProductIds },
      is_visible: true
    }).sort({ customer_product_price: 1 });

    const response = {
      success: true,
      message: "Successfully retrieved category products",
      data: {
        category: {
          _id: category._id,
          name: category.main_category_name,
          slug: category.slug
        },
        products: products,
        total_products: products.length
      }
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error in getCategoryProductsLegacy:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve category products"
    });
  }
};

module.exports = {
  getAllCategoryProducts,
  getAllSubCategoryProducts,
  getCategoryBySlug,
  getAllCategory,
  getCategoryProductsLegacy,
  addsub,
  getsub,
  editsubcategory,
  deletesubcategory,
  getSubcategoryProductsBySlug,
  getSubcategoryBySlug,
  isValidObjectId,
  buildQuery,
  getAllSubProduct
};