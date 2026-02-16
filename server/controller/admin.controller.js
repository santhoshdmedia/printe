const { AdminUsersSchema } = require("./models_import");
const {
  ADMIN_USERS_ADDED_SUCCESS,
  ADMIN_USERS_ADDED_FAILED,
  ADMIN_USERS_GETTED_SUCCESS,
  ADMIN_USER_GETTED_FAILED,
  ADMIN_USER_UPDATED_SUCCESS,
  ADMIN_USER_UPDATED_FAILED,
  ADMIN_USER_DELETED_SUCCESS,
  ADMIN_USER_DELETED_FAILED,
  ADMIN_USER_ACCOUNT_ALREADY_EXISTS,
  ADMIN_USER_PERMISSION_DENIED,
} = require("../helper/message.helper");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { EncryptPassword } = require("../helper/shared.helper");

const addAdmin = async (req, res) => {
  const { email, password, name, role, phone, permissions } = req.body;
  try {
    const result = await AdminUsersSchema.findOne({ email: email });
    if (result) {
      return errorResponse(res, ADMIN_USER_ACCOUNT_ALREADY_EXISTS);
    }

    // Default permissions if not provided
    const defaultPermissions = {
      view: permissions?.view !== undefined ? permissions.view : true,
      edit: permissions?.edit !== undefined ? permissions.edit : false,
      delete: permissions?.delete !== undefined ? permissions.delete : false,
    };

    // Super admin gets all permissions
    if (role === "super admin") {
      defaultPermissions.view = true;
      defaultPermissions.edit = true;
      defaultPermissions.delete = true;
    }

    const newUser = new AdminUsersSchema({
      email,
      password: await EncryptPassword(password),
      name,
      role,
      phone,
      permissions: defaultPermissions,
    });

    const user = await newUser.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return successResponse(res, ADMIN_USERS_ADDED_SUCCESS, userResponse);
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
    const { email, password, permissions } = req.body;
    const { id } = req.params;

    // Check if email already exists for another user
    const result = await AdminUsersSchema.findOne({
      $and: [{ email: email }, { _id: { $ne: id } }],
    });

    if (result) {
      return errorResponse(res, ADMIN_USER_ACCOUNT_ALREADY_EXISTS);
    }

    // Encrypt password if provided
    if (password) {
      req.body.password = await EncryptPassword(password);
    }

    // Handle permissions update
    if (permissions) {
      req.body.permissions = {
        view: permissions.view !== undefined ? permissions.view : true,
        edit: permissions.edit !== undefined ? permissions.edit : false,
        delete: permissions.delete !== undefined ? permissions.delete : false,
      };
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