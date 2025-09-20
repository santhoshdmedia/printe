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
const clientgoogleLogin = async (req, res) => {
  try {
    const { googleId, name, email, picture } = req.body;

    // Validate required fields
    if (!googleId || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists - using the User model, not UserSchema
    let user = await UserSchema.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    if (user) {
      // Update user if they signed up with email previously
      if (!user.googleId) {
        user.googleId = googleId;
        // Only update picture if not already set
        if (!user.picture) {
          user.picture = picture;
        }
        await user.save();
      }
    } else {
      // Create new user
      user = new UserSchema({
        googleId,
        name,
        email,
        picture
      });
      await user.save();
    }
     const payload = {
        id: _.get(user, "[0]._id", ""),
        email: _.get(user, "[0].email", ""),
        role: _.get(user, "[0].role", ""),
      };

    // Create JWT token
   const token = await GenerateToken(payload);

    // Return user and token
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const customSignup = async (req, res) => {
  const {
    email,
    password,
    name,
    unique_code,
    business_name,
    role,
    phone
  } = req.body;
  
  // Basic validation
  if (!email || !password || !name) {
    return errorResponse(res, "Missing required fields: email, password, name");
  }
  
  // Validate role against enum values
  const validRoles = ["user", "Corporate", "Dealer"];
  if (role && !validRoles.includes(role)) {
    return errorResponse(res, "Invalid role specified");
  }
  
  try {
    // Check for existing user (case-insensitive)
    const existingUser = await UserSchema.findOne({ 
      email: email.toLowerCase().trim() 
    });
    if (existingUser) {
      return errorResponse(res, CLIENT_USER_ACCOUNT_ALREADY_EXISTS);
    }

    // Create new user
    const newUser = new UserSchema({
      email: email.toLowerCase().trim(),
      password: await EncryptPassword(password),
      name: name.trim(),
      phone:phone,
      role,
      ...(unique_code && { unique_code }),
      ...(business_name && { business_name })
    });

    const savedUser = await newUser.save();

    // Prepare payload for token
    const payload = {
      id: savedUser._id,
      email: savedUser.email,
      role: savedUser.role,
      ...(savedUser.business_name && { business_name: savedUser.business_name }),
      ...(savedUser.unique_code && { unique_code: savedUser.unique_code })
    };

    // Generate JWT token
    const token = await GenerateToken(payload);

    // Return success response (omit password from response)
    const userResponse = _.omit(savedUser.toObject(), "password");
    return successResponse(res, SIGNUP_SUCCESS, {
      ...userResponse,
      token
    });
  } catch (error) {
    console.error("Signup Error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return errorResponse(res, "Account already exists with this email");
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      // For debugging, you might want to log the specific validation errors
      console.error("Validation errors:", error.errors);
      return errorResponse(res, "Validation failed. Please check your input.");
    }

    return errorResponse(res, "An error occurred during signup");
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
const getAllCustomUsers = async (req, res) => {
  try {
    const result = await UserSchema.aggregate([
  { 
    $match: { 
      role: { $ne: "user" }  
    } 
  }
]);
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
  customSignup,
  getAllCustomUsers,
  clientCheckloginstatus,
  getAllClientUsers,
  updateClientUser,
  deleteClientUser,
  getSingleClient,
  addtoHistory,
  clientgoogleLogin
};
