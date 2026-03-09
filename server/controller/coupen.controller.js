const Coupon = require('../modals/coupen.modals');

// Helper: Validate date
function isValidDate(date) {
  return date && !isNaN(new Date(date).getTime());
}

// Helper: Get discount value based on user type
// FIX: Added 'user' as an alias for 'customer' to match what applyCoupon sends
function getDiscountValue(coupon, userType) {
  switch (userType?.toLowerCase()) {
    case 'dealer':
      return coupon.Dealer_discountValue || 0;
    case 'corporate':
      return coupon.Corporate_discountValue || 0;
    case 'customer':
    case 'user': // FIX: 'user' was accepted by applyCoupon but never mapped here — caused 0 discount
    default:
      return coupon.Customer_discountValue || 0;
  }
}

// Helper: Get tier discount value based on user type
// FIX: Added 'user' alias here too for consistency
function getTierDiscountValue(tier, userType) {
  switch (userType?.toLowerCase()) {
    case 'dealer':
      return tier.Dealer_discountValue || 0;
    case 'corporate':
      return tier.Corporate_discountValue || 0;
    case 'customer':
    case 'user': // FIX: same alias fix
    default:
      return tier.Customer_discountValue || 0;
  }
}

// Helper: Find applicable tier for quantity
function findApplicableTier(discountTiers, quantity) {
  if (!discountTiers || discountTiers.length === 0) return null;
  const sortedTiers = [...discountTiers].sort((a, b) => b.minimumQuantity - a.minimumQuantity);
  return sortedTiers.find(tier => quantity >= tier.minimumQuantity);
}

// Helper: Check if a cart item matches the coupon's applicable products
// FIX: Previously matched only by hardcoded name "Victoria Luxe".
// Now matches by applicableProducts ID first (correct), falls back to name only
// if no applicableProducts are set on the coupon.
function isItemApplicableForTier(coupon, item) {
  const hasProductRestriction = coupon.applicableProducts && coupon.applicableProducts.length > 0;

  if (hasProductRestriction) {
    const applicableIds = coupon.applicableProducts.map(id => id.toString());
    const itemId = (item.productId || item._id || '').toString();
    return applicableIds.includes(itemId);
  }

  // Fallback: match by name if no product IDs are set
  return item.name === "Victoria Luxe" || item.product_name === "Victoria Luxe";
}

// Helper: Calculate tiered quantity discount
function calculateTieredQuantityDiscount(coupon, cartItems, userType) {
  let totalDiscount = 0;

  if (!coupon.discountTiers || coupon.discountTiers.length === 0) {
    return totalDiscount;
  }

  for (const item of cartItems) {
    // FIX: Use product ID matching instead of hardcoded "Victoria Luxe" name check
    if (!isItemApplicableForTier(coupon, item)) {
      continue;
    }

    const quantity = item.quantity || 1;
    const applicableTier = findApplicableTier(coupon.discountTiers, quantity);

    if (applicableTier) {
      const discountValue = getTierDiscountValue(applicableTier, userType);

      if (coupon.discountType === 'percentage') {
        const itemPrice = item.price || item.unitPrice || 0;
        totalDiscount += (itemPrice * discountValue / 100) * quantity;
      } else {
        totalDiscount += discountValue;
      }
    }
  }

  return totalDiscount;
}

// Helper: Check if cart contains at least one applicable product
// FIX: This entire function is NEW — applicableProducts was stored but never checked,
// meaning product-specific coupons applied to ALL orders regardless of cart contents
function cartContainsApplicableProduct(coupon, cartItems) {
  // If no applicableProducts restriction, coupon applies to everything
  if (!coupon.applicableProducts || coupon.applicableProducts.length === 0) {
    return true;
  }

  // Convert ObjectIds to strings for comparison
  const applicableIds = coupon.applicableProducts.map(id => id.toString());

  return cartItems.some(item => {
    const itemId = (item.productId || item._id || '').toString();
    return applicableIds.includes(itemId);
  });
}

// Helper: Filter order amount to only include applicable products
// FIX: NEW — when a coupon is product-specific, discount should only apply
// to the price of those products, not the entire order total
function getApplicableOrderAmount(coupon, cartItems, totalOrderAmount) {
  if (!coupon.applicableProducts || coupon.applicableProducts.length === 0) {
    return totalOrderAmount; // No restriction — use full order amount
  }

  const applicableIds = coupon.applicableProducts.map(id => id.toString());

  const applicableAmount = cartItems.reduce((sum, item) => {
    const itemId = (item.productId || item._id || '').toString();
    if (applicableIds.includes(itemId)) {
      const price = item.price || item.unitPrice || 0;
      const qty = item.quantity || 1;
      return sum + price * qty;
    }
    return sum;
  }, 0);

  return applicableAmount;
}

