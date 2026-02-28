// ==================== QUOTATION CONTROLLER ====================
// File: controller/Quotation.controller.js

const { errorResponse, successResponse } = require("../helper/response.helper");
const { SOMETHING_WENT_WRONG } = require("../helper/message.helper");
const { QuotationSchema } = require("./models_import");
const { findUserIdByEmail } = require('../utils/Finduserbyemail');
const QRCode = require('qrcode');
require("dotenv").config();

// ==================== UTILITIES ====================
const getEnv = (key, defaultValue = '') => {
  const value = process.env[key];
  return (value && typeof value === 'string') ? value.trim() : defaultValue;
};

const generateQuotationNumber = () =>
  `QT${Date.now()}${Math.floor(Math.random() * 1000)}`;

const generateQuotationQRCode = async (quotationNo) => {
  try {
    const BACKEND_BASE_URL = getEnv('BACKEND_BASE_URL', 'https://printe.in');
    const qrUrl = `${BACKEND_BASE_URL}/api/quotation/view/${quotationNo}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
      color: { dark: '#000000', light: '#FFFFFF' },
    });
    console.log(`✓ Quotation QR generated: ${qrUrl}`);
    return { qr_code: qrCodeDataUrl, qr_url: qrUrl, generated_at: new Date() };
  } catch (error) {
    console.error('✗ QR generation error:', error);
    throw new Error('QR code generation failed: ' + error.message);
  }
};


// ==================== ADMIN CREATE QUOTATION ====================
const adminCreateQuotation = async (req, res) => {
  try {
    const {
      customer_name, customer_email, customer_phone, company_name,
      cart_items, billing_address,
      delivery_charges = 0, free_delivery = false,
      gst_no, subtotal, tax_amount, discount_amount, discount_percentage,
      taxable_amount, total_amount,
      valid_until, notes, terms_and_conditions, admin_id
    } = req.body;

    console.log('='.repeat(60));
    console.log('Admin creating quotation:', { customer_email, admin_id });

    if (!customer_name || !customer_email || !customer_phone || !cart_items || !billing_address) {
      return errorResponse(res, "Missing required fields");
    }

    // ── Resolve user_id ────────────────────────────────────────────────────
    const userId = await findUserIdByEmail(customer_email);
    console.log(`User lookup → userId: ${userId}`);

    const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'http://localhost:5173');
    const quotationNo = generateQuotationNumber();

    // ── Process cart items ─────────────────────────────────────────────────
    const processedCartItems = Array.isArray(cart_items)
      ? cart_items.map(item => ({
          product_id:   item.product_id   || '',
          product_name: item.product_name || '',
          quantity:     parseInt(item.quantity)   || 1,
          mrp_price:    parseFloat(item.mrp_price || item.MRP_price || 0),
          price:        parseFloat(item.price)    || 0,
          image:        item.image  || '',
          size:         item.size   || '',
          color:        item.color  || '',
          notes:        item.notes  || '',
        }))
      : [];

    // ── Process billing address ────────────────────────────────────────────
    const processedAddress = {
      name:          customer_name,
      company:       company_name || '',
      email:         customer_email,
      mobile_number: customer_phone,
      street: billing_address.street
        || [billing_address.address_line1, billing_address.address_line2]
             .filter(Boolean).join(', ')
        || '',
      landmark:     billing_address.landmark     || billing_address.address_line2 || '',
      city:         billing_address.city         || '',
      state:        billing_address.state        || '',
      pincode:      billing_address.pincode      || '',
      country:      billing_address.country      || 'India',
      address_type: billing_address.address_type || 'billing',
    };

    // ── Generate QR ────────────────────────────────────────────────────────
    let qrCodeData = null;
    try {
      qrCodeData = await generateQuotationQRCode(quotationNo);
    } catch (err) {
      console.log('⚠ Quotation QR generation skipped:', err.message);
    }

    // ── Compute valid_until if not provided ────────────────────────────────
    const validUntilDate = valid_until
      ? new Date(valid_until)
      : (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d; })();

    // ── Build quotation document ───────────────────────────────────────────
    const quotationData = {
      user_id:              userId,
      quotation_no:         quotationNo,
      company_name:         company_name || '',
      cart_items:           processedCartItems,
      billing_address:      processedAddress,
      quotation_status:     'draft',
      subtotal:             parseFloat(subtotal      || 0),
      discount_percentage:  parseFloat(discount_percentage || 0),
      discount_amount:      parseFloat(discount_amount || 0),
      taxable_amount:       parseFloat(taxable_amount || subtotal || 0),
      tax_amount:           parseFloat(tax_amount     || 0),
      DeliveryCharges:      parseFloat(delivery_charges || 0),
      FreeDelivery:         !!free_delivery,
      total_amount:         parseFloat(total_amount   || 0),
      gst_no:               gst_no || '',
      valid_until:          validUntilDate,
      notes:                notes || '',
      terms_and_conditions: terms_and_conditions || '',
      created_by:           'admin',
      created_by_admin_id:  admin_id || null,
      converted_to_order:   false,
    };

    if (qrCodeData) {
      quotationData.qr_code           = qrCodeData.qr_code;
      quotationData.qr_url            = qrCodeData.qr_url;
      quotationData.qr_generated_at   = qrCodeData.generated_at;
    }

    const savedQuotation = await new QuotationSchema(quotationData).save();

    console.log(`✓ Quotation created: ${savedQuotation.quotation_no} | user_id: ${userId}`);
    console.log('='.repeat(60));

    return successResponse(res, "Quotation created", {
      quotation_id:   savedQuotation._id,
      quotation_no:   savedQuotation.quotation_no,
      quotation_status: savedQuotation.quotation_status,
      total_amount:   savedQuotation.total_amount,
      valid_until:    savedQuotation.valid_until,
      quotation_link: `${FRONTEND_BASE_URL}/quotation/${savedQuotation.quotation_no}`,
      pdf_link:       `${getEnv('BACKEND_BASE_URL', 'https://printe.in')}/api/quotation/pdf/${savedQuotation.quotation_no}`,
      qr_code:        savedQuotation.qr_code  || null,
      qr_url:         savedQuotation.qr_url   || null,
      user_id:        userId,
    });

  } catch (err) {
    console.error('✗ Admin quotation error:', err);
    return errorResponse(res, "Failed to create quotation");
  }
};


// ==================== GET QUOTATION BY NUMBER ====================
const getQuotationByNumber = async (req, res) => {
  try {
    const { quotation_no } = req.params;
    const quotation = await QuotationSchema.findOne({ quotation_no });
    if (!quotation) return errorResponse(res, "Quotation not found");

    return successResponse(res, "Quotation retrieved", {
      quotation_id:         quotation._id,
      quotation_no:         quotation.quotation_no,
      company_name:         quotation.company_name,
      customer_name:        quotation.billing_address.name,
      customer_email:       quotation.billing_address.email,
      customer_phone:       quotation.billing_address.mobile_number,
      cart_items:           quotation.cart_items,
      billing_address:      quotation.billing_address,
      subtotal:             quotation.subtotal,
      discount_percentage:  quotation.discount_percentage,
      discount_amount:      quotation.discount_amount,
      taxable_amount:       quotation.taxable_amount,
      tax_amount:           quotation.tax_amount,
      delivery_charges:     quotation.DeliveryCharges,
      total_amount:         quotation.total_amount,
      gst_no:               quotation.gst_no,
      quotation_status:     quotation.quotation_status,
      valid_until:          quotation.valid_until,
      terms_and_conditions: quotation.terms_and_conditions,
      notes:                quotation.notes,
      created_by:           quotation.created_by,
      converted_to_order:   quotation.converted_to_order,
      order_id:             quotation.order_id || null,
      qr_code:              quotation.qr_code,
      qr_url:               quotation.qr_url,
      createdAt:            quotation.createdAt,
    });
  } catch (err) {
    return errorResponse(res, "Failed to retrieve quotation");
  }
};


// ==================== GET ALL QUOTATIONS ====================
const getAllQuotations = async (req, res) => {
  try {
    const { page = 1, limit = 20, quotation_status, created_by, search } = req.query;
    const query = {};

    if (quotation_status) query.quotation_status = quotation_status;
    if (created_by)       query.created_by       = created_by;
    if (search) {
      query.$or = [
        { quotation_no:                    { $regex: search, $options: 'i' } },
        { 'billing_address.email':         { $regex: search, $options: 'i' } },
        { 'billing_address.name':          { $regex: search, $options: 'i' } },
        { company_name:                    { $regex: search, $options: 'i' } },
      ];
    }

    const skip       = (parseInt(page) - 1) * parseInt(limit);
    const quotations = await QuotationSchema
      .find(query)
      .select('-qr_code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await QuotationSchema.countDocuments(query);

    return successResponse(res, "Quotations retrieved", {
      quotations,
      pagination: {
        total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    return errorResponse(res, "Failed to retrieve quotations");
  }
};


// ==================== UPDATE QUOTATION STATUS ====================
const updateQuotationStatus = async (req, res) => {
  try {
    const { quotation_no } = req.params;
    const { status } = req.body;

    const ALLOWED_STATUSES = ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'];
    if (!ALLOWED_STATUSES.includes(status)) {
      return errorResponse(res, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
    }

    const quotation = await QuotationSchema.findOneAndUpdate(
      { quotation_no },
      { quotation_status: status, status_updated_at: new Date() },
      { new: true }
    );
    if (!quotation) return errorResponse(res, "Quotation not found");

    return successResponse(res, "Status updated", {
      quotation_no:     quotation.quotation_no,
      quotation_status: quotation.quotation_status,
    });
  } catch (err) {
    return errorResponse(res, "Failed to update status");
  }
};


// ==================== CONVERT QUOTATION TO ORDER ====================
const convertQuotationToOrder = async (req, res) => {
  try {
    const { quotation_no } = req.params;
    const quotation = await QuotationSchema.findOne({ quotation_no });
    if (!quotation) return errorResponse(res, "Quotation not found");

    if (quotation.converted_to_order) {
      return errorResponse(res, `Already converted to order: ${quotation.order_invoice_no}`);
    }

    const VALID_FOR_CONVERSION = ['sent', 'viewed', 'accepted', 'draft'];
    if (!VALID_FOR_CONVERSION.includes(quotation.quotation_status)) {
      return errorResponse(res, `Cannot convert quotation in '${quotation.quotation_status}' status`);
    }

    const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'http://localhost:5173');
    const BACKEND_URL = `${getEnv('BACKEND_BASE_URL', 'https://printe.in')}/api/payment/admin/create-order`;

    // Build order payload from quotation
    const orderPayload = {
      customer_name:    quotation.billing_address.name,
      customer_email:   quotation.billing_address.email,
      customer_phone:   quotation.billing_address.mobile_number,
      cart_items:       quotation.cart_items,
      delivery_address: quotation.billing_address,
      gst_no:           quotation.gst_no,
      delivery_charges: quotation.DeliveryCharges,
      free_delivery:    quotation.FreeDelivery,
      subtotal:         quotation.subtotal,
      tax_amount:       quotation.tax_amount,
      discount_amount:  quotation.discount_amount,
      total_amount:     quotation.total_amount,
      payment_type:     'Online Payment',
      notes:            `Converted from quotation: ${quotation_no}`,
      admin_id:         req.body.admin_id || null,
    };

    // POST to payment/admin/create-order internally
    const axios = require('axios');
    const orderResponse = await axios.post(BACKEND_URL, orderPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!orderResponse.data?.success) {
      return errorResponse(res, "Failed to create order from quotation");
    }

    const { invoice_no, payment_link } = orderResponse.data.data;

    // Mark quotation as converted
    await QuotationSchema.findByIdAndUpdate(quotation._id, {
      converted_to_order:   true,
      order_invoice_no:     invoice_no,
      quotation_status:     'converted',
      converted_at:         new Date(),
    });

    return successResponse(res, "Quotation converted to order", {
      quotation_no,
      invoice_no,
      payment_link,
    });
  } catch (err) {
    console.error('✗ Conversion error:', err);
    return errorResponse(res, "Failed to convert quotation to order");
  }
};


// ==================== GET QUOTATION STATUS ====================
const getQuotationStatus = async (req, res) => {
  try {
    const { quotation_no } = req.params;
    let quotation = await QuotationSchema.findOne({ quotation_no });
    if (!quotation) quotation = await QuotationSchema.findById(quotation_no).catch(() => null);
    if (!quotation) return errorResponse(res, "Quotation not found");

    // Auto-expire if past valid_until
    if (
      quotation.valid_until < new Date() &&
      !['expired', 'converted', 'rejected'].includes(quotation.quotation_status)
    ) {
      quotation = await QuotationSchema.findByIdAndUpdate(
        quotation._id,
        { quotation_status: 'expired' },
        { new: true }
      );
    }

    return successResponse(res, "Status retrieved", {
      quotation_no:       quotation.quotation_no,
      quotation_status:   quotation.quotation_status,
      total_amount:       quotation.total_amount,
      valid_until:        quotation.valid_until,
      converted_to_order: quotation.converted_to_order,
      order_invoice_no:   quotation.order_invoice_no || null,
      qr_url:             quotation.qr_url,
    });
  } catch (err) {
    return errorResponse(res, SOMETHING_WENT_WRONG);
  }
};


// ==================== REGENERATE QR CODE ====================
const regenerateQuotationQR = async (req, res) => {
  try {
    const { quotation_no } = req.params;
    const quotation = await QuotationSchema.findOne({ quotation_no });
    if (!quotation) return errorResponse(res, "Quotation not found");

    const qrCodeData = await generateQuotationQRCode(quotation.quotation_no);

    await QuotationSchema.findByIdAndUpdate(quotation._id, {
      qr_code:          qrCodeData.qr_code,
      qr_url:           qrCodeData.qr_url,
      qr_generated_at:  qrCodeData.generated_at,
    });

    return successResponse(res, "QR Code regenerated", {
      quotation_no,
      qr_code:      qrCodeData.qr_code,
      qr_url:       qrCodeData.qr_url,
      generated_at: qrCodeData.generated_at,
    });
  } catch (err) {
    return errorResponse(res, "Failed to regenerate QR");
  }
};


module.exports = {
  adminCreateQuotation,
  getQuotationByNumber,
  getAllQuotations,
  updateQuotationStatus,
  convertQuotationToOrder,
  getQuotationStatus,
  regenerateQuotationQR,
};