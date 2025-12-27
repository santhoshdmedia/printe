const { ProductSchema, UserSchema, BannerSchemas, CustomerSectionSchema, ProdutDescriptionSchema } = require("./models_import");
const { successResponse, errorResponse } = require("../helper/response.helper");
const { PRODUCT_ADDED_SUCCESS, PRODUCT_ADDED_FAILED, PRODUCT_GET_SUCCESS, PRODUCT_GET_FAILED, PRODUCT_DELETED_SUCCESS, PRODUCT_DELETED_FAILED, PRODUCT_EDITED_SUCCESS, PRODUCT_EDITED_FAILED, PRODUCT_SEO_TITLE_ALREADYUSED } = require("../helper/message.helper");
const { default: mongoose } = require("mongoose");
const { ObjectId } = mongoose.Types;
const _ = require("lodash");

const addProduct = async (req, res) => {
  try {
    if (!_.get(req, "body.is_cloned", false)) {
      const check = await ProductSchema.findOne({ seo_url: req.body.seo_url });
      if (!_.isEmpty(check)) {
        return errorResponse(res, PRODUCT_SEO_TITLE_ALREADYUSED);
      }
    }
    const result = await ProductSchema.create(req.body);
    successResponse(res, PRODUCT_ADDED_SUCCESS, result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, PRODUCT_ADDED_FAILED);
  }
};

// const getProduct = async (req, res) => {
//   const { filterByProduct_category = "", filterByType = "", filterByProduct_subcategory = "", search, newArrival = false, popular = false, onlyForToday = false, isAdmin = false, limitVariants = 1, id_list, vendor_filter } = req.query;
//   const { id } = req.params;

//   try {
//     let where = {};
//     let project = {
//       variants_price: { $slice: parseInt(limitVariants, 10) },
//     };
//     if (isAdmin) project = {};

//     if (id_list) {
//       const list = JSON.parse(id_list);

//       where.seo_url = {
//         $in: list.map((id) => id),
//       };
//     }

//     if (filterByType) where.type = filterByType;
//     if (filterByProduct_category) where.category_details = new ObjectId(filterByProduct_category);
//     if (filterByProduct_subcategory) where.sub_category_details = new ObjectId(filterByProduct_subcategory);
//     if (vendor_filter) where.vendor_details = new ObjectId(vendor_filter);

//     if (popular) {
//       where.label = { $in: ["popular"] };
//     } else if (newArrival) {
//       where.label = { $in: ["new"] };
//     } else if (onlyForToday) {
//       where.label = { $in: ["only-for-today"] };
//     }

//     if (search) {
//       where.name = { $regex: search, $options: "i" };
//     }
//     if (id) {
//       where.seo_url = id;
//     }

//     const result = await ProductSchema.find(where).populate("vendor_details", "vendor_name").populate("category_details", "").populate("sub_category_details", "");
//     return successResponse(res, PRODUCT_GET_SUCCESS, result);
//   } catch (error) {
//     console.error("Error in getProduct:", error);
//     return errorResponse(res, PRODUCT_GET_FAILED);
//   }
// };

const getAllProductsSimple = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      vendor,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'active'
    } = req.query;

    // Build filter
    const filter = { status };
    
    if (category) filter.category_details = new ObjectId(category);
    if (subcategory) filter.sub_category_details = new ObjectId(subcategory);
    if (vendor) filter.vendor_details = new ObjectId(vendor);
    
    if (minPrice || maxPrice) {
      filter.single_product_price = {};
      if (minPrice) filter.single_product_price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.single_product_price.$lte = parseFloat(maxPrice);
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { product_codeS_NO: { $regex: search, $options: 'i' } },
        { Vendor_Code: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const products = await ProductSchema.find(filter)
      .populate('vendor_details', 'vendor_name')
      .populate('category_details', 'name')
      .populate('sub_category_details', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalCount = await ProductSchema.countDocuments(filter);

    const response = {
      success: true,
      count: products.length,
      total: totalCount,
      page: parseInt(page),
      pages: Math.ceil(totalCount / limit),
      data: products
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in getAllProductsSimple:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products'
    });
  }
};

