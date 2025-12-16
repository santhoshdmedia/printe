const express = require('express');
const router = express.Router();
const { createPaymentOrder, handleCCAvenueCallback } = require('../controller/Payment.controller');

router.post('/create-order', createPaymentOrder);
router.post('/ccavenue/callback', handleCCAvenueCallback);

module.exports = router;