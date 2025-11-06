                                                                                                                                                                                                                                           const {  applyCoupon,
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon } = require("./controller_import");

const router = require("express").Router();

// Routes
router.post('/apply', applyCoupon);
router.post('/',  createCoupon);
router.get('/',  getAllCoupons);
router.get('/:id',  getCouponById);
router.put('/:id',  updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;
