                                                                                                                                                                                                                                           const {  applyCoupon,
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  createBulkCoupons,
  markCouponAsUsed,
  getProductsForCoupon } = require("./controller_import");

const router = require("express").Router();

// Routes
router.post('/apply', applyCoupon);
router.post('/',  createCoupon);
router.get('/',  getAllCoupons);
router.get('/:id',  getCouponById);
router.put('/:id',  updateCoupon);
router.delete('/:id', deleteCoupon);
router.post('/bulk', createBulkCoupons);
router.patch('/used/:id', markCouponAsUsed);
router.get('/products/:id', getProductsForCoupon);
module.exports = router;
