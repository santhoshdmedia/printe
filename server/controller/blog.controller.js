const { constant } = require("lodash");
const { ADD_BLOG_SUCCESS, BLOG_ADD_FAILED, BLOG_EDITED_SUCCESS, BLOG_EDITED_FAILED, BLOG_DELETED_SUCESS, BLOG_DELETED_FAILED } = require("../helper/message.helper");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { BlogSchema } = require("./models_import");

const addblog = async (req, res) => {
  try {
    const result = await BlogSchema.create(req.body);
    successResponse(res, ADD_BLOG_SUCCESS);
  } catch (err) {
    console.log(err);
    errorResponse(res, BLOG_ADD_FAILED);
  }
};

const getblog = async (req, res) => {
  try {
    const result = await BlogSchema.aggregate([
      {
        $match: {},
      },
    ]);

    successResponse(res, "Get Successs", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, "Get Failed");
  }
};

const editblog = async (req, res) => {
  try {
    const result = await BlogSchema.findByIdAndUpdate({ _id: req.params.id }, req.body);

    successResponse(res, BLOG_EDITED_SUCCESS, result);
  } catch (err) {
    console.log(err);
    errorResponse(res, BLOG_EDITED_FAILED);
  }
};

const deleteblog = async (req, res) => {
  try {
    const result = await BlogSchema.findByIdAndDelete({ _id: req.params.id });
    successResponse(res, BLOG_DELETED_SUCESS);
  } catch (err) {
    console.log(err);
    errorResponse(err, BLOG_DELETED_FAILED);
  }
};

module.exports = {
  addblog,
  getblog,
  editblog,
  deleteblog,
};
