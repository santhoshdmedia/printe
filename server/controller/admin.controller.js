const { AdminUsersSchema } = require("./models_import");
const { ADMIN_USERS_ADDED_SUCCESS, ADMIN_USERS_ADDED_FAILED, ADMIN_USERS_GETTED_SUCCESS, ADMIN_USER_GETTED_FAILED, ADMIN_USER_UPDATED_SUCCESS, ADMIN_USER_UPDATED_FAILED, ADMIN_USER_DELETED_SUCCESS, ADMIN_USER_DELETED_FAILED, ADMIN_USER_ACCOUNT_ALREADY_EXISTS } = require("../helper/message.helper");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { EncryptPassword } = require("../helper/shared.helper");

const addAdmin = async (req, res) => {
  const { email, password, name, role, phone } = req.body;
  try {
    const result = await AdminUsersSchema.findOne({ email: email });
    if (result) {
      return errorResponse(res, ADMIN_USER_ACCOUNT_ALREADY_EXISTS);
    }
    const newUser = new AdminUsersSchema({
      email,
      password: await EncryptPassword(password),
      name,
      role,
      phone,
    });
    const user = await newUser.save();
    return successResponse(res, ADMIN_USERS_ADDED_SUCCESS, user);
  } catch (error) {
    console.log(error);
    return errorResponse(res, ADMIN_USERS_ADDED_FAILED);
  }
};

const getAdmin = async (req, res) => {
  try {
    const result = await AdminUsersSchema.aggregate([
      { $match: {} },
      {
        $project: {
          password: 0,
        },
      },
    ]);
    return successResponse(res, ADMIN_USERS_GETTED_SUCCESS, result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, ADMIN_USER_GETTED_FAILED);
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { id } = req.params;
    const result = await AdminUsersSchema.findOne({
      $and: [{ email: email }, { _id: { $ne: id } }],
    });
    if (password) {
      req.body.password = await EncryptPassword(password);
    }
    if (result) {
      return errorResponse(res, ADMIN_USER_ACCOUNT_ALREADY_EXISTS);
    }
    await AdminUsersSchema.findByIdAndUpdate({ _id: id }, req.body);
    successResponse(res, ADMIN_USER_UPDATED_SUCCESS);
  } catch (err) {
    console.log(err);
    errorResponse(res, ADMIN_USER_UPDATED_FAILED);
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await AdminUsersSchema.findByIdAndDelete({ _id: id });
    successResponse(res, ADMIN_USER_DELETED_SUCCESS);
  } catch (err) {
    console.log(err);
    errorResponse(res, ADMIN_USER_DELETED_FAILED);
  }
};

module.exports = {
  addAdmin,
  getAdmin,
  deleteAdmin,
  updateAdmin,
};
