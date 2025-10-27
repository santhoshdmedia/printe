const express = require('express');
const { CoupenSchema } = require("./models_import");
const { errorResponse, successResponse } = require("../helper/response.helper");

// Apply coupon
const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount, productIds,userId } = req.body;

    const coupon = await CoupenSchema.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!CoupenSchema) {
      return errorResponse(res, "Invalid coupon code");
    }

    // Validate coupon
    const validation = await validateCoupon(coupon, userId, orderAmount, productIds);
    
    if (!validation.valid) {
      return errorResponse(res, validation.message);
    }

    coupon.usedCount += 1;
    if (coupon.singleUse) {
      coupon.userIdsUsed.push(userId);
    }
    
    coupon.usageLimit-=1;
    await coupon.save();

    // Calculate discount
    const discount = calculateDiscount(coupon, orderAmount);

    const responseData = {
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
        finalAmount: orderAmount - discount
      }
    };
    console.log(responseData);
    

    successResponse(res, "Coupon applied successfully", responseData);

  } catch (error) {
    console.log(error);
    errorResponse(res, "Something went wrong while applying coupon");
  }
};

// Create coupon (Admin only)
const createCoupon = async (req, res) => {
  try {
    // Check required fields
    if (!req.body.code || !req.body.discountType || !req.body.discountValue || !req.body.startDate || !req.body.endDate) {
      return errorResponse(res, "Please provide all required fields");
    }

    // Convert code to uppercase
    req.body.code = req.body.code.toUpperCase();

    // Check if coupon code already exists
    const existingCoupon = await CoupenSchema.findOne({ code: req.body.code });
    if (existingCoupon) {
      return errorResponse(res, "Coupon code already exists");
    }

    // Create the coupon
    const result = await CoupenSchema.create(req.body);
    successResponse(res, "Coupon Created Successfully", result);
    
  } catch (error) {
    console.log(error);
    
    // Handle duplicate key error (additional safety)
    if (error.code === 11000 || error.name === 'MongoError') {
      return errorResponse(res, "Coupon code already exists");
    }
    
    errorResponse(res, "Something went wrong while creating coupon");
  }
};

// Get all coupons (Admin only)
const getAllCoupons = async (req, res) => {
  try {
    const result = await CoupenSchema.find().sort({ createdAt: -1 });
    successResponse(res, "", result);
  } catch (error) {
    console.log(error);
    errorResponse(res, "Something went wrong while fetching coupons");
  }
};

// Get coupon by ID (Admin only)
const getCouponById = async (req, res) => {
  try {
    const result = await CoupenSchema.findById(req.params.id);
    if (!result) {
      return errorResponse(res, "Coupon not found");
    }
    successResponse(res, "", result);
  } catch (error) {
    console.log(error);
    errorResponse(res, "Something went wrong while fetching coupon");
  }
};

// Update coupon (Admin only)
const updateCoupon = async (req, res) => {
  try {
    const result = await CoupenSchema.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    successResponse(res, "Coupon Successfully Updated", result);
  } catch (error) {
    console.log(error);
    errorResponse(res, "Something went wrong while updating coupon");
  }
};

// Delete coupon (Admin only)
const deleteCoupon = async (req, res) => {
  try {
    const result = await CoupenSchema.findByIdAndDelete({ _id: req.params.id });
    successResponse(res, "Coupon Successfully Deleted");
  } catch (error) {
    console.log(error);
    errorResponse(res, "Something went wrong while deleting coupon");
  }
};

// Helper function to validate coupon
async function validateCoupon(coupon, userId, orderAmount, productIds = []) {
  const now = new Date();
  
  // Check date validity
  if (now < coupon.startDate || now > coupon.endDate) {
    return { valid: false, message: 'Coupon is not active' };
  }

  // Check usage limit
  if (coupon.usageLimit == 0) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }

  // Check minimum order amount
  if (orderAmount < coupon.minimumOrderAmount) {
    return { 
      valid: false, 
      message: `Minimum order amount of ${coupon.minimumOrderAmount} required` 
    };
  }

  // Check single use per user
  if (coupon.singleUse && coupon.userIdsUsed.includes(userId)) {
    return { valid: false, message: 'Coupon already used' };
  }

  return { valid: true, message: 'Coupon is valid' };
}

// Helper function to calculate discount
function calculateDiscount(coupon, orderAmount) {
  let discount = 0;

  switch (coupon.discountType) {
    case 'percentage':
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
      break;
    
    case 'fixed':
      discount = Math.min(coupon.discountValue, orderAmount);
      break;
    
    case 'shipping':
      discount = coupon.discountValue; // Free shipping up to certain amount
      break;
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
}

async function coupenExists(code){
    const existingCoupon = await CoupenSchema.findOne({code:code});
    if(existingCoupon){
        throw new Error('Coupon code already exists');
    }
    return code;
}


module.exports = {
    applyCoupon,
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon
}
