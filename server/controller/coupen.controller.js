const Coupon = require('../modals/coupen.modals');

// Helper: Validate date
function isValidDate(date) {
  return date && !isNaN(new Date(date).getTime());
}

// Helper: Find applicable tier for quantity
function findApplicableTier(discountTiers, quantity) {
  if (!discountTiers || discountTiers.length === 0) return null;
  
  const sortedTiers = [...discountTiers].sort((a, b) => b.minimumQuantity - a.minimumQuantity);
  return sortedTiers.find(tier => quantity >= tier.minimumQuantity);
}

// Helper: Calculate tiered quantity discount (FIXED AMOUNT) - ONLY FOR Victoria-Luxe
function calculateTieredQuantityDiscount(coupon, cartItems) {
  let totalDiscount = 0;
  
  // Validate coupon has tiers
  if (!coupon.discountTiers || coupon.discountTiers.length === 0) {
    return totalDiscount;
  }
  
  // Sort tiers by minimumQuantity in descending order for proper matching
  const sortedTiers = [...coupon.discountTiers].sort((a, b) => b.minimumQuantity - a.minimumQuantity);
  
  for (const item of cartItems) {
    // ONLY apply discount to products named "Victoria-Luxe"
    console.log(item.name);
    
    if (item.name !== "Victoria Luxe") {
      continue; // Skip products that are not Victoria-Luxe
    }
    
    // Check if product is excluded (additional safety check)
    if (coupon.excludedProducts && coupon.excludedProducts.length > 0) {
      const isExcluded = coupon.excludedProducts.some(productId => 
        productId.toString() === item.productId.toString()
      );
      if (isExcluded) continue;
    }
    
    const quantity = item.quantity || 1;
    
    // Find applicable tier based on quantity
    const applicableTier = findApplicableTier(sortedTiers, quantity);
    
    if (applicableTier) {
      // Fixed amount discount per item
      const discountPerItem = applicableTier.discountValue;
      
      // Calculate total discount for this item
      totalDiscount = discountPerItem ;
    }
  }
  
  return totalDiscount;
}

// Helper: Calculate discount
function calculateDiscount(coupon, orderAmount, cartItems = []) {
  let discount = 0;

  switch (coupon.discountType) {
    case 'percentage':
      discount = (orderAmount * coupon.discountValue) / 100;
      break;
    
    case 'fixed':
      discount = Math.min(coupon.discountValue, orderAmount);
      break;
    
    case 'shipping':
      discount = coupon.discountValue;
      break;
    
    case 'tiered_quantity':
      discount = calculateTieredQuantityDiscount(coupon, cartItems);
      break;
    
    default:
      discount = 0;
  }

  // Apply maximum discount limit (if applicable)
  if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
    discount = coupon.maximumDiscount;
  }

  // Ensure discount doesn't exceed order amount
  discount = Math.min(discount, orderAmount);

  return Math.round(discount * 100) / 100;
}

