const Coupon = require('../modals/coupen.modals');
const Product = require('../modals/product.models'); // adjust path as needed
const crypto = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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
    case 'user':
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
    case 'user':
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

// Helper: Safely extract a string ID from either a populated object or a raw ObjectId/string.
// After .populate(), applicableProducts entries are objects { _id, name, … }.
// Without populate they are raw ObjectIds. Both cases are handled here.
function toIdString(val) {
  if (val && typeof val === 'object' && val._id) return val._id.toString();
  return val ? val.toString() : '';
}

// Helper: Check if a cart item matches the coupon's applicable products
function isItemApplicableForTier(coupon, item) {
  const hasProductRestriction =
    coupon.applicableProducts && coupon.applicableProducts.length > 0;

  if (hasProductRestriction) {
    const applicableIds = coupon.applicableProducts.map(toIdString);
    const itemId = (item.productId || item._id || '').toString();
    return applicableIds.includes(itemId);
  }

  // Fallback: match by name if no product IDs are set
  return item.name === 'Victoria Luxe' || item.product_name === 'Victoria Luxe';
}

// Helper: Calculate tiered quantity discount
function calculateTieredQuantityDiscount(coupon, cartItems, userType) {
  let totalDiscount = 0;

  if (!coupon.discountTiers || coupon.discountTiers.length === 0) {
    return totalDiscount;
  }

  for (const item of cartItems) {
    if (!isItemApplicableForTier(coupon, item)) continue;

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
function cartContainsApplicableProduct(coupon, cartItems) {
  if (!coupon.applicableProducts || coupon.applicableProducts.length === 0) {
    return true; // no restriction → applies to everything
  }

  const applicableIds = coupon.applicableProducts.map(toIdString);

  return cartItems.some(item => {
    const itemId = (item.productId || item._id || '').toString();
    return applicableIds.includes(itemId);
  });
}

// Helper: Filter order amount to only include applicable products
function getApplicableOrderAmount(coupon, cartItems, totalOrderAmount) {
  if (!coupon.applicableProducts || coupon.applicableProducts.length === 0) {
    return totalOrderAmount;
  }

  const applicableIds = coupon.applicableProducts.map(toIdString);

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

  if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
    discount = coupon.maximumDiscount;
  }

  discount = Math.min(discount, orderAmount);

  return Math.round(discount * 100) / 100;
}

// Helper: Validate coupon
async function validateCoupon(coupon, userId, orderAmount, cartItems = [], userType = 'customer') {
  const now = new Date();
  const startDate = new Date(coupon.startDate);
  const endDate = new Date(coupon.endDate);

  if (!coupon.isActive) {
    return { valid: false, message: 'Coupon is not active' };
  }

  if (now < startDate) {
    return { valid: false, message: 'Coupon is not yet active' };
  }

  if (now > endDate) {
    return { valid: false, message: 'Coupon has expired' };
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }

  if (orderAmount < coupon.minimumOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required`
    };
  }

  // ── Product-specific validation ────────────────────────────────────────────
  // If the coupon targets specific products, the cart MUST contain at least one.
  if (!cartContainsApplicableProduct(coupon, cartItems)) {
    return {
      valid: false,
      message: 'This coupon is not applicable to the products in your cart'
    };
  }

  if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
    const isAllCategories = coupon.applicableCategories.includes('all');
    if (!isAllCategories) {
      const applicableCatIds = coupon.applicableCategories.map(id => id.toString());

      const cartHasCategory = cartItems.some(item => {
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

  if (coupon.discountType === 'tiered_quantity') {
    if (!cartItems || cartItems.length === 0) {
      return { valid: false, message: 'No items in cart' };
    }

    const minTierQuantity = Math.min(...coupon.discountTiers.map(tier => tier.minimumQuantity));

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
    return { valid: false, message: 'You have already used this coupon' };
  }

  return { valid: true, message: 'Coupon is valid' };
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW: Get products list for coupon UI (dropdown population)
// GET /api/coupon/products
// Returns only the fields the coupon UI needs (id, name, product_code, images)
// ─────────────────────────────────────────────────────────────────────────────
const getProductsForCoupon = async (req, res) => {
  try {
    const products = await Product.find(
      { is_visible: true },
      { _id: 1, name: 1, product_code: 1, images: 1 }
    ).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get products for coupon error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching products'
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Apply coupon
// ─────────────────────────────────────────────────────────────────────────────
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
    }).populate('applicableProducts', '_id name product_code');

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

    // Atomically increment usedCount and record userId for singleUse coupons.
    const updateQuery = { $inc: { usedCount: 1 } };

    if (coupon.singleUse) {
      updateQuery.$addToSet = { userIdsUsed: userId };
    }

    const updateFilter = { _id: coupon._id };
    if (coupon.usageLimit !== null) {
      updateFilter.$expr = { $lt: ['$usedCount', coupon.usageLimit] };
    }

    const updatedCoupon = await Coupon.findOneAndUpdate(updateFilter, updateQuery, { new: true });

    if (!updatedCoupon && coupon.usageLimit !== null) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit just reached. Please try a different coupon.'
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
          discountValue:
            coupon.discountType === 'tiered_quantity' ? null : getDiscountValue(coupon, userType),
          discountAmount,
          finalAmount,
          minimumOrderAmount: coupon.minimumOrderAmount,
          maximumDiscount: coupon.maximumDiscount,
          userType,
          usedCount: updatedCoupon ? updatedCoupon.usedCount : coupon.usedCount + 1,
          remainingUses: coupon.usageLimit
            ? coupon.usageLimit -
              (updatedCoupon ? updatedCoupon.usedCount : coupon.usedCount + 1)
            : null,
          // Return which products this coupon is restricted to so the frontend
          // can inform the customer clearly.
          applicableProducts:
            coupon.applicableProducts && coupon.applicableProducts.length > 0
              ? coupon.applicableProducts.map(p => ({
                  _id: p._id,
                  name: p.name,
                  product_code: p.product_code
                }))
              : [],
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
      response.data.coupon.appliedTiers = [];

      for (const item of cartItems) {
        if (isItemApplicableForTier(coupon, item)) {
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

// ─────────────────────────────────────────────────────────────────────────────
// Get all coupons (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
const getAllCoupons = async (req, res) => {
  try {
    // Populate applicableProducts so admin UI can display product names
    const coupons = await Coupon.find()
      .populate('applicableProducts', '_id name product_code images')
      .sort({ createdAt: -1 });

    const couponsWithDetails = coupons.map(coupon => {
      const couponObj = coupon.toObject();
      couponObj.discountValues = {
        customer: couponObj.Customer_discountValue,
        dealer: couponObj.Dealer_discountValue,
        corporate: couponObj.Corporate_discountValue
      };
      couponObj.remainingUses = couponObj.usageLimit
        ? couponObj.usageLimit - couponObj.usedCount
        : null;
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

// ─────────────────────────────────────────────────────────────────────────────
// Get coupon by ID (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate(
      'applicableProducts',
      '_id name product_code images'
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const couponObj = coupon.toObject();
    couponObj.discountValues = {
      customer: couponObj.Customer_discountValue,
      dealer: couponObj.Dealer_discountValue,
      corporate: couponObj.Corporate_discountValue
    };
    couponObj.remainingUses = couponObj.usageLimit
      ? couponObj.usageLimit - couponObj.usedCount
      : null;

    return res.status(200).json({ success: true, data: couponObj });
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

// ─────────────────────────────────────────────────────────────────────────────
// Create coupon (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
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
      jobNo,
      endDate,
      usageLimit = null,
      isActive = true,
      // applicableProducts: array of product ObjectIds.
      // When provided and non-empty, the coupon is restricted to those products only.
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
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    // Validate that supplied product IDs actually exist in the DB
    if (applicableProducts && applicableProducts.length > 0) {
      const foundCount = await Product.countDocuments({
        _id: { $in: applicableProducts }
      });
      if (foundCount !== applicableProducts.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more applicableProducts IDs are invalid'
        });
      }
    }

    const couponData = {
      code: code.toUpperCase().trim(),
      discountType,
      minimumOrderAmount,
      maximumDiscount,
      startDate: start,
      endDate: end,
      usageLimit,
      jobNo,
      isActive,
      applicableProducts,
      excludedProducts,
      singleUse
    };

    if (discountType === 'tiered_quantity') {
      if (!discountTiers || !Array.isArray(discountTiers) || discountTiers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide discountTiers for tiered_quantity discount type'
        });
      }
      couponData.discountTiers = discountTiers;
    } else {
      if (
        Customer_discountValue === undefined ||
        Dealer_discountValue === undefined ||
        Corporate_discountValue === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Please provide Customer_discountValue, Dealer_discountValue, and Corporate_discountValue'
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

// ─────────────────────────────────────────────────────────────────────────────
// Update coupon (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const updates = req.body;

    // Validate updated applicableProducts if provided
    if (updates.applicableProducts && updates.applicableProducts.length > 0) {
      const foundCount = await Product.countDocuments({
        _id: { $in: updates.applicableProducts }
      });
      if (foundCount !== updates.applicableProducts.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more applicableProducts IDs are invalid'
        });
      }
    }

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

// ─────────────────────────────────────────────────────────────────────────────
// Delete coupon (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Mark coupon as used (call from Order creation endpoint AFTER order is confirmed)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Bulk coupon creation (Admin only)
// ─────────────────────────────────────────────────────────────────────────────

function generateRandomSuffix(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

async function generateUniqueCode(prefix, existingCodesSet, suffixLength = 6, maxAttempts = 20) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = `${prefix}-${generateRandomSuffix(suffixLength)}`.toUpperCase();

    if (existingCodesSet.has(code)) continue;

    const exists = await Coupon.findOne({ code });
    if (!exists) return code;
  }
  throw new Error('Failed to generate a unique coupon code after multiple attempts');
}

const createBulkCoupons = async (req, res) => {
  try {
    const {
      prefix,
      count = 1,
      discountType,
      Customer_discountValue,
      Dealer_discountValue,
      Corporate_discountValue,
      discountTiers,
      minimumOrderAmount = 0,
      maximumDiscount = null,
      startDate,
      endDate,
      isActive = true,
      applicableProducts = [],
      excludedProducts = [],
      applicableCategories = [],
      suffixLength = 6
    } = req.body;

    if (!prefix || typeof prefix !== 'string' || !prefix.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid prefix' });
    }

    if (!discountType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide discountType, startDate, and endDate'
      });
    }

    const numCount = parseInt(count, 10);
    if (!Number.isInteger(numCount) || numCount < 1 || numCount > 100) {
      return res.status(400).json({
        success: false,
        message: 'Count must be an integer between 1 and 100'
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

    const cleanPrefix = prefix.trim().replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    if (!cleanPrefix) {
      return res.status(400).json({
        success: false,
        message: 'Prefix must contain alphanumeric characters'
      });
    }

    // Validate applicableProducts for bulk coupons too
    if (applicableProducts && applicableProducts.length > 0) {
      const foundCount = await Product.countDocuments({ _id: { $in: applicableProducts } });
      if (foundCount !== applicableProducts.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more applicableProducts IDs are invalid'
        });
      }
    }

    const baseCouponData = {
      discountType,
      minimumOrderAmount,
      maximumDiscount,
      startDate: start,
      endDate: end,
      usageLimit: 1,
      singleUse: true,
      isActive,
      applicableProducts,
      excludedProducts,
      applicableCategories
    };

    if (discountType === 'tiered_quantity') {
      if (!discountTiers || !Array.isArray(discountTiers) || discountTiers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide discountTiers for tiered_quantity discount type'
        });
      }
      baseCouponData.discountTiers = discountTiers;
    } else {
      if (
        Customer_discountValue === undefined ||
        Dealer_discountValue === undefined ||
        Corporate_discountValue === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Please provide Customer_discountValue, Dealer_discountValue, and Corporate_discountValue'
        });
      }
      baseCouponData.Customer_discountValue = Customer_discountValue;
      baseCouponData.Dealer_discountValue = Dealer_discountValue;
      baseCouponData.Corporate_discountValue = Corporate_discountValue;
    }

    const generatedCodes = new Set();
    const couponsToCreate = [];

    for (let i = 0; i < numCount; i++) {
      const code = await generateUniqueCode(cleanPrefix, generatedCodes, suffixLength);
      generatedCodes.add(code);
      couponsToCreate.push({ ...baseCouponData, code });
    }

    const createdCoupons = await Coupon.insertMany(couponsToCreate, { ordered: true });

    return res.status(201).json({
      success: true,
      message: `${createdCoupons.length} coupon(s) created successfully`,
      data: {
        count: createdCoupons.length,
        codes: createdCoupons.map(c => c.code),
        coupons: createdCoupons
      }
    });
  } catch (error) {
    console.error('Create bulk coupons error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A duplicate coupon code was generated. Please retry.'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while creating bulk coupons'
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
  markCouponAsUsed,
  createBulkCoupons,
  getProductsForCoupon  // ← new export; wire to GET /api/coupon/products in your router
};