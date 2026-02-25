const { constant } = require("lodash");
const { ADD_BLOG_SUCCESS, BLOG_ADD_FAILED, BLOG_EDITED_SUCCESS, BLOG_EDITED_FAILED, BLOG_DELETED_SUCESS, BLOG_DELETED_FAILED } = require("../helper/message.helper");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { BlogSchema } = require("./models_import");
const { slugify, generateUniqueSlug } = require("../utils/slugify");

const addblog = async (req, res) => {
  try {
    const baseSlug = slugify(req.body.blog_name);
    const blog_slug = await generateUniqueSlug(baseSlug);

    const blogData = {
      ...req.body,
      blog_slug, // generated slug overrides any incoming value
    };

    await BlogSchema.create(blogData);
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
    const { id } = req.params;
    const existing = await BlogSchema.findById(id);
    if (!existing) return errorResponse(res, "Blog not found");

    // If blog_name changed, regenerate slug
    let blog_slug = existing.blog_slug;
    if (req.body.blog_name && req.body.blog_name !== existing.blog_name) {
      const baseSlug = slugify(req.body.blog_name);
      blog_slug = await generateUniqueSlug(Blog, baseSlug, id);
    }

    const updatedData = {
      ...req.body,
      blog_slug,
    };

    const result = await Blog.findByIdAndUpdate(id, updatedData, { new: true });
    successResponse(res, "UPDATE_BLOG_SUCCESS");
  } catch (err) {
    console.log(err);
    errorResponse(res, "BLOG_UPDATE_FAILED");
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
