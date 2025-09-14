const { PRODUCT_GET_SUCCESS } = require("../helper/message.helper");
const { errorResponse, successResponse } = require("../helper/response.helper");
const {  BannerTextSchemas } = require("./models_import");

const addTextBanners = async (req, res) => {
  try {
    const result = await BannerText.create(req.body);
    successResponse(res, "Banner text created successfully", result);
  } catch (err) {
    errorResponse(res, "Something went wrong while creating the banner");
  }
};

const editTextBanner = async (req, res) => {
  try {
    const result = await BannerText.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!result) {
      return errorResponse(res, "Banner text not found");
    }
    successResponse(res, "Banner text successfully updated", result);
  } catch (err) {
    errorResponse(res, "Something went wrong while updating the banner");
  }
};

const getBannersText = async (req, res) => {
  try {
    let result;
    const { id } = req.params;

    if (id) {
      result = await BannerText.findById(id);
      if (!result) {
        return errorResponse(res, "Banner text not found");
      }
      successResponse(res, "", [result]); // Wrap in array for consistency
    } else {
      result = await BannerText.find({}).lean(); // Use find for simplicity; lean() for performance
      successResponse(res, "", result);
    }
  } catch (err) {
    errorResponse(res, "Something went wrong while fetching banners");
  }
};

const deleteTextBanner = async (req, res) => {
  try {
    const result = await BannerText.findByIdAndDelete(req.params.id);
    if (!result) {
      return errorResponse(res, "Banner text not found");
    }
    successResponse(res, "Banner text successfully deleted");
  } catch (err) {
    errorResponse(res, "Something went wrong while deleting the banner");
  }
};

module.exports = { addTextBanners, getBannersText, editTextBanner, deleteTextBanner };