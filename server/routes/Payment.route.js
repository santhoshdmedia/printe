// ==================== PAYMENT ROUTES ====================
// File: routes/payment.routes.js

const express = require('express');
const router = express.Router();
const { 
  createPaymentOrder, 
  handleCCAvenueCallback, 
  getPaymentStatus,
  adminCreateOrder,
  getAllOrders,
  generatePaymentLink,
  getOrderByInvoice
} = require('../controller/Payment.controller');

// Middleware for admin authentication (add your own auth middleware)
const isAdmin = (req, res, next) => {
  // Add your admin authentication logic here
  // Example: check if user has admin role
  next();
};

// Customer routes
router.post('/create-order', createPaymentOrder);
router.post('/ccavenue/callback', handleCCAvenueCallback);
router.get('/ccavenue/callback', handleCCAvenueCallback);
router.get('/status/:order_id', getPaymentStatus);
router.get('/order/invoice/:invoice_no', getOrderByInvoice);

// Admin routes
router.post('/admin/create-order', isAdmin, adminCreateOrder);
router.get('/admin/orders', isAdmin, getAllOrders);
router.get('/admin/payment-link/:order_id', isAdmin, generatePaymentLink);

module.exports = router;