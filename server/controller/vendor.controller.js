const { PRODUCT_GET_SUCCESS } = require("../helper/message.helper");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { VendorSchemas } = require("./models_import");

const addVendors = async (req, res) => {
  try {
    const result = await VendorSchemas.create(req.body);
    successResponse(res, "Vendor Created Successfully");
  } catch (err) {
    errorResponse(res, "Something went wrong while creating the vendor");
  }
};

const editVendor = async (req, res) => {
  try {
    const result = await VendorSchemas.findByIdAndUpdate({ _id: req.params.id }, req.body);
    successResponse(res, "Vendor Successfully Updated");
  } catch (err) {
    errorResponse(res, "Something went wrong while updating the vendor");
  }
};

const getAllVendors = async (req, res) => {
  try {
    const { id } = req.params;
    let where = {};
    if (id !== "null") {
      where = {
        $or: [{ vendor_name: { $regex: id, $options: "i" } }, { business_name: { $regex: id, $options: "i" } }],
      };
    }
    const result = await VendorSchemas.aggregate([{ $match: where }]);
    successResponse(res, "", result);
  } catch (err) {
    errorResponse(res, "Something went wrong while updating the vendor");
  }
};

const getSingleVendor = async (req, res) => {
  try {
    const result = await VendorSchemas.findById(req.params.id);
    successResponse(res, "", result);
  } catch (err) {
    {
      errorResponse(res, "Something went wrong while updating the vendor");
    }
  }
};

const deleteVendor = async (req, res) => {
  try {
    const result = await VendorSchemas.findByIdAndDelete({ _id: req.params.id });
    successResponse(res, "Vendor Successfully Deleted");
  } catch (err) {
    errorResponse(res, "Something went wrong while deleting the vendor");
  }
};

module.exports = { addVendors, editVendor, getAllVendors, deleteVendor, getSingleVendor };
