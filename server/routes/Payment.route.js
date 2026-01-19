// routes/payment.routes.js
const express = require('express');
const router = express.Router();
const { 
  createPaymentOrder,
  qrRedirectToGateway,
  handleCCAvenueCallback, 
  getPaymentStatus,
  adminCreateOrder,
  getAllOrders,
  generatePaymentLink,
  getOrderByInvoice,
  regenerateQRCode,
  getQRCode
} = require('../controller/Payment.controller');

// Middleware
const isAdmin = (req, res, next) => {
  // Add your admin auth logic
  next();
};

// Public routes
router.post('/create-order', createPaymentOrder);
router.get('/qr-redirect/:invoice_no', qrRedirectToGateway); // QR scan endpoint
router.post('/ccavenue/callback', handleCCAvenueCallback);
router.get('/ccavenue/callback', handleCCAvenueCallback);
router.get('/status/:order_id', getPaymentStatus);
router.get('/order/invoice/:invoice_no', getOrderByInvoice);
router.get('/qr-code/:order_id', getQRCode);

// Admin routes
router.post('/admin/create-order', isAdmin, adminCreateOrder);
router.get('/admin/orders', isAdmin, getAllOrders);
router.get('/admin/payment-link/:order_id', isAdmin, generatePaymentLink);
router.post('/admin/regenerate-qr/:order_id', isAdmin, regenerateQRCode);

module.exports = router;