// Helper: Calculate discount
function calculateDiscount(coupon, orderAmount, cartItems = [], userType = 'customer') {
  let discount = 0;

  // FIX: For product-specific coupons, only apply discount to applicable items' total
  const applicableAmount = getApplicableOrderAmount(coupon, cartItems, orderAmount);

  switch (coupon.discountType) {
    case 'percentage':
      discount = (applicableAmount * getDiscountValue(coupon, userType)) / 100;
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

  // DEBUG: Remove these logs once working
  console.log('\n=== COUPON VALIDATION DEBUG ===');
  console.log('Code:', coupon.code, '| discountType:', coupon.discountType);
  console.log('applicableProducts:', JSON.stringify(coupon.applicableProducts));
  console.log('applicableCategories:', JSON.stringify(coupon.applicableCategories));
  console.log('cartItems:', JSON.stringify(cartItems));
  console.log('orderAmount:', orderAmount, '| minimumOrderAmount:', coupon.minimumOrderAmount);
  console.log('================================\n');

  if (!coupon.isActive) {
        console.log('VALIDATION FAILED AT LINE ~' + 189, "return { valid: false, message: 'Coupon is not active' };");
    return { valid: false, message: 'Coupon is not active' };
  }

  if (now < startDate) {
        console.log('VALIDATION FAILED AT LINE ~' + 193, "return { valid: false, message: 'Coupon is not yet active' };");
    return { valid: false, message: 'Coupon is not yet active' };
  }

  if (now > endDate) {
        console.log('VALIDATION FAILED AT LINE ~' + 197, "return { valid: false, message: 'Coupon has expired' };");
    return { valid: false, message: 'Coupon has expired' };
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        console.log('VALIDATION FAILED AT LINE ~' + 201, "return { valid: false, message: 'Coupon usage limit reached' };");
    return { valid: false, message: 'Coupon usage limit reached' };
  }

  if (orderAmount < coupon.minimumOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required`
    };
  }

  // Check applicableProducts restriction
  // FIX: Was never checked before — product-specific coupons applied to all orders
  if (!cartContainsApplicableProduct(coupon, cartItems)) {
    return {
      valid: false,
      message: 'This coupon is not applicable to the products in your cart'
    };
  }

  // Check applicableCategories restriction
  if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
    const isAllCategories = coupon.applicableCategories.includes('all');
    if (!isAllCategories) {
      const applicableCatIds = coupon.applicableCategories.map(id => id.toString());

      const cartHasCategory = cartItems.some(item => {
        // Match categoryId if present. Also check productId as fallback —
        // some frontends accidentally send the category ObjectId in the productId field.
        const itemCatId = (item.categoryId || item.category || '').toString();
        const itemProductId = (item.productId || '').toString();
        return applicableCatIds.includes(itemCatId) || applicableCatIds.includes(itemProductId);
      });

      if (!cartHasCategory) {
        return {
          valid: false,
          message: 'This coupon is not applicable to the categories in your cart'
        };
      }
    }
  }

  // Check for tiered quantity coupons
  if (coupon.discountType === 'tiered_quantity') {
    if (!cartItems || cartItems.length === 0) {
          console.log('VALIDATION FAILED AT LINE ~' + 246, "return { valid: false, message: 'No items in cart' };");
      return { valid: false, message: 'No items in cart' };
    }

    const minTierQuantity = Math.min(...coupon.discountTiers.map(tier => tier.minimumQuantity));

    // FIX: Use isItemApplicableForTier() — matches by product ID, not hardcoded name
    const hasApplicableItem = cartItems.some(
      item => isItemApplicableForTier(coupon, item) && (item.quantity || 1) >= minTierQuantity
    );

    if (!hasApplicableItem) {
      return {
        valid: false,
        message: `Requires minimum ${minTierQuantity} unit(s) of an applicable product`
      };
    }
  }

  if (coupon.singleUse && coupon.userIdsUsed && coupon.userIdsUsed.includes(userId)) {
        console.log('VALIDATION FAILED AT LINE ~' + 265, "return { valid: false, message: 'Coupon already used' };");
    return { valid: false, message: 'Coupon already used' };
  }

  return { valid: true, message: 'Coupon is valid' };
}

// Apply coupon
const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount, userId, cartItems = [], userType = 'user' } = req.body;

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

    const validUserTypes = ['user', 'dealer', 'corporate'];
    if (!validUserTypes.includes(userType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    const validation = await validateCoupon(coupon, userId, orderAmount, cartItems, userType);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const discountAmount = calculateDiscount(coupon, orderAmount, cartItems, userType);

    if (discountAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No discount applicable with selected products'
      });
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount);

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

    if (coupon.discountType === 'tiered_quantity') {
      response.data.coupon.discountTiers = coupon.discountTiers;
      response.data.coupon.applicableProduct = "Victoria Luxe";
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

// Get all coupons (Admin only)
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    const couponsWithDetails = coupons.map(coupon => {
      const couponObj = coupon.toObject();
      couponObj.discountValues = {
        customer: couponObj.Customer_discountValue,
        dealer: couponObj.Dealer_discountValue,
        corporate: couponObj.Corporate_discountValue
      };
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
    couponObj.discountValues = {
      customer: couponObj.Customer_discountValue,
      dealer: couponObj.Dealer_discountValue,
      corporate: couponObj.Corporate_discountValue
    };
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
      return res.status(400).json({ success: false, message: 'Invalid coupon ID' });
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

    if (!code || !discountType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide code, discountType, startDate, and endDate'
      });
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

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

    // FIX: Removed broken 'PERCENTAGE' (uppercase) branch — the schema enum only allows
    // lowercase 'percentage', so that branch could never be reached and was dead code.
    // tiered_quantity and all other types are now handled cleanly.
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
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
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
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const updates = req.body;

    if (updates.code && updates.code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: updates.code.toUpperCase().trim(),
        _id: { $ne: req.params.id }
      });
      if (existingCoupon) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      }
      coupon.code = updates.code.toUpperCase().trim();
    }

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
      return res.status(400).json({ success: false, message: 'Invalid coupon ID' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
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
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });

  } catch (error) {
    console.error('Delete coupon error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid coupon ID' });
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
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    coupon.usedCount = (coupon.usedCount || 0) + 1;

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