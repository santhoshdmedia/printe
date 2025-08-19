const { SUB_PRODUCT_CATEGORY_SUCCESS, SUB_PRODUCT_CATEGORY_FAILD, EDIT_MAIN_CATEGORY_SUCCESS, EDIT_MAIN_CATEGORY_FAILED, DELETED_SUB_PRODUCT_CATEGORY_SUCCES, DELETED_SUB_PRODUCT_CATEGORY_FAILD } = require("../helper/message.helper");
const { successResponse, errorResponse } = require("../helper/response.helper");
const { SubProductcategorySchema } = require("./models_import");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const addSubProductCategory = async (req, res) => {
  try {
    const result = await SubProductcategorySchema.create(req.body);
    successResponse(res, SUB_PRODUCT_CATEGORY_SUCCESS, result);
  } catch (err) {
    console.log(err);
    errorResponse(res, SUB_PRODUCT_CATEGORY_FAILD);
  }
};

const getSubProductCategory = async (req, res) => {
  const { filter } = req.query;
  try {
    let where = {};

    if (filter) {
      where.select_sub_category = new ObjectId(filter);
    }

    const result = await SubProductcategorySchema.aggregate([
      {
        $match: where,
      },
      {
        $lookup: {
          from: "sub category",
          localField: "select_sub_category",
          foreignField: "_id",
          as: "sub_category_details",
        },
      },
    ]);
    successResponse(res, "get successfully", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, " ");
  }
};

const deleteSubproductCategory = async (req, res) => {
  try {
    const result = await SubProductcategorySchema.findByIdAndDelete({ _id: req.params.id });
    return successResponse(res, DELETED_SUB_PRODUCT_CATEGORY_SUCCES, result);
  } catch (err) {
    console.log(err);
    return errorResponse(res, DELETED_SUB_PRODUCT_CATEGORY_FAILD);
  }
};

const editSubproductCategroy = async (req, res) => {
  try {
    const result = await SubProductcategorySchema.findByIdAndUpdate({ _id: req.params.id }, req.body);
    return successResponse(res, EDIT_MAIN_CATEGORY_SUCCESS, result);
  } catch (err) {
    console.log(err);
    errorResponse(res, EDIT_MAIN_CATEGORY_FAILED);
  }
};

module.exports = {
  addSubProductCategory,
  getSubProductCategory,
  editSubproductCategroy,
  deleteSubproductCategory,
};
