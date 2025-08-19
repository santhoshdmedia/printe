const { default: mongoose } = require("mongoose");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { CustomerSectionSchema } = require("./models_import");

const addCutomerSection = async (req, res) => {
  try {
    const result = await CustomerSectionSchema.create(req.body);
    successResponse(res, "Section Created Successfully");
  } catch (err) {
    console.log(err);
    errorResponse(res, "Something went wrong while creating the New Section");
  }
};

const editCustomerSection = async (req, res) => {
  try {
    const result = await CustomerSectionSchema.findByIdAndUpdate(
      { _id: req.params.id },
      req.body
    );
    successResponse(res, "Section Successfully Updated");
  } catch (err) {
    errorResponse(res, "Something went wrong while updating the  Section");
  }
};

const getAllCustomerSections = async (req, res) => {
  try {
    const { id } = req.params;

    let where = {};
   

    if (id != `null`) {
      where._id = new mongoose.Types.ObjectId(id);
    }
    console.log(where);
    const result = await CustomerSectionSchema.aggregate([
      { $match: where },
      {
        $lookup: {
          from: "product",
          localField: "section_products",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);
    successResponse(res, "", result);
  } catch (err) {
    console.log(err);
  }
};

const deleteBannerCustomerSections = async (req, res) => {
  try {
    const result = await CustomerSectionSchema.findByIdAndDelete({
      _id: req.params.id,
    });
    successResponse(res, "Section Successfully Deleted");
  } catch (err) {
    errorResponse(res, "Something went wrong while deleting the Section");
  }
};

module.exports = {
  addCutomerSection,
  editCustomerSection,
  getAllCustomerSections,
  deleteBannerCustomerSections,
};
