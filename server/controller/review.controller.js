const { successResponse, errorResponse } = require("../helper/response.helper");
const { ReviewSchemas } = require("./models_import");
const { default: mongoose } = require("mongoose");

const addReview = async (req, res) => {
  try {
    const { id } = req.userData;
    const { product_id, review, rating } = req.body;

    const result = await ReviewSchemas.create({
      user_id: id,
      product_id,
      rating,
      review,
    });
    successResponse(res, "Add Sucess", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, err);
  }
};

const getreveiewbyproduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ReviewSchemas.aggregate([
      {
        $match: { product_id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "user",
          localField: "user_id",
          foreignField: "_id",
          as: "user_data",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    successResponse(res, "sucess", result);
  } catch (err) {
    errorResponse(res, "", err);
  }
};

const getmyreviewall = async (req, res) => {
  try {
    const { id } = req.userData;
    const result = await ReviewSchemas.aggregate([
      {
        $match: { user_id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "product",
          localField: "porduct_id",
          foreignField: "id",
          as: "Product_details",
          pipeline: [
            {
              $lookup: {
                from: "product_images",
                localField: "product_id",
                foreignField: "id",
                as: "images",
              },
            },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    successResponse(res, "Get Success", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, "");
  }
};

const getadminsideReview = async (req, res) => {
  try {
    const { search } = req.params;

    let where = {};

    // if (search && search !== "null") {
    //   where["product_details.name"] = { $regex: search, $options: "i" };
    // }

    const result = await ReviewSchemas.aggregate([
      {
        $match: where,
      },
      {
        $lookup: {
          from: "user",
          localField: "user_id",
          foreignField: "_id",
          as: "user_data",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "product",
          localField: "product_id",
          foreignField: "_id",
          as: "Product_details",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    successResponse(res, "Get Success ", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, err, "");
  }
};

const deleteMyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ReviewSchemas.findByIdAndDelete(id);
    successResponse(res, "Delete Success", result);
  } catch (err) {
    errorResponse(res, err, "");
  }
};

const updateMyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ReviewSchemas.findByIdAndUpdate({ _id: id }, req.body);
    successResponse(res, "Review Successfully Updated", result);
  } catch (err) {
    errorResponse(res, err, "");
  }
};

module.exports = { addReview, getreveiewbyproduct, getmyreviewall, getadminsideReview, deleteMyReview, updateMyReview };
