const CustomerCareSchema = require("../modals/Customercaremodal"); // Fixed import
const { errorResponse, successResponse } = require("../helper/response.helper");
const _ = require("lodash");


const { PlaintoHash, GenerateToken, EncryptPassword } = require("../helper/shared.helper");

// In your backend Customercare.controller.js
const customerCareLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    const user = await CustomerCareSchema.aggregate([{ $match: { email } }]);
    console.log('Found user:', user);
    
    if (!user || user.length === 0) {
      console.log('No user found for email:', email);
      return errorResponse(res, "Invalid credentials");
    }

    const isPasswordValid = await PlaintoHash(password, _.get(user, "[0].password", ""));
    console.log('Password valid:', isPasswordValid);

    if (isPasswordValid) {
      const payload = {
        id: _.get(user, "[0]._id", ""),
        email: _.get(user, "[0].email", ""),
        role: _.get(user, "[0].role", ""),
      };
      console.log('Creating token with payload:', payload);
      
      const token = await GenerateToken(payload);
      console.log('Token generated:', token);
      
      // Remove password before sending
      const userWithoutPassword = { ...user[0] };
      delete userWithoutPassword.password;
      
      return successResponse(res, "LOGIN SUCCESS", {
        ...userWithoutPassword,
        token,
      });
    } else {
      return errorResponse(res, "INCORRECT PASSWORD");
    }
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse(res, "An error occurred while logging in");
  }
};
const addCustomerCare = async (req, res) => {
  const { email, password, name, role, phone } = req.body;
  try {
    const result = await CustomerCareSchema.findOne({ email: email });
    if (result) {
      return errorResponse(res, "User already exists");
    }
    
    const newUser = new CustomerCareSchema({
      email,
      password: await EncryptPassword(password),
      name,
      role: role || "customer_care",
      phone,
    });
    
    const user = await newUser.save();
    return successResponse(res, "User created successfully", user);
  } catch (error) {
    console.log(error);
    return errorResponse(res, "User creation failed");
  }
};

const getCustomerCare = async (req, res) => {
  try {
    const result = await CustomerCareSchema.aggregate([
      { $match: {} },
      {
        $project: {
          password: 0,
        },
      },
    ]);
    return successResponse(res, "Success", result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, "Failed to fetch users");
  }
};

const updateCustomerCare = async (req, res) => {
  try {
    const { email, password, ...otherData } = req.body;
    const { id } = req.params;
    
    if (email) {
      const result = await CustomerCareSchema.findOne({
        $and: [{ email: email }, { _id: { $ne: id } }],
      });
      if (result) {
        return errorResponse(res, "Email already exists for another user");
      }
    }
    
    const updateData = { ...otherData };
    if (email) updateData.email = email;
    
    if (password) {
      updateData.password = await EncryptPassword(password);
    }
    
    await CustomerCareSchema.findByIdAndUpdate({ _id: id }, updateData);
    return successResponse(res, "User updated successfully");
  } catch (err) {
    console.log(err);
    return errorResponse(res, "Update failed");
  }
};

const deleteCustomerCare = async (req, res) => {
  try {
    const { id } = req.params;
    await CustomerCareSchema.findByIdAndDelete({ _id: id });
    return successResponse(res, "User deleted successfully");
  } catch (err) {
    console.log(err);
    return errorResponse(res, "Delete failed");
  }
};

module.exports = {
  addCustomerCare,
  getCustomerCare,
  deleteCustomerCare,
  updateCustomerCare,
  customerCareLogin
};