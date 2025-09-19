const _ = require("lodash");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { VendorSchemas } = require("./models_import");
const { INVALID_ACCOUNT_DETAILS, INCORRECT_PASSWORD, LOGIN_SUCCESS, PASSWORD_CHANGED_SUCCESSFULLY, SIGNUP_SUCCESS, PASSWORD_CHANGED_FAILED, CLIENT_USERS_GETTING_SUCESS, CLIENT_USERS_GETTING_FAILED, CLIENT_USER_UPDATED_SUCCESS, CLIENT_USER_UPDATED_FAILED, CLIENT_USER_DELETED_SUCCESS, CLIENT_USER_DELETED_FAILED, CLIENT_USER_ACCOUNT_ALREADY_EXISTS } = require("../helper/message.helper");
const { PlaintoHash, GenerateToken, EncryptPassword,VerfiyToken } = require("../helper/shared.helper");


const VendorLogin = async (req, res) => {
  console.log(req.body)
  try {
    const { email, password } = req.body;
    const vendor_email=email;
    const user = await VendorSchemas.aggregate([{ $match: { vendor_email } }]);
    if (!user) {
      return errorResponse(res, INVALID_ACCOUNT_DETAILS);
    }

    const isPasswordValid = await PlaintoHash(password, _.get(user, "[0].password", ""));

    if (isPasswordValid) {
      const payload = {
        id: _.get(user, "[0]._id", ""),
        vendor_email: _.get(user, "[0].vendor_email", ""),
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

const VendorGetProfile = async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse(res, "Access denied. No token provided.", 401);
    }

    // Verify token and decode payload
    const decoded = await VerfiyToken(token); // Implement your token verification logic
    if (!decoded) {
      return errorResponse(res, "Invalid or expired token.", 401);
    }

    // Find vendor by ID from decoded token
    const vendor = await VendorSchemas.findById(decoded.id).select('-password'); // Exclude password field
    if (!vendor) {
      return errorResponse(res, "Vendor not found.", 404);
    }

    // Return vendor data
    return successResponse(res, "Profile retrieved successfully.", vendor);
  } catch (err) {
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return errorResponse(res, "Invalid token.", 401);
    }
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, "Token expired.", 401);
    }
    return errorResponse(res, "Server error while fetching profile.");
  }
};




const addVendors = async (req, res) => {
  const {
    vendor_email,
    password,
    vendor_name,
    alternate_vendor_contact_number,
    billing_address,
    shipping_address,
    unique_code,
    vendor_contact_number,
    vendor_image,
    business_name
  } = req.body;

  try {
    // Validate required fields
    if (!vendor_email || !password || !vendor_name) {
      return errorResponse(res, "Vendor email, password, and name are required");
    }

    // Check if vendor already exists with the same email
    const existingVendor = await VendorSchemas.findOne({ vendor_email });
    if (existingVendor) {
      return errorResponse(res, "Vendor with this email already exists");
    }

    // Check if vendor already exists with the same unique code
    if (unique_code) {
      const existingVendorWithCode = await VendorSchemas.findOne({ unique_code });
      if (existingVendorWithCode) {
        return errorResponse(res, "Vendor with this unique code already exists");
      }
    }

    // Create new vendor
    const newVendor = new VendorSchemas({
      vendor_email,
      password: await EncryptPassword(password),
      vendor_name,
      alternate_vendor_contact_number: alternate_vendor_contact_number || null,
      billing_address: billing_address || null,
      shipping_address: shipping_address || null,
      unique_code: unique_code || null,
      vendor_contact_number: vendor_contact_number || null,
      vendor_image: vendor_image || null,
      business_name: business_name || null
    });

    // Save vendor to database
    const savedVendor = await newVendor.save();
    
    // Remove password from response
    const vendorResponse = savedVendor.toObject();
    delete vendorResponse.password;

    return successResponse(res, "Vendor created successfully", vendorResponse);
  } catch (error) {
    console.error("Error creating vendor:", error);
    return errorResponse(res, "An error occurred while creating vendor account");
  }
};

const editVendor = async (req, res) => {
  try {
    // Don't allow updating password through this endpoint
    if (req.body.password) {
      delete req.body.password;
    }
    
    const result = await VendorSchemas.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true } // Return the updated document
    );
    
    if (!result) {
      return errorResponse(res, "Vendor not found");
    }
    
    // Remove password from response
    const vendorResponse = result.toObject();
    delete vendorResponse.password;
    
    successResponse(res, "Vendor successfully updated", vendorResponse);
  } catch (err) {
    console.error("Error updating vendor:", err);
    errorResponse(res, "Something went wrong while updating the vendor");
  }
};

const getAllVendors = async (req, res) => {
  try {
    const { id } = req.params;
    let where = {};
    
    if (id && id !== "null") {
      where = {
        $or: [
          { vendor_name: { $regex: id, $options: "i" } },
          { business_name: { $regex: id, $options: "i" } },
          { vendor_email: { $regex: id, $options: "i" } },
          { unique_code: { $regex: id, $options: "i" } },
        ],
      };
    }
    
    const result = await VendorSchemas.find(where).select('-password'); // Exclude password field
    successResponse(res, "Vendors retrieved successfully", result);
  } catch (err) {
    console.error("Error fetching vendors:", err);
    errorResponse(res, "Something went wrong while fetching vendors");
  }
};

const getSingleVendor = async (req, res) => {
  try {
    const result = await VendorSchemas.findById(req.params.id).select('-password');
    
    if (!result) {
      return errorResponse(res, "Vendor not found");
    }
    
    successResponse(res, "Vendor retrieved successfully", result);
  } catch (err) {
    console.error("Error fetching vendor:", err);
    errorResponse(res, "Something went wrong while fetching the vendor");
  }
};

const getSingleVendorName = async (req, res) => {
  try {
    const result = await VendorSchemas.findById(req.params.id);

    if (!result) {
      return errorResponse(res, "Vendor not found", 404);
    }

    return successResponse(res, "Vendor fetched successfully", {
      vendor_name: result.vendor_name,
    });
  } catch (err) {
    console.error("Error fetching vendor:", err);
    return errorResponse(res, "Something went wrong while fetching the vendor", 500);
  }
};

const deleteVendor = async (req, res) => {
  try {
    const result = await VendorSchemas.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return errorResponse(res, "Vendor not found");
    }
    
    successResponse(res, "Vendor successfully deleted");
  } catch (err) {
    console.error("Error deleting vendor:", err);
    errorResponse(res, "Something went wrong while deleting the vendor");
  }
};

// Export the correct function name
module.exports = {
  addVendors, // Changed from addVendors to addVendor
  VendorLogin,
  VendorGetProfile,
  editVendor,
  getAllVendors,
  deleteVendor,
  getSingleVendor,
  getSingleVendorName,
};