const getProduct = async (req, res) => {
  const { 
    filterByProduct_category = "", 
    filterByType = "", 
    filterByProduct_subcategory = "", 
    search, 
    newArrival = false, 
    popular = false, 
    onlyForToday = false, 
    isAdmin = false, 
    limitVariants = 1, 
    id_list, 
    vendor_filter 
  } = req.query;
  const { id } = req.params;

  try {
    let where = {};
    let project = {
      // Removed variants_price slicing since we're using single_product_price
    };
    if (isAdmin) project = {};

    if (id_list) {
      const list = JSON.parse(id_list);
      where.seo_url = {
        $in: list.map((id) => id),
      };
    }

    if (filterByType) where.type = filterByType;
    if (filterByProduct_category) where.category_details = new ObjectId(filterByProduct_category);
    if (filterByProduct_subcategory) where.sub_category_details = new ObjectId(filterByProduct_subcategory);
    if (vendor_filter) where.vendor_details = new ObjectId(vendor_filter);

    if (popular) {
      where.label = { $in: ["popular"] };
    } else if (newArrival) {
      where.label = { $in: ["new"] };
    } else if (onlyForToday) {
      where.label = { $in: ["only-for-today"] };
    }

    // Updated search condition to include product_codeS_NO and Vendor_Code
    if (search) {
      where.$or = [
        { name: { $regex: search, $options: "i" } },
        { product_codeS_NO: { $regex: search, $options: "i" } },
        { Vendor_Code: { $regex: search, $options: "i" } }
      ];
    }

    if (id) {
      where.seo_url = id;
    }

    const result = await ProductSchema.find(where)
      .populate("vendor_details", "vendor_name")
      .populate("category_details", "")
      .populate("sub_category_details", "");
    
    return successResponse(res, PRODUCT_GET_SUCCESS, result);
  } catch (error) {
    console.error("Error in getProduct:", error);
    return errorResponse(res, PRODUCT_GET_FAILED);
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await ProductSchema.findOne({ $and: [{ seo_url: req.body.seo_url }, { _id: { $ne: id } }, { parent_product_id: { $ne: id } }] });
    if (!_.isEmpty(result)) {
      return errorResponse(res, PRODUCT_SEO_TITLE_ALREADYUSED);
    }
    const checkCloneAVailable = await ProductSchema.find({ parent_product_id: id });

    if (!_.isEmpty(checkCloneAVailable)) {
      let ids = checkCloneAVailable.map((res) => {
        return res._id;
      });
      await ProductSchema.updateMany({ _id: ids }, req.body);
    }

    await ProductSchema.findByIdAndUpdate({ _id: id }, req.body);

    return successResponse(res, PRODUCT_EDITED_SUCCESS);
  } catch (error) {
    console.log(error);
    return errorResponse(res, PRODUCT_EDITED_FAILED);
  }
};

const deleteProduct = async (req, res) => {
  const { product_id, is_cloned } = JSON.parse(req.params.id);
  try {
    if (!is_cloned) {
      const linkBanner = await BannerSchemas.findOne({ banner_products: product_id });

      if (linkBanner) {
        return errorResponse(res, "Cannot delete product. Delete associated banner first.");
      }

      const linkcustomer = await CustomerSectionSchema.findOne({ section_products: product_id });
      if (linkcustomer) {
        return errorResponse(res, "Cannot delete product. Delete associated customer section first.");
      }

      await ProductSchema.deleteMany({ parent_product_id: product_id });
    }

    await ProductSchema.findByIdAndDelete({ _id: product_id });

    return successResponse(res, PRODUCT_DELETED_SUCCESS);
  } catch (error) {
    console.log(error);
    return errorResponse(res, PRODUCT_DELETED_FAILED);
  }
};

const getProductVariantPrice = async (req, res) => {
  const { id } = req.params;
  const { key } = req.body;
  try {
    const product = await ProductSchema.findById(id);

    if (!product) {
      return errorResponse(res, "Product not found.");
    }

    const variantPrice = product?.variants_price?.find((data) => data.key === key);

    if (!variantPrice) {
      return errorResponse(res, "No matching variant price found.");
    }

    return successResponse(res, "Success", variantPrice);
  } catch (error) {
    console.log(error);
    return errorResponse(res, "An error occurred. Please try again.");
  }
};

const getHistoryProducts = async (req, res) => {
  try {
    const { id } = req.userData;

    const result = await UserSchema.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "product",
          localField: "history_data",
          foreignField: "_id",
          as: "product_details",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
        },
      },
    ]);

    successResponse(res, "", result);
  } catch (err) {
    errorResponse(res, "An error occurred. Please try again.");
  }
};

const getBannerProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await BannerSchemas.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "product",
          localField: "banner_products",
          foreignField: "_id",
          as: "product_details",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
        },
      },
    ]);
    successResponse(res, "", result);
  } catch (err) {
    errorResponse(res, "An error occurred. Please try again.");
  }
};

const addProductDescription = async (req, res) => {
  try {
    await ProdutDescriptionSchema.create(req.body);

    successResponse(res, "Product Description Successfully Added");
  } catch (err) {
    errorResponse(res, "Failed to add product description");
  }
};

const getProductDescription = async (req, res) => {
  try {
    const { id } = req.params;

    let where = {};

    if (id !== "null") {
      where.product_id = new ObjectId(id);
    }

    const result = await ProdutDescriptionSchema.aggregate([
      { $match: where },
      {
        $lookup: {
          from: "product",
          localField: "product_id",
          foreignField: "_id",
          as: "product_details",
          pipeline: [
            {
              $project: {
                name: 1,
                images: 1,
                seo_url: 1,
              },
            },
          ],
        },
      },
    ]);

    successResponse(res, "", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, "");
  }
};

const updateProductDescription = async (req, res) => {
  try {
    const { id } = req.params;

    await ProdutDescriptionSchema.findByIdAndUpdate({ _id: id }, req.body);

    successResponse(res, "Product Description Successfully Updated");
  } catch (err) {
    errorResponse(res, "Failed to Update product description");
  }
};

const deleteProductDescription = async (req, res) => {
  try {
    const { id } = req.params;
    await ProdutDescriptionSchema.findByIdAndDelete({ _id: id });
    successResponse(res, "Product Description Successfully Deleted");
  } catch (err) {
    errorResponse(res, "Failed to delete product description");
  }
};

module.exports = {
  addProduct,
  getProduct,
  getAllProductsSimple,
  deleteProduct,
  editProduct,
  getProductVariantPrice,
  getHistoryProducts,
  getBannerProducts,
  addProductDescription,
  getProductDescription,
  updateProductDescription,
  deleteProductDescription,
};
