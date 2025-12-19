const CustomerCareSchema = require("../modals/Customercaremodal");
const { errorResponse, successResponse } = require("../helper/response.helper");
const _ = require("lodash");
const { PlaintoHash, GenerateToken, EncryptPassword } = require("../helper/shared.helper");

// Customer Care Login
const customerCareLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    // Find user by email
    const user = await CustomerCareSchema.findOne({ email });
    
    if (!user) {
      console.log('No user found for email:', email);
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Verify password
    const isPasswordValid = await PlaintoHash(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return errorResponse(res, "Incorrect password", 401);
    }

    // Generate token payload
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    console.log('Creating token with payload:', payload);
    const token = await GenerateToken(payload);
    console.log('Token generated');
    
    // Prepare user data without password
    const userData = user.toObject();
    delete userData.password;
    
    return successResponse(res, "Login successful", {
      user: userData,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse(res, "An error occurred while logging in", 500);
  }
};

// Add new Customer Care member
const addCustomerCare = async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;
    
    // Validate required fields
    if (!email || !password || !name) {
      return errorResponse(res, "Email, password and name are required", 400);
    }
    
    // Check if user already exists
    const existingUser = await CustomerCareSchema.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "User with this email already exists", 409);
    }
    
    // Create new user
    const newUser = new CustomerCareSchema({
      email,
      password: await EncryptPassword(password),
      name,
      role: role || "customer_care",
      phone: phone || "",
    });
    
    // Save user
    const savedUser = await newUser.save();
    
    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    return successResponse(res, "User created successfully", userResponse, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return errorResponse(res, "User creation failed", 500);
  }
};

// Get all Customer Care members
const getCustomerCare = async (req, res) => {
  try {
    // Find all users and exclude password field
    const users = await CustomerCareSchema.find({}, { password: 0 });
    
    return successResponse(res, "Users fetched successfully", users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return errorResponse(res, "Failed to fetch users", 500);
  }
};

// Get Customer Care member by ID
const getCustomerCarebyId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id) {
      return errorResponse(res, "User ID is required", 400);
    }
    
    // Find user by ID and exclude password
    const user = await CustomerCareSchema.findById(id, { password: 0 });
    
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    
    return successResponse(res, "User fetched successfully", user);
  } catch (error) {
    console.error('Error fetching user:', error);
    
    // Check if error is due to invalid ID format
    if (error.name === 'CastError') {
      return errorResponse(res, "Invalid user ID format", 400);
    }
    
    return errorResponse(res, "Failed to fetch user", 500);
  }
};

// Update Customer Care member
const updateCustomerCare = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, ...otherData } = req.body;
    
    // Validate ID
    if (!id) {
      return errorResponse(res, "User ID is required", 400);
    }
    
    // Check if user exists
    const existingUser = await CustomerCareSchema.findById(id);
    if (!existingUser) {
      return errorResponse(res, "User not found", 404);
    }
    
    // Check if email is being updated and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await CustomerCareSchema.findOne({ 
        email,
        _id: { $ne: id } 
      });
      
      if (emailExists) {
        return errorResponse(res, "Email already exists for another user", 409);
      }
    }
    
    // Prepare update data
    const updateData = { ...otherData };
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await EncryptPassword(password);
    }
    
    // Update user
    const updatedUser = await CustomerCareSchema.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-password' } // Return updated user without password
    );
    
    return successResponse(res, "User updated successfully", updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error.name === 'CastError') {
      return errorResponse(res, "Invalid user ID format", 400);
    }
    
    return errorResponse(res, "Update failed", 500);
  }
};

// Delete Customer Care member
const deleteCustomerCare = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id) {
      return errorResponse(res, "User ID is required", 400);
    }
    
    // Check if user exists
    const user = await CustomerCareSchema.findById(id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    
    // Delete user
    await CustomerCareSchema.findByIdAndDelete(id);
    
    return successResponse(res, "User deleted successfully");
  } catch (error) {
    console.error('Error deleting user:', error);
    
    if (error.name === 'CastError') {
      return errorResponse(res, "Invalid user ID format", 400);
    }
    
    return errorResponse(res, "Delete failed", 500);
  }
};

module.exports = {
  addCustomerCare,
  getCustomerCare,
  getCustomerCarebyId,
  deleteCustomerCare,
  updateCustomerCare,
  customerCareLogin
};