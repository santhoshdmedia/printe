const { default: mongoose } = require("mongoose");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { ProductSchema, SubcategorySchema } = require("./models_import");
const { ObjectId } = mongoose.Types;

const getAllCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await SubcategorySchema.aggregate([
      {
        $match: { select_main_category: new ObjectId(id) },
      },
      {
        $lookup: {
          from: "product",
          let: { subcategoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$sub_category_details", "$$subcategoryId"] },
              },
            },
            {
              $lookup: {
                from: "main category",
                localField: "category_details",
                foreignField: "_id",
                as: "category_details",
              },
            },
            {
              $unwind: {
                path: "$category_details",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "sub category",
                localField: "sub_category_details",
                foreignField: "_id",
                as: "sub_category_details",
              },
            },
            {
              $unwind: {
                path: "$sub_category_details",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "product",
        },
      },
    ]);

    successResponse(res, "", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, err);
  }
};

const getAllSubCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await ProductSchema.aggregate([
      {
        $match: { sub_category_details: new ObjectId(id) },
      },
      {
        $lookup: {
          from: "main category",
          localField: "category_details",
          foreignField: "_id",
          as: "category_details",
        },
      },
      {
        $unwind: {
          path: "$category_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "sub category",
          localField: "sub_category_details",
          foreignField: "_id",
          as: "sub_category_details",
        },
      },
      {
        $unwind: {
          path: "$sub_category_details",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    console.log(result);
    successResponse(res, "", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, err);
  }
};

module.exports = { getAllCategoryProducts, getAllSubCategoryProducts };
