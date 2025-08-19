const { default: mongoose } = require("mongoose");
const { ADD_SUB_CATEGORY, FAILED_SUB_CATEGORY, DELETE_SUB_CATEGOYR_FAILED, DELETE_SUB_CATEGOYR_SUCCESS, EDIT_SUB_CATEGORY_FAILED, EDIT_SUB_CATEGORY_SUCCESS } = require("../helper/message.helper");
const { successResponse, errorResponse } = require("../helper/response.helper");
const { SubcategorySchema } = require("./models_import");
const { ObjectId } = mongoose.Types;

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
    if (filter) where.select_main_category = new ObjectId(filter);

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

const getAllSubProduct = async (req, res) => {
  const { id } = req.params;
  const { limitVariants = 1 } = req.query; // Default limit for variants_price

  try {
    let where = {};

    if (id) {
      where._id = new ObjectId(id);
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
                  "$$product", // Retains all fields from the product document
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

    successResponse(res, "Successfully retrieved", result);
  } catch (err) {
    console.error("Error in getAllSubProduct:", err);
    errorResponse(res, "Failed to retrieve data");
  }
};

module.exports = {
  addsub,
  getsub,
  deletesubcategory,
  editsubcategory,
  getAllSubProduct,
};
