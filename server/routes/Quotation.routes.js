// ==================== QUOTATION ROUTES ====================
// File: routes/quotation.routes.js

const express = require('express');
const router = express.Router();
const {
    adminCreateQuotation,
    getQuotationByNumber,
    getAllQuotations,
    updateQuotationStatus,
    convertQuotationToOrder,
    getQuotationStatus,
    regenerateQuotationQR,
} = require('../controller/Quotation.controller');

// Admin routes
router.post('/admin/create', adminCreateQuotation);
router.get('/admin/all', getAllQuotations);
router.patch('/:quotation_no/status', updateQuotationStatus);
router.post('/:quotation_no/convert-to-order', convertQuotationToOrder);

// Public / shared routes
router.get('/view/:quotation_no', getQuotationByNumber);
router.get('/status/:quotation_no', getQuotationStatus);
router.post('/regenerate-qr/:quotation_no', regenerateQuotationQR);

module.exports = router;

// ── Register in app.js / server.js ────────────────────────────────────────
// const quotationRoutes = require('./routes/quotation.routes');
// app.use('/api/quotation', quotationRoutes);