// Helper: Validate coupon
async function validateCoupon(coupon, userId, orderAmount, cartItems = []) {
  const now = new Date();
  const startDate = new Date(coupon.startDate);
  const endDate = new Date(coupon.endDate);
  
  // Check if coupon is active
  if (!coupon.isActive) {
    return { valid: false, message: 'Coupon is not active' };
  }
  
  // Check date validity
  if (now < startDate) {
    return { valid: false, message: 'Coupon is not yet active' };
  }
  
  if (now > endDate) {
    return { valid: false, message: 'Coupon has expired' };
  }
  
  // Check usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  
  // Check minimum order amount
  if (orderAmount < coupon.minimumOrderAmount) {
    return { 
      valid: false, 
      message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required` 
    };
  }
  
  // Check for tiered quantity coupons
  if (coupon.discountType === 'tiered_quantity') {
    if (!cartItems || cartItems.length === 0) {
      return { valid: false, message: 'No items in cart' };
    }
    
    // Get minimum tier quantity
    const minTierQuantity = Math.min(...coupon.discountTiers.map(tier => tier.minimumQuantity));
    
    // Check if there's any Victoria-Luxe product with sufficient quantity
    let meetsQuantityRequirement = false;
    
    for (const item of cartItems) {
      // ONLY check Victoria-Luxe products
      if (item.name === "Victoria Luxe" && item.quantity >= minTierQuantity) {
        meetsQuantityRequirement = true;
        break;
      }
    }
    
    if (!meetsQuantityRequirement) {
      return { 
        valid: false, 
        message: `this code only for Victoria luxe ` 
      };
    }
  }
  
  // Check single use per user
  if (coupon.singleUse && coupon.userIdsUsed.includes(userId)) {
    return { valid: false, message: 'Coupon already used' };
  }
  
  return { valid: true, message: 'Coupon is valid' };
}

// Apply coupon
const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount, userId, cartItems } = req.body;

    if (!code || !userId || orderAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide code, userId, and orderAmount'
      });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim(), 
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Validate coupon
    const validation = await validateCoupon(coupon, userId, orderAmount, cartItems);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Calculate discount
    const discountAmount = calculateDiscount(coupon, orderAmount, cartItems);
    
    if (discountAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No discount applicable. This coupon only applies to Victoria-Luxe products with minimum quantity requirements.'
      });
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount);

    // Prepare response
    const response = {
      success: true,
      message: 'Coupon applied successfully',
      data: {
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountType === 'tiered_quantity' ? null : coupon.discountValue,
          discountAmount,
          finalAmount,
          minimumOrderAmount: coupon.minimumOrderAmount,
          maximumDiscount: coupon.maximumDiscount,
          applicableProduct: "Victoria-Luxe" // Explicitly mention the applicable product
        }
      }
    };

    // Add tier information if applicable
    if (coupon.discountType === 'tiered_quantity' && cartItems && cartItems.length > 0) {
      response.data.coupon.discountTiers = coupon.discountTiers;
      response.data.coupon.appliedTiers = [];
      
      for (const item of cartItems) {
        // Only show applied tiers for Victoria-Luxe products
        if (item.name === "Victoria Luxe") {
          const applicableTier = findApplicableTier(coupon.discountTiers, item.quantity);
          if (applicableTier) {
            response.data.coupon.appliedTiers.push({
              productId: item.productId,
              productName: item.name,
              quantity: item.quantity,
              discountPerItem: applicableTier.discountValue,
              discountForItem: applicableTier.discountValue * item.quantity,
              minimumQuantity: applicableTier.minimumQuantity
            });
          }
        }
      }
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Apply coupon error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while applying coupon'
    });
  }
};

// Create coupon (Admin only)
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      discountTiers,
      minimumOrderAmount = 0,
      maximumDiscount = null,
      startDate,
      endDate,
      usageLimit = null,
      isActive = true,
      applicableProducts = [],
      excludedProducts = [],
      singleUse = false
    } = req.body;

    // Validate required fields
    if (!code || !discountType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide code, discountType, startDate, and endDate'
      });
    }

    // Validate dates
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use ISO format (e.g., 2024-12-25T00:00:00.000Z)'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Validate discount type specific fields
    if (discountType === 'tiered_quantity') {
      if (!discountTiers || !Array.isArray(discountTiers) || discountTiers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide discountTiers for tiered_quantity discount type'
        });
      }

      // Validate each tier for fixed amount discount
      for (let i = 0; i < discountTiers.length; i++) {
        const tier = discountTiers[i];
        if (!tier.minimumQuantity || tier.minimumQuantity < 1) {
          return res.status(400).json({
            success: false,
            message: `Tier ${i + 1}: minimumQuantity must be at least 1`
          });
        }
        // For fixed amount, discountValue can be any positive number
        if (!tier.discountValue || tier.discountValue < 0) {
          return res.status(400).json({
            success: false,
            message: `Tier ${i + 1}: discountValue must be a positive number`
          });
        }
      }

      // Sort tiers by minimumQuantity ascending
      discountTiers.sort((a, b) => a.minimumQuantity - b.minimumQuantity);
      
      // For tiered_quantity coupons, add note about Victoria-Luxe product
      console.log('NOTE: This tiered coupon will only apply to "Victoria-Luxe" products');
    } else {
      if (!discountValue || discountValue < 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid discountValue'
        });
      }
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim() 
    });
    
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    // Create coupon object
    const couponData = {
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: discountType !== 'tiered_quantity' ? discountValue : undefined,
      discountTiers: discountType === 'tiered_quantity' ? discountTiers : undefined,
      minimumOrderAmount,
      maximumDiscount,
      startDate: start,
      endDate: end,
      usageLimit,
      isActive,
      applicableProducts,
      excludedProducts,
      singleUse,
      // Add metadata for tiered coupons
      note: discountType === 'tiered_quantity' ? 'This coupon only applies to Victoria Luxe products' : undefined
    };

    // Create the coupon
    const coupon = await Coupon.create(couponData);

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });

  } catch (error) {
    console.error('Create coupon error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while creating coupon'
    });
  }
};

// Get all coupons (Admin only)
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .populate('applicableProducts', 'name price')
      .populate('excludedProducts', 'name price');

    // Add special note for tiered coupons
    const couponsWithNotes = coupons.map(coupon => {
      if (coupon.discountType === 'tiered_quantity') {
        return {
          ...coupon.toObject(),
          specialNote: 'This coupon only applies to Victoria Luxe products'
        };
      }
      return coupon;
    });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      data: couponsWithNotes
    });

  } catch (error) {
    console.error('Get all coupons error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching coupons'
    });
  }
};

// Get coupon by ID (Admin only)
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('applicableProducts', 'name price')
      .populate('excludedProducts', 'name price');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Add special note for tiered coupons
    let responseData = coupon.toObject();
    if (coupon.discountType === 'tiered_quantity') {
      responseData.specialNote = 'This coupon only applies to Victoria Luxe products';
    }

    return res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Get coupon by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon ID'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching coupon'
    });
  }
};

// Update coupon (Admin only)
const updateCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      discountTiers,
      minimumOrderAmount,
      maximumDiscount,
      startDate,
      endDate,
      usageLimit,
      isActive,
      applicableProducts,
      excludedProducts,
      singleUse
    } = req.body;

    // Find coupon
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Update fields
    if (code && code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: code.toUpperCase().trim(),
        _id: { $ne: req.params.id }
      });
      
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
      
      coupon.code = code.toUpperCase().trim();
    }

    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (discountTiers !== undefined) coupon.discountTiers = discountTiers;
    if (minimumOrderAmount !== undefined) coupon.minimumOrderAmount = minimumOrderAmount;
    if (maximumDiscount !== undefined) coupon.maximumDiscount = maximumDiscount;
    if (startDate) coupon.startDate = new Date(startDate);
    if (endDate) coupon.endDate = new Date(endDate);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (applicableProducts !== undefined) coupon.applicableProducts = applicableProducts;
    if (excludedProducts !== undefined) coupon.excludedProducts = excludedProducts;
    if (singleUse !== undefined) coupon.singleUse = singleUse;

    // Validate dates
    if (coupon.endDate <= coupon.startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });

  } catch (error) {
    console.error('Update coupon error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon ID'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating coupon'
    });
  }
};

// Delete coupon (Admin only)
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    console.error('Delete coupon error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon ID'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting coupon'
    });
  }
};

// Mark coupon as used
const markCouponAsUsed = async (req, res) => {
  try {
    const { couponId, userId } = req.body;

    if (!couponId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide couponId and userId'
      });
    }

    const coupon = await Coupon.findById(couponId);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Update usage count
    coupon.usedCount += 1;
    
    // Add user to used list if single use
    if (coupon.singleUse && !coupon.userIdsUsed.includes(userId)) {
      coupon.userIdsUsed.push(userId);
    }

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: 'Coupon usage recorded',
      data: {
        usedCount: coupon.usedCount,
        remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.usedCount : null
      }
    });

  } catch (error) {
    console.error('Mark coupon as used error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while recording coupon usage'
    });
  }
};

module.exports = {
  applyCoupon,
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  markCouponAsUsed
};