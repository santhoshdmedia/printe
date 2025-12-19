const Coupon = require('../modals/coupen.modals');

// Helper: Validate date
function isValidDate(date) {
  return date && !isNaN(new Date(date).getTime());
}

// Helper: Get discount value based on user type
function getDiscountValue(coupon, userType) {
  switch (userType?.toLowerCase()) {
    case 'dealer':
      return coupon.Dealer_discountValue || 0;
    case 'corporate':
      return coupon.Corporate_discountValue || 0;
    case 'customer':
    default:
      return coupon.Customer_discountValue || 0;
  }
}

// Helper: Get tier discount value based on user type
function getTierDiscountValue(tier, userType) {
  switch (userType?.toLowerCase()) {
    case 'dealer':
      return tier.Dealer_discountValue || 0;
    case 'corporate':
      return tier.Corporate_discountValue || 0;
    case 'customer':
    default:
      return tier.Customer_discountValue || 0;
  }
}

// Helper: Find applicable tier for quantity
function findApplicableTier(discountTiers, quantity) {
  if (!discountTiers || discountTiers.length === 0) return null;
  
  // Sort by highest minimum quantity first (for tier matching)
  const sortedTiers = [...discountTiers].sort((a, b) => b.minimumQuantity - a.minimumQuantity);
  return sortedTiers.find(tier => quantity >= tier.minimumQuantity);
}

// Helper: Calculate tiered quantity discount - ONLY FOR Victoria Luxe
function calculateTieredQuantityDiscount(coupon, cartItems, userType) {
  let totalDiscount = 0;

  if (!coupon.discountTiers || coupon.discountTiers.length === 0) {
    return totalDiscount;
  }

  for (const item of cartItems) {
    // Check if product name matches exactly "Victoria Luxe"
    if (item.name !== "Victoria Luxe" && item.product_name !== "Victoria Luxe") {
      continue;
    }

    const quantity = item.quantity || 1;
    const applicableTier = findApplicableTier(coupon.discountTiers, quantity);

    if (applicableTier) {
      const discountValue = getTierDiscountValue(applicableTier, userType);
      
      if (coupon.discountType === 'percentage') {
        // For percentage discount, use item price
        const itemPrice = item.price || item.unitPrice || 0;
        totalDiscount += (itemPrice * discountValue / 100) * quantity;
      } else {
        // For fixed amount discount
        totalDiscount = discountValue ;
      }
    }
  }

  return totalDiscount;
}

// Helper: Calculate discount
function calculateDiscount(coupon, orderAmount, cartItems = [], userType = 'customer') {
  let discount = 0;

  switch (coupon.discountType) {
    case 'percentage':
      discount = (orderAmount * getDiscountValue(coupon, userType)) / 100;
      break;

    case 'fixed':
      discount = getDiscountValue(coupon, userType);
      break;

    case 'shipping':
      discount = getDiscountValue(coupon, userType);
      break;

    case 'tiered_quantity':
      discount = calculateTieredQuantityDiscount(coupon, cartItems, userType);
      break;

    default:
      discount = 0;
  }

  // Apply maximum discount limit
  if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
    discount = coupon.maximumDiscount;
  }

  // Ensure discount doesn't exceed order amount
  discount = Math.min(discount, orderAmount);

  return Math.round(discount * 100) / 100;
}

// Helper: Validate coupon
async function validateCoupon(coupon, userId, orderAmount, cartItems = [], userType = 'customer') {
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

    // Check if there's any Victoria Luxe product with sufficient quantity
    let hasVictoriaLuxe = false;
    for (const item of cartItems) {
      if ((item.name === "Victoria Luxe" || item.product_name === "Victoria Luxe") && 
          item.quantity >= minTierQuantity) {
        hasVictoriaLuxe = true;
        break;
      }
    }

    if (!hasVictoriaLuxe) {
      return {
        valid: false,
        message: `Requires minimum ${minTierQuantity} Victoria Luxe product(s)`
      };
    }
  }

  // Check single use per user
  if (coupon.singleUse && coupon.userIdsUsed && coupon.userIdsUsed.includes(userId)) {
    return { valid: false, message: 'Coupon already used' };
  }

  return { valid: true, message: 'Coupon is valid' };
}

