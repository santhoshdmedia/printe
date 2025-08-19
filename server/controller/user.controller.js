const _ = require("lodash");
const { INVALID_ACCOUNT_DETAILS, INCORRECT_PASSWORD, LOGIN_SUCCESS, PASSWORD_CHANGED_SUCCESSFULLY, SIGNUP_SUCCESS, PASSWORD_CHANGED_FAILED, CLIENT_USERS_GETTING_SUCESS, CLIENT_USERS_GETTING_FAILED, CLIENT_USER_UPDATED_SUCCESS, CLIENT_USER_UPDATED_FAILED, CLIENT_USER_DELETED_SUCCESS, CLIENT_USER_DELETED_FAILED, CLIENT_USER_ACCOUNT_ALREADY_EXISTS } = require("../helper/message.helper");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { UserSchema } = require("./models_import");
const { PlaintoHash, GenerateToken, EncryptPassword } = require("../helper/shared.helper");
const { ObjectAlreadyInActiveTierError } = require("@aws-sdk/client-s3");
const { default: mongoose } = require("mongoose");

const clientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserSchema.aggregate([{ $match: { email } }]);
    if (!user) {
      return errorResponse(res, INVALID_ACCOUNT_DETAILS);
    }

    const isPasswordValid = await PlaintoHash(password, _.get(user, "[0].password", ""));

    if (isPasswordValid) {
      const payload = {
        id: _.get(user, "[0]._id", ""),
        email: _.get(user, "[0].email", ""),
        role: _.get(user, "[0].role", ""),
      };
      const token = await GenerateToken(payload);
      return successResponse(res, LOGIN_SUCCESS, {
        ...user[0],
        token,
      });
    } else {
      return errorResponse(res, INCORRECT_PASSWORD);
    }
  } catch (err) {
    console.error(err);
    return errorResponse(res, "An error occurred while logging in");
  }
};

const clientSignup = async (req, res) => {
  console.log(req.body);

  const { email, password, name, gst_no } = req.body;
  try {
    const result = await UserSchema.findOne({ email });
    if (result) {
      return errorResponse(res, CLIENT_USER_ACCOUNT_ALREADY_EXISTS);
    }
    const newUser = new UserSchema({
      email,
      password: await EncryptPassword(password),
      name,
      gst_no,
    });
    const user = await newUser.save();
    const payload = {
      id: _.get(user, "_id", ""),
      email: _.get(user, "email", ""),
      role: _.get(user, "role", ""),
    };
    const token = await GenerateToken(payload);
    return successResponse(res, SIGNUP_SUCCESS, {
      ...user,
      token,
    });
  } catch (error) {
    console.log(error);

    return errorResponse(res, "An error occurred while sign in");
  }
};

const getAllClientUsers = async (req, res) => {
  try {
    const { limit } = JSON.parse(_.get(req, "params.id", ""));
    const result = await UserSchema.aggregate([{ $match: { role: "user" } }, ...(limit ? [{ $limit: 5 }] : [])]);
    return successResponse(res, CLIENT_USERS_GETTING_SUCESS, result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, CLIENT_USERS_GETTING_FAILED);
  }
};

const getSingleClient = async (req, res) => {
  try {
    const { _id } = JSON.parse(req.params.id);

    let where = {};

    if (_id) {
      where._id = new mongoose.Types.ObjectId(_id);
    }

    const result = await UserSchema.aggregate([
      { $match: where },
      { $project: { password: 0 } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "order_details",
          as: "order_details",
          localField: "_id",
          foreignField: "user_id",
          pipeline: [
            {
              $lookup: {
                from: "order_delivery_timeline",
                as: "order_delivery_timeline",
                localField: "_id",
                foreignField: "order_id",
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "user_review",
          as: "review_details",
          localField: "_id",
          foreignField: "user_id",
          pipeline: [
            {
              $lookup: {
                from: "product",
                as: "product_details",
                localField: "product_id",
                foreignField: "_id",
              },
            },
          ],
        },
      },
    ]);

    successResponse(res, "Get Success", result);
  } catch (err) {
    console.log(err);
    errorResponse(err);
  }
};

const updateClientUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { id } = req.params;
    const result = await UserSchema.findOne({
      $and: [{ email: email }, { _id: { $ne: id } }],
    });
    if (password) {
      req.body.password = await EncryptPassword(password);
    }
    if (result) {
      return errorResponse(res, CLIENT_USER_ACCOUNT_ALREADY_EXISTS);
    }
    const user = await UserSchema.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    successResponse(res, CLIENT_USER_UPDATED_SUCCESS, user);
  } catch (err) {
    console.log(err);
    errorResponse(res, CLIENT_USER_UPDATED_FAILED);
  }
};

const deleteClientUser = async (req, res) => {
  try {
    const { id } = req.userData;
    const user = await UserSchema.findById(id);

    const { password } = req.body;

    const isPasswordValid = await PlaintoHash(password, _.get(user, "password", ""));
    if (isPasswordValid) {
      await UserSchema.findByIdAndDelete({ _id: id });
      successResponse(res, CLIENT_USER_DELETED_SUCCESS);
    } else {
      return errorResponse(res, INCORRECT_PASSWORD);
    }
  } catch (err) {
    console.log(err);
    errorResponse(res, CLIENT_USER_DELETED_FAILED);
  }
};

const clientCheckloginstatus = async (req, res) => {
  try {
    const { id } = req.userData;

    const result = await UserSchema.findOne({ _id: id }, { password: 0 });

    if (_.isEmpty(result)) {
      return res.status(200).send({ message: "Invalid Token" });
    }
    return res.status(200).send({ message: "Already Login", data: result });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Server error" });
  }
};

const addtoHistory = async (req, res) => {
  try {
    const result = await UserSchema.findOne({ history_data: { $in: req.body.product_id } });
    if (!_.isEmpty(result)) {
      return true;
    }
    await UserSchema.findByIdAndUpdate({ _id: req.userData.id }, { $push: { history_data: req.body.product_id } });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  clientLogin,
  clientSignup,
  clientCheckloginstatus,
  getAllClientUsers,
  updateClientUser,
  deleteClientUser,
  getSingleClient,
  addtoHistory,
};
