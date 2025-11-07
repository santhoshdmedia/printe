const { PRODUCT_GET_SUCCESS } = require("../helper/message.helper");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { ProductSchema, BannerSchemas } = require("./models_import");

const addBanners = async (req, res) => {
  try {
    const result = await BannerSchemas.create(req.body);
    successResponse(res, "Banner Created Successfully");
  } catch (err) {
    errorResponse(res, "Something went wrong while creating the banner");
  }
};

const getAllBannerProducts = async (req, res) => {
  try {
    const result = await ProductSchema.aggregate([
      {
        $project: {
          _id: 1,
          name: 1,
          images: 1,
          is_visible: 1,
          is_cloned: 1,
          seo_url: 1,
          // Add these fields for proper display
          MRP_price: 1,
          customer_product_price: 1,
          type: 1,
          product_code: 1
        },
      },
    ]);
    successResponse(res, "get success ", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, "Failed to get products"); // Fixed the error message
  }
};

const editBanner = async (req, res) => {
  try {
    const result = await BannerSchemas.findByIdAndUpdate({ _id: req.params.id }, req.body);
    successResponse(res, "Banner Successfully Updated");
  } catch (err) {
    errorResponse(res, "Something went wrong while updating the banner");
  }
};

const getAllBanners = async (req, res) => {
  try {
    const result = await BannerSchemas.aggregate([{ $match: {} }]);
    successResponse(res, "", result);
  } catch (err) {}
};

const deleteBanner = async (req, res) => {
  try {
    const result = await BannerSchemas.findByIdAndDelete({ _id: req.params.id });
    successResponse(res, "Banner Successfully Deleted");
  } catch (err) {
    errorResponse(res, "Something went wrong while deleting the banner");
  }
};

module.exports = { getAllBannerProducts, addBanners, editBanner, getAllBanners, deleteBanner };