// Apply coupon
const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount, userId, cartItems = [], userType = 'user' } = req.body;

    // Validate input
    if (!code || !userId || orderAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide code, userId, and orderAmount'
      });
    }

    // Find coupon
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

    // Validate user type
    const validUserTypes = ['user', 'dealer', 'corporate'];
    if (!validUserTypes.includes(userType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    // Validate coupon
    const validation = await validateCoupon(coupon, userId, orderAmount, cartItems, userType);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Calculate discount
    const discountAmount = calculateDiscount(coupon, orderAmount, cartItems, userType);

    if (discountAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No discount applicable with selected products'
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
          discountValue: coupon.discountType === 'tiered_quantity' ? null : getDiscountValue(coupon, userType),
          discountAmount: discountAmount,
          finalAmount: finalAmount,
          minimumOrderAmount: coupon.minimumOrderAmount,
          maximumDiscount: coupon.maximumDiscount,
          userType: userType,
          discountValues: {
            customer: coupon.Customer_discountValue,
            dealer: coupon.Dealer_discountValue,
            corporate: coupon.Corporate_discountValue
          }
        }
      }
    };

    // Add tier information if applicable
    if (coupon.discountType === 'tiered_quantity') {
      response.data.coupon.discountTiers = coupon.discountTiers;
      response.data.coupon.applicableProduct = "Victoria Luxe";
      
      // Find applied tiers for each Victoria Luxe product
      response.data.coupon.appliedTiers = [];
      
      for (const item of cartItems) {
        if (item.name === "Victoria Luxe" || item.product_name === "Victoria Luxe") {
          const applicableTier = findApplicableTier(coupon.discountTiers, item.quantity || 1);
          if (applicableTier) {
            const discountPerItem = getTierDiscountValue(applicableTier, userType);
            response.data.coupon.appliedTiers.push({
              productId: item.productId || item._id,
              productName: item.name || item.product_name,
              quantity: item.quantity || 1,
              discountValue: discountPerItem,
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

// Get all coupons (Admin only) - Fixed to avoid Product model issues
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    
    // Add discount values for all user types
    const couponsWithDetails = coupons.map(coupon => {
      const couponObj = coupon.toObject();
      
      // Add discount values for all user types
      couponObj.discountValues = {
        customer: couponObj.Customer_discountValue,
        dealer: couponObj.Dealer_discountValue,
        corporate: couponObj.Corporate_discountValue
      };

      // Add special note for tiered coupons
      if (couponObj.discountType === 'tiered_quantity') {
        couponObj.specialNote = 'This coupon only applies to Victoria Luxe products';
      }
      
      return couponObj;
    });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      data: couponsWithDetails
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
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    const couponObj = coupon.toObject();
    
    // Add discount values for all user types
    couponObj.discountValues = {
      customer: couponObj.Customer_discountValue,
      dealer: couponObj.Dealer_discountValue,
      corporate: couponObj.Corporate_discountValue
    };

    // Add special note for tiered coupons
    if (couponObj.discountType === 'tiered_quantity') {
      couponObj.specialNote = 'This coupon only applies to Victoria Luxe products';
    }

    return res.status(200).json({
      success: true,
      data: couponObj
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

// Create coupon (Admin only)
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      Customer_discountValue,
      Dealer_discountValue,
      Corporate_discountValue,
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
        message: 'Invalid date format'
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
      minimumOrderAmount,
      maximumDiscount,
      startDate: start,
      endDate: end,
      usageLimit,
      isActive,
      applicableProducts,
      excludedProducts,
      singleUse
    };

    // Add discount values based on type
    if (discountType === 'tiered_quantity') {
      if (!discountTiers || !Array.isArray(discountTiers) || discountTiers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide discountTiers for tiered_quantity discount type'
        });
      }
      couponData.discountTiers = discountTiers;
      couponData.note = 'This coupon only applies to Victoria Luxe products';
    } else {
      // For non-tiered coupons, require all three discount values
      if (Customer_discountValue === undefined || Dealer_discountValue === undefined || Corporate_discountValue === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Please provide Customer_discountValue, Dealer_discountValue, and Corporate_discountValue'
        });
      }
      couponData.Customer_discountValue = Customer_discountValue;
      couponData.Dealer_discountValue = Dealer_discountValue;
      couponData.Corporate_discountValue = Corporate_discountValue;
    }

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

// Update coupon (Admin only)
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Update fields
    const updates = req.body;
    
    if (updates.code && updates.code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: updates.code.toUpperCase().trim(),
        _id: { $ne: req.params.id }
      });

      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
      coupon.code = updates.code.toUpperCase().trim();
    }

    // Update other fields
    Object.keys(updates).forEach(key => {
      if (key !== 'code' && key !== '_id') {
        coupon[key] = updates[key];
      }
    });

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
    coupon.usedCount = (coupon.usedCount || 0) + 1;

    // Add user to used list if single use
    if (coupon.singleUse) {
      if (!coupon.userIdsUsed) coupon.userIdsUsed = [];
      if (!coupon.userIdsUsed.includes(userId)) {
        coupon.userIdsUsed.push(userId);
      }
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