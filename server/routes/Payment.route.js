const express = require('express');
const router = express.Router();
const {
  applyCoupon,
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  markCouponAsUsed
} = require('../controller/coupen.controller');

// Apply coupon (Public - but requires user authentication in production)
router.post('/apply', applyCoupon);

// Admin routes (Add authentication middleware in production)
router.post('/', createCoupon);
router.get('/', getAllCoupons);
router.get('/:id', getCouponById);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);
router.post('/mark-used', markCouponAsUsed);

module.exports = router;