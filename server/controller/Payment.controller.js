// ==================== PAYMENT CONTROLLER WITH QR CODE ====================
// File: controller/Payment.controller.js
// This controller handles payment order creation, QR code generation,
// and direct redirection to CCAvenue payment gateway when QR is scanned

const { errorResponse, successResponse } = require("../helper/response.helper");
const { SOMETHING_WENT_WRONG } = require("../helper/message.helper");
const CCAvenue = require("../utils/ccavenue");
const { OrderDetailsSchema, User } = require("./models_import");
const QRCode = require('qrcode');
require("dotenv").config();

// ==================== UTILITIES ====================
const getEnv = (key, defaultValue = '') => {
  const value = process.env[key];
  return (value && typeof value === 'string') ? value.trim() : defaultValue;
};

const generatePaymentQRCode = async (orderData, encryptedData, accessCode) => {
  try {
    const { invoice_no } = orderData;
    const BACKEND_BASE_URL = getEnv('BACKEND_BASE_URL', 'https://printe.in');
    
    // QR URL points to backend endpoint that auto-submits to payment gateway
    const qrPaymentUrl = `${BACKEND_BASE_URL}/api/payment/qr-redirect/${invoice_no}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrPaymentUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    
    console.log(`✓ QR Code generated: ${qrPaymentUrl}`);
    
    return {
      qr_code: qrCodeDataUrl,
      qr_url: qrPaymentUrl,
      encrypted_data: encryptedData,
      access_code: accessCode,
      generated_at: new Date()
    };
  } catch (error) {
    console.error('✗ QR generation error:', error);
    throw new Error('QR code generation failed: ' + error.message);
  }
};

const getGatewayUrl = () => {
  const isProduction = getEnv('NODE_ENV') === 'production';
  return isProduction 
    ? 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
    : 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction';
};

const validateCCAvenueCredentials = () => {
  const CCA_MERCHANT_ID = getEnv('CCA_MERCHANT_ID');
  const CCA_WORKING_KEY = getEnv('CCA_WORKING_KEY');
  const CCA_ACCESS_CODE = getEnv('CCA_ACCESS_CODE');
  
  if (!CCA_MERCHANT_ID || !CCA_WORKING_KEY || !CCA_ACCESS_CODE) {
    return {
      valid: false,
      error: 'Payment gateway not configured',
      credentials: null
    };
  }
  
  return {
    valid: true,
    error: null,
    credentials: {
      merchantId: CCA_MERCHANT_ID,
      workingKey: CCA_WORKING_KEY,
      accessCode: CCA_ACCESS_CODE
    }
  };
};

// ==================== CREATE PAYMENT ORDER ====================
const createPaymentOrder = async (req, res) => {
  try {
    const { 
      amount, order_id, currency = "INR", billing_name, billing_email, billing_tel,
      cart_items, delivery_address, delivery_charges = 0, free_delivery = false,
      user_id, gst_no, coupon, subtotal, tax_amount, discount_amount, total_amount,
      payment_type, total_before_discount, created_by = "customer"
    } = req.body;

    console.log('='.repeat(60));
    console.log('Creating payment order:', { billing_email, amount, timestamp: new Date().toISOString() });

    // Validation
    const requiredFields = ['amount', 'billing_name', 'billing_email', 'billing_tel', 'cart_items', 'delivery_address'];
    const missingFields = requiredFields.filter(f => !req.body[f]);
    if (missingFields.length > 0) {
      return errorResponse(res, `Missing: ${missingFields.join(', ')}`);
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return errorResponse(res, "Invalid amount");
    }

    // Validate CCAvenue credentials
    const credentialCheck = validateCCAvenueCredentials();
    if (!credentialCheck.valid) {
      return errorResponse(res, credentialCheck.error);
    }

    const { merchantId, workingKey, accessCode } = credentialCheck.credentials;
    const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'https://printe.in');
    const BACKEND_BASE_URL = getEnv('BACKEND_BASE_URL', 'https://printe.in');
    const gatewayUrl = getGatewayUrl();

    const finalOrderId = order_id || `PRINTE${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Process cart items
    const processedCartItems = Array.isArray(cart_items) ? cart_items.map(item => ({
      product_id: item.product_id || item.id || '',
      product_name: item.product_name || item.name || 'Product',
      quantity: parseInt(item.quantity || item.product_quantity) || 1,
      price: parseFloat(item.price || item.final_total_withoutGst || item.final_total) || 0,
      image: item.image || item.product_image || '',
      size: item.size || '',
      color: item.color || ''
    })) : [];

    // Process delivery address
    const processedDeliveryAddress = {
      name: delivery_address.name || billing_name || '',
      email: delivery_address.email || billing_email || '',
      mobile_number: delivery_address.mobile_number || delivery_address.phone || billing_tel || '',
      alternateMobileNumber: delivery_address.alternateMobileNumber || '',
      street: delivery_address.street || delivery_address.addressLine1 || delivery_address.address || '',
      city: delivery_address.city || '',
      state: delivery_address.state || '',
      pincode: delivery_address.pincode || delivery_address.zip || '',
      country: delivery_address.country || 'India',
      landmark: delivery_address.landmark || delivery_address.addressLine2 || '',
      address_type: delivery_address.address_type || 'home'
    };

    // Initial CCAvenue parameters
    const ccavenueParams = {
      merchant_id: merchantId,
      order_id: finalOrderId,
      amount: numericAmount.toFixed(2),
      currency: currency,
      redirect_url: `${BACKEND_BASE_URL}/api/payment/ccavenue/callback`,
      cancel_url: `${BACKEND_BASE_URL}/api/payment/ccavenue/callback`,
      language: 'EN',
      billing_name: (billing_name || '').substring(0, 50),
      billing_email: billing_email,
      billing_tel: (billing_tel || '').substring(0, 20),
      billing_address: (processedDeliveryAddress.street || '').substring(0, 100),
      billing_city: processedDeliveryAddress.city || '',
      billing_state: processedDeliveryAddress.state || '',
      billing_zip: processedDeliveryAddress.pincode || '',
      billing_country: processedDeliveryAddress.country || 'India',
      delivery_name: (processedDeliveryAddress.name || '').substring(0, 50),
      delivery_address: (processedDeliveryAddress.street || '').substring(0, 100),
      delivery_city: processedDeliveryAddress.city || '',
      delivery_state: processedDeliveryAddress.state || '',
      delivery_zip: processedDeliveryAddress.pincode || '',
      delivery_country: processedDeliveryAddress.country || 'India',
      delivery_tel: (processedDeliveryAddress.mobile_number || '').substring(0, 20),
      merchant_param1: user_id || '',
      merchant_param2: '',
      merchant_param3: created_by
    };

    // Encrypt data
    let encryptedData;
    try {
      const ccavenue = new CCAvenue(workingKey);
      encryptedData = ccavenue.encryptData(ccavenueParams);
      console.log('✓ CCAvenue encryption successful');
    } catch (encryptError) {
      console.error('✗ Encryption error:', encryptError);
      return errorResponse(res, "Payment gateway error");
    }

    // Generate QR code
    let qrCodeData = null;
    try {
      qrCodeData = await generatePaymentQRCode(
        { invoice_no: finalOrderId },
        encryptedData,
        accessCode
      );
      console.log('✓ QR Code generated');
    } catch (qrError) {
      console.error('✗ QR generation failed:', qrError.message);
    }

    // Create order
    const orderData = {
      user_id: user_id || null,
      cart_items: processedCartItems,
      delivery_address: processedDeliveryAddress,
      order_status: "pending payment",
      total_price: numericAmount,
      DeliveryCharges: parseFloat(delivery_charges) || 0,
      FreeDelivery: !!free_delivery,
      payment_type: payment_type || "Online Payment",
      invoice_no: finalOrderId,
      payment_status: "pending",
      gst_no: gst_no || "",
      transaction_id: "",
      payment_id: "",
      subtotal: parseFloat(subtotal || numericAmount),
      tax_amount: parseFloat(tax_amount || 0),
      discount_amount: parseFloat(discount_amount || 0),
      total_amount: parseFloat(total_amount || numericAmount),
      total_before_discount: parseFloat(total_before_discount || numericAmount),
      payment_option: payment_type || "full",
      created_by: created_by,
      created_at: new Date(),
      updated_at: new Date()
    };

    if (qrCodeData) {
      orderData.payment_qr_code = qrCodeData.qr_code;
      orderData.payment_qr_url = qrCodeData.qr_url;
      orderData.qr_code_generated_at = qrCodeData.generated_at;
      orderData.payment_encrypted_data = qrCodeData.encrypted_data;
      orderData.payment_access_code = qrCodeData.access_code;
      orderData.payment_gateway_url = gatewayUrl;
    }

    if (coupon && coupon.couponCode) {
      orderData.coupon = {
        code: coupon.couponCode,
        discount_type: coupon.discountType,
        discount_value: coupon.discountValue,
        discount_amount: coupon.discountAmount,
        final_amount: coupon.finalAmount,
        applied_at: new Date()
      };
    }

    // Save order to database
    let savedOrder;
    try {
      const newOrder = new OrderDetailsSchema(orderData);
      savedOrder = await newOrder.save();
      
      // Update with database ID
      ccavenueParams.merchant_param2 = savedOrder._id.toString();
      const ccavenue = new CCAvenue(workingKey);
      encryptedData = ccavenue.encryptData(ccavenueParams);
      
      await OrderDetailsSchema.findByIdAndUpdate(savedOrder._id, {
        payment_encrypted_data: encryptedData
      });
      
      console.log('✓ Order created:', savedOrder.invoice_no);
    } catch (dbError) {
      console.error('✗ Database error:', dbError);
      return errorResponse(res, "Failed to create order");
    }

    console.log('✓ Payment order complete with QR');
    console.log('='.repeat(60));

    return successResponse(res, "Order created successfully", {
      success: true,
      order_id: finalOrderId,
      database_order_id: savedOrder._id,
      amount: ccavenueParams.amount,
      currency: currency,
      encrypted_data: encryptedData,
      access_code: accessCode,
      gateway_url: gatewayUrl,
      merchant_id: merchantId,
      qr_code: savedOrder.payment_qr_code || null,
      qr_url: savedOrder.payment_qr_url || null,
      payment_page_url: `${FRONTEND_BASE_URL}/payment/${finalOrderId}`,
      frontend_redirect_urls: {
        success: `${FRONTEND_BASE_URL}/payment/success`,
        failure: `${FRONTEND_BASE_URL}/payment/failed`,
        cancel: `${FRONTEND_BASE_URL}/payment/cancelled`,
        error: `${FRONTEND_BASE_URL}/payment/error`
      }
    });
    
  } catch (err) {
    console.error('✗ Error in createPaymentOrder:', err);
    return errorResponse(res, "An unexpected error occurred");
  }
};

// ==================== QR REDIRECT TO GATEWAY ====================
const qrRedirectToGateway = async (req, res) => {
  try {
    const { invoice_no } = req.params;
    
    console.log('='.repeat(60));
    console.log('QR redirect initiated:', { invoice_no, timestamp: new Date().toISOString() });

    // Find order
    const order = await OrderDetailsSchema.findOne({ invoice_no });

    if (!order) {
      console.log('✗ Order not found');
      const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'https://printe.in');
      return res.redirect(`${FRONTEND_BASE_URL}/payment/error?message=${encodeURIComponent('Order not found')}&order_id=${invoice_no}`);
    }

    console.log('✓ Order found:', {
      invoice_no: order.invoice_no,
      amount: order.total_amount,
      payment_status: order.payment_status
    });

    const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'https://printe.in');

    // Check payment status
    if (order.payment_status === 'completed') {
      return res.redirect(`${FRONTEND_BASE_URL}/payment/success?order_id=${invoice_no}&tracking_id=${order.transaction_id || ''}&already_paid=true`);
    }

    if (order.payment_status === 'cancelled') {
      return res.redirect(`${FRONTEND_BASE_URL}/payment/cancelled?order_id=${invoice_no}`);
    }

    // Validate CCAvenue credentials
    const credentialCheck = validateCCAvenueCredentials();
    if (!credentialCheck.valid) {
      console.error('✗ Missing CCAvenue credentials');
      return res.redirect(`${FRONTEND_BASE_URL}/payment/error?message=${encodeURIComponent('Gateway configuration error')}&order_id=${invoice_no}`);
    }

    const { merchantId, workingKey, accessCode } = credentialCheck.credentials;
    const BACKEND_BASE_URL = getEnv('BACKEND_BASE_URL', 'https://printe.in');
    const gatewayUrl = getGatewayUrl();

    // Log credential info (remove sensitive data in production)
    console.log('CCAvenue Credentials Check:', {
      merchantId,
      accessCode,
      workingKeyLength: workingKey.length,
      workingKeyFirst4: workingKey.substring(0, 4) + '...',
    });

    // Try to use stored encrypted data first
    let encryptedData = order.payment_encrypted_data;
    let storedAccessCode = order.payment_access_code;
    let storedGatewayUrl = order.payment_gateway_url;

    // Generate new if missing OR if merchant params don't match
    const needsRegeneration = !encryptedData || !storedAccessCode || 
                              storedAccessCode !== accessCode;

    if (needsRegeneration) {
      console.log('⚠ Generating fresh encrypted data');

      // Prepare CCAvenue parameters
 // In qrRedirectToGateway function, update ccavenueParams:
const ccavenueParams = {
  merchant_id: merchantId,
  order_id: order.invoice_no,
  amount: order.total_amount.toFixed(2),
  currency: "INR",
  redirect_url: `${BACKEND_BASE_URL}/api/payment/ccavenue/callback`,
  cancel_url: `${BACKEND_BASE_URL}/api/payment/ccavenue/callback`,
  language: 'EN',
  
  // Billing details - ALL REQUIRED
  billing_name: (order.delivery_address?.name || 'Customer').substring(0, 50),
  billing_address: (order.delivery_address?.street || 'NA').substring(0, 100),
  billing_city: order.delivery_address?.city || 'NA',
  billing_state: order.delivery_address?.state || 'NA',
  billing_zip: order.delivery_address?.pincode || '000000',
  billing_country: order.delivery_address?.country || 'India',
  billing_tel: (order.delivery_address?.mobile_number || '0000000000').substring(0, 20),
  billing_email: order.delivery_address?.email || 'noreply@example.com',
  
  // Delivery details
  delivery_name: (order.delivery_address?.name || 'Customer').substring(0, 50),
  delivery_address: (order.delivery_address?.street || 'NA').substring(0, 100),
  delivery_city: order.delivery_address?.city || 'NA',
  delivery_state: order.delivery_address?.state || 'NA',
  delivery_zip: order.delivery_address?.pincode || '000000',
  delivery_country: order.delivery_address?.country || 'India',
  delivery_tel: (order.delivery_address?.mobile_number || '0000000000').substring(0, 20),
  
  // Merchant params
  merchant_param1: order.user_id?.toString() || '',
  merchant_param2: order._id.toString(),
  merchant_param3: 'qr_scan'
};

// Log for debugging
console.log('CCAvenue Parameters (sanitized):', {
  ...ccavenueParams,
  billing_email: ccavenueParams.billing_email,
  amount: ccavenueParams.amount,
  order_id: ccavenueParams.order_id
});
      console.log('CCAvenue Parameters:', {
        merchant_id: ccavenueParams.merchant_id,
        order_id: ccavenueParams.order_id,
        amount: ccavenueParams.amount,
        redirect_url: ccavenueParams.redirect_url
      });

      // Encrypt data
      try {
        const ccavenue = new CCAvenue(workingKey);
        encryptedData = ccavenue.encryptData(ccavenueParams);
        storedAccessCode = accessCode;
        
        console.log('✓ Encryption successful:', {
          encryptedDataLength: encryptedData.length,
          gatewayUrl: gatewayUrl
        });

        // Update order with new encrypted data
        try {
          await OrderDetailsSchema.findByIdAndUpdate(order._id, {
            payment_encrypted_data: encryptedData,
            payment_access_code: storedAccessCode,
            payment_gateway_url: gatewayUrl,
            updated_at: new Date()
          });
          console.log('✓ Updated order with new encrypted data');
        } catch (updateErr) {
          console.warn('⚠ Could not update order with encrypted data:', updateErr.message);
          // Continue anyway - not critical
        }

      } catch (encryptError) {
        console.error('✗ Encryption failed:', encryptError);
        return res.redirect(`${FRONTEND_BASE_URL}/payment/error?message=${encodeURIComponent('Encryption failed: ' + encryptError.message)}`);
      }
    } else {
      console.log('✓ Using stored encrypted data');
    }

    // Final validation before sending to gateway
    if (!encryptedData || !storedAccessCode || !gatewayUrl) {
      console.error('✗ Missing required data for gateway redirect');
      return res.redirect(`${FRONTEND_BASE_URL}/payment/error?message=${encodeURIComponent('Payment data incomplete')}`);
    }

    // Generate HTML with auto-submit form
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting to Payment Gateway...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .container {
      background: white; 
      padding: 50px 40px; 
      border-radius: 24px;
      box-shadow: 0 25px 70px rgba(0,0,0,0.4); 
      max-width: 500px; 
      width: 100%;
      text-align: center; 
      animation: slideIn 0.6s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .spinner {
      border: 5px solid #f3f3f3; 
      border-top: 5px solid #667eea;
      border-radius: 50%; 
      width: 70px; 
      height: 70px;
      animation: spin 1s linear infinite; 
      margin: 0 auto 30px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 { 
      color: #2d3748; 
      margin: 0 0 15px; 
      font-size: 28px; 
      font-weight: 800; 
    }
    .subtitle { 
      color: #718096; 
      margin: 0 0 35px; 
      font-size: 16px; 
    }
    .order-info {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      padding: 25px; 
      border-radius: 16px; 
      margin-top: 30px; 
      border: 2px solid #e2e8f0;
    }
    .order-row {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      margin: 12px 0; 
      padding: 10px 0;
    }
    .order-row:not(:last-child) { 
      border-bottom: 1px solid #e2e8f0; 
    }
    .label { 
      color: #4a5568; 
      font-weight: 600; 
      font-size: 15px; 
    }
    .value { 
      color: #2d3748; 
      font-weight: 700; 
      font-size: 15px; 
    }
    .amount { 
      color: #667eea; 
      font-size: 32px; 
      font-weight: 900; 
    }
    .security {
      display: flex; 
      align-items: center; 
      justify-content: center;
      margin-top: 30px; 
      padding: 15px;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-radius: 12px; 
      border: 2px solid #86efac;
    }
    .security-text { 
      color: #166534; 
      font-size: 14px; 
      font-weight: 700; 
      margin-left: 10px; 
    }
    .progress { 
      width: 100%; 
      height: 5px; 
      background: #e2e8f0; 
      border-radius: 3px;
      overflow: hidden; 
      margin-top: 25px;
    }
    .progress-fill {
      height: 100%; 
      background: linear-gradient(90deg, #667eea, #764ba2);
      animation: progress 1.5s ease-in-out;
    }
    @keyframes progress {
      from { width: 0%; } 
      to { width: 100%; }
    }
    .gateway { 
      margin-top: 20px; 
      padding-top: 20px; 
      border-top: 2px solid #e2e8f0; 
    }
    .gateway p { 
      color: #718096; 
      font-size: 13px; 
      margin-bottom: 8px; 
    }
    .badge {
      display: inline-block; 
      background: #003366; 
      color: white;
      padding: 8px 20px; 
      border-radius: 8px; 
      font-weight: 700; 
      font-size: 14px;
    }
    .debug-info {
      margin-top: 20px;
      padding: 15px;
      background: #fef3c7;
      border-radius: 8px;
      font-size: 12px;
      text-align: left;
      color: #92400e;
      display: none; /* Show only in development */
    }
    .debug-info.show { display: block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Redirecting to Payment</h2>
    <p class="subtitle">Connecting to CCAvenue payment gateway...</p>
    
    <div class="order-info">
      <div class="order-row">
        <span class="label">Order ID</span>
        <span class="value">${order.invoice_no}</span>
      </div>
      <div class="order-row">
        <span class="label">Amount</span>
        <span class="amount">₹${order.total_amount.toFixed(2)}</span>
      </div>
      <div class="order-row">
        <span class="label">Customer</span>
        <span class="value">${order.delivery_address?.name || 'Customer'}</span>
      </div>
    </div>
    
    <div class="security">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span class="security-text">🔒 Secure Payment</span>
    </div>
    
    <div class="progress">
      <div class="progress-fill"></div>
    </div>
    
    <div class="gateway">
      <p>Powered by</p>
      <span class="badge">CCAvenue</span>
    </div>

    <!-- Debug info (only in development) -->
    <div class="debug-info ${getEnv('NODE_ENV') !== 'pro' ? 'show' : ''}">
      <strong>Debug Info:</strong><br>
      Gateway: ${gatewayUrl}<br>
      Merchant ID: ${merchantId}<br>
      Access Code: ${storedAccessCode}<br>
      Encrypted Length: ${encryptedData.length} chars<br>
      Order: ${order.invoice_no}
    </div>
    
    <!-- Payment Form -->
    <form id="paymentForm" method="post" action="${gatewayUrl}">
      <input type="hidden" name="encRequest" value="${encryptedData}">
      <input type="hidden" name="access_code" value="${storedAccessCode}">
    </form>
  </div>
  
  <script>
    console.log('Payment Gateway Redirect');
    console.log('Gateway URL:', '${gatewayUrl}');
    console.log('Order ID:', '${order.invoice_no}');
    console.log('Access Code:', '${storedAccessCode}');
    
    // Auto-submit after 1.5 seconds
    setTimeout(() => {
      console.log('Submitting payment form to CCAvenue...');
      document.getElementById('paymentForm').submit();
    }, 1500);
    
    // Fallback: Manual submit button after 5 seconds
    setTimeout(() => {
      const form = document.getElementById('paymentForm');
      if (form && document.body.contains(form)) {
        console.warn('Auto-submit may have failed, adding manual button');
        const btn = document.createElement('button');
        btn.textContent = 'Click here if not redirected';
        btn.style.cssText = 'margin-top: 20px; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;';
        btn.onclick = (e) => {
          e.preventDefault();
          form.submit();
        };
        document.querySelector('.container').appendChild(btn);
      }
    }, 5000);
  </script>
</body>
</html>`;

    console.log('✓ Sending redirect page to client');
    console.log('  Gateway URL:', gatewayUrl);
    console.log('  Access Code:', storedAccessCode);
    console.log('  Encrypted Data Length:', encryptedData.length);
    console.log('='.repeat(60));

    return res.send(html);

  } catch (err) {
    console.error('✗ QR redirect error:', err);
    console.error('  Stack:', err.stack);
    const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'https://printe.in');
    return res.redirect(`${FRONTEND_BASE_URL}/payment/error?message=${encodeURIComponent('Payment system error: ' + err.message)}`);
  }
};

// ==================== CALLBACK HANDLER ====================
const handleCCAvenueCallback = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('CCAvenue callback:', { method: req.method, timestamp: new Date().toISOString() });

    let encResp = req.body.encResp || req.query.encResp;
    if (!encResp) {
      const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'https://printe.in');
      return res.redirect(`${FRONTEND_BASE_URL}/payment/error?message=${encodeURIComponent('No response from payment gateway')}`);
    }

    const credentialCheck = validateCCAvenueCredentials();
    if (!credentialCheck.valid) {
      const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'http://localhost:5173');
      return res.redirect(`${FRONTEND_BASE_URL}/payment/error?message=${encodeURIComponent('Gateway configuration error')}`);
    }

    let decryptedData;
    try {
      const ccavenue = new CCAvenue(credentialCheck.credentials.workingKey);
      decryptedData = ccavenue.decryptData(encResp);
      console.log('✓ Decrypted response');
    } catch (err) {
      console.error('✗ Decryption error:', err);
      const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'http://localhost:5173');
      return res.redirect(`${FRONTEND_BASE_URL}/payment/error?message=${encodeURIComponent('Invalid response from payment gateway')}`);
    }

    const { order_id, tracking_id, bank_ref_no, order_status, failure_message, status_message, amount, payment_mode, card_name } = decryptedData;

    console.log('Payment details:', { order_id, tracking_id, order_status, amount });

    if (!order_id) {
      const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'http://localhost:5173');
      return res.redirect(`${FRONTEND_BASE_URL}/payment/error?message=${encodeURIComponent('Invalid payment response')}`);
    }

    let order = await OrderDetailsSchema.findOne({ invoice_no: order_id });
    if (!order && decryptedData.merchant_param2) {
      order = await OrderDetailsSchema.findById(decryptedData.merchant_param2);
    }

    const updateData = {
      payment_date: new Date(),
      payment_mode: payment_mode || 'Online',
      card_name: card_name || '',
      updated_at: new Date()
    };

    const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'http://localhost:5173');
    let frontendUrl;
    let params = new URLSearchParams();

    if (order_status === 'Success') {
      updateData.payment_status = 'completed';
      updateData.order_status = 'accounting team';
      if (tracking_id) updateData.transaction_id = tracking_id;
      if (bank_ref_no) updateData.payment_id = bank_ref_no;
      
      frontendUrl = `${FRONTEND_BASE_URL}/payment/success`;
      params.append('order_id', order_id);
      if (tracking_id) params.append('tracking_id', tracking_id);
      params.append('amount', amount);
      console.log('✓ Payment successful');
      
    } else if (order_status === 'Aborted') {
      updateData.payment_status = 'cancelled';
      updateData.order_status = 'cancelled';
      updateData.payment_failure_reason = 'User cancelled';
      
      frontendUrl = `${FRONTEND_BASE_URL}/payment/cancelled`;
      params.append('order_id', order_id);
      console.log('⚠ Payment cancelled');
      
    } else if (order_status === 'Failure') {
      updateData.payment_status = 'failed';
      updateData.order_status = 'payment failed';
      updateData.payment_failure_reason = failure_message || status_message || 'Payment failed';
      
      frontendUrl = `${FRONTEND_BASE_URL}/payment/failed`;
      params.append('order_id', order_id);
      if (failure_message) params.append('message', encodeURIComponent(failure_message));
      console.log('✗ Payment failed');
      
    } else {
      updateData.payment_status = 'failed';
      updateData.order_status = 'payment failed';
      updateData.payment_failure_reason = status_message || 'Unknown status';
      
      frontendUrl = `${FRONTEND_BASE_URL}/payment/error`;
      params.append('order_id', order_id);
      console.log('✗ Unknown status:', order_status);
    }

    if (order) {
      await OrderDetailsSchema.findByIdAndUpdate(order._id, updateData, { new: true });
      console.log('✓ Order updated:', order_id);
    }

    const redirect = `${frontendUrl}?${params.toString()}`;
    console.log('Redirecting to:', redirect);
    console.log('='.repeat(60));
    return res.redirect(redirect);
    
  } catch (err) {
    console.error('✗ Callback error:', err);
    const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'http://localhost:5173');
    return res.redirect(`${FRONTEND_BASE_URL}/payment/error?message=${encodeURIComponent('Payment processing error')}`);
  }
};

// ==================== OTHER ENDPOINTS ====================
const getPaymentStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    if (!order_id) return errorResponse(res, "Order ID required");

    let order = await OrderDetailsSchema.findOne({ invoice_no: order_id });
    if (!order) order = await OrderDetailsSchema.findById(order_id);
    if (!order) return errorResponse(res, "Order not found");

    return successResponse(res, "Status retrieved", {
      order_id: order.invoice_no,
      database_id: order._id,
      payment_status: order.payment_status,
      order_status: order.order_status,
      transaction_id: order.transaction_id,
      payment_id: order.payment_id,
      amount: order.total_amount,
      payment_date: order.payment_date,
      payment_mode: order.payment_mode,
      failure_reason: order.payment_failure_reason,
      qr_code: order.payment_qr_code,
      qr_url: order.payment_qr_url,
      created_at: order.created_at,
      updated_at: order.updated_at
    });
  } catch (err) {
    return errorResponse(res, SOMETHING_WENT_WRONG);
  }
};

const getOrderByInvoice = async (req, res) => {
  try {
    const { invoice_no } = req.params;
    const order = await OrderDetailsSchema.findOne({ invoice_no });
    if (!order) return errorResponse(res, "Order not found");

    return successResponse(res, "Order retrieved", {
      order_id: order._id,
      invoice_no: order.invoice_no,
      customer_name: order.delivery_address.name,
      customer_email: order.delivery_address.email,
      customer_phone: order.delivery_address.mobile_number,
      cart_items: order.cart_items,
      delivery_address: order.delivery_address,
      subtotal: order.subtotal,
      tax_amount: order.tax_amount,
      delivery_charges: order.DeliveryCharges,
      discount_amount: order.discount_amount,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      order_status: order.order_status,
      gst_no: order.gst_no,
      created_by: order.created_by,
      created_at: order.created_at,
      qr_code: order.payment_qr_code,
      qr_url: order.payment_qr_url
    });
  } catch (err) {
    return errorResponse(res, "Failed to retrieve order");
  }
};

const getQRCode = async (req, res) => {
  try {
    const { order_id } = req.params;
    let order = await OrderDetailsSchema.findOne({ 
      $or: [{ invoice_no: order_id }, { _id: order_id }]
    });

    if (!order) return errorResponse(res, "Order not found");
    if (!order.payment_qr_code) return errorResponse(res, "QR code not available");

    return successResponse(res, "QR Code retrieved", {
      order_id: order.invoice_no,
      qr_code: order.payment_qr_code,
      qr_url: order.payment_qr_url,
      generated_at: order.qr_code_generated_at,
      payment_status: order.payment_status,
      total_amount: order.total_amount
    });
  } catch (err) {
    return errorResponse(res, "Failed to retrieve QR code");
  }
};

// Admin functions
const adminCreateOrder = async (req, res) => {
  try {
    const { 
      customer_name, customer_email, customer_phone, cart_items, delivery_address,
      delivery_charges = 0, free_delivery = false, gst_no, subtotal, tax_amount,
      discount_amount, total_amount, payment_type = "Online Payment", notes, admin_id
    } = req.body;

    console.log('Admin creating order:', { customer_email, admin_id });

    if (!customer_name || !customer_email || !customer_phone || !cart_items || !delivery_address) {
      return errorResponse(res, "Missing required fields");
    }

    let userId = null;
    try {
      const user = await User.findOne({ email: customer_email });
      if (user) userId = user._id;
    } catch (err) {
      console.log('User lookup skipped');
    }

    const credentialCheck = validateCCAvenueCredentials();
    if (!credentialCheck.valid) {
      return errorResponse(res, credentialCheck.error);
    }

    const { merchantId, workingKey, accessCode } = credentialCheck.credentials;
    const BACKEND_BASE_URL = getEnv('BACKEND_BASE_URL', 'https://printe.in');
    const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'http://localhost:5173');
    const gatewayUrl = getGatewayUrl();

    const invoiceNo = `PRINTE${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const processedCartItems = cart_items.map(item => ({
      product_id: item.product_id || '',
      product_name: item.product_name || '',
      quantity: parseInt(item.quantity) || 1,
      price: parseFloat(item.price) || 0,
      image: item.image || '',
      size: item.size || '',
      color: item.color || ''
    }));

    // Create CCAvenue params and encrypt
    const ccavenueParams = {
      merchant_id: merchantId,
      order_id: invoiceNo,
      amount: parseFloat(total_amount+44 || 0).toFixed(2),
      currency: "INR",
      redirect_url: `${BACKEND_BASE_URL}/api/payment/ccavenue/callback`,
      cancel_url: `${BACKEND_BASE_URL}/api/payment/ccavenue/callback`,
      language: 'EN',
      billing_name: customer_name.substring(0, 50),
      billing_email: customer_email,
      billing_tel: customer_phone.substring(0, 20),
      merchant_param3: 'admin'
    };

    const ccavenue = new CCAvenue(workingKey);
    const encryptedData = ccavenue.encryptData(ccavenueParams);

    // Generate QR
    let qrCodeData = null;
    try {
      qrCodeData = await generatePaymentQRCode(
        { invoice_no: invoiceNo },
        encryptedData,
        accessCode
      );
    } catch (err) {
      console.log('QR generation skipped:', err.message);
    }

    const orderData = {
      user_id: userId,
      cart_items: processedCartItems,
      delivery_address: {
        name: customer_name,
        email: customer_email,
        mobile_number: customer_phone,
        street: delivery_address.street || delivery_address.address || '',
        city: delivery_address.city,
        state: delivery_address.state,
        pincode: delivery_address.pincode,
        country: delivery_address.country || 'India',
        landmark: delivery_address.landmark || '',
        address_type: delivery_address.address_type || 'home'
      },
      order_status: "pending payment",
      total_price: parseFloat(total_amount || 0),
      DeliveryCharges: parseFloat(delivery_charges || 0),
      FreeDelivery: !!free_delivery,
      payment_type: payment_type,
      invoice_no: invoiceNo,
      payment_status: "pending",
      gst_no: gst_no || "",
      subtotal: parseFloat(subtotal || 0),
      tax_amount: parseFloat(tax_amount || 0),
      discount_amount: parseFloat(discount_amount || 0),
      total_amount: parseFloat(total_amount || 0),
      payment_option: "full",
      created_by: "admin",
      admin_notes: notes || "",
      created_by_admin_id: admin_id,
      created_at: new Date()
    };

    if (qrCodeData) {
      orderData.payment_qr_code = qrCodeData.qr_code;
      orderData.payment_qr_url = qrCodeData.qr_url;
      orderData.qr_code_generated_at = qrCodeData.generated_at;
      orderData.payment_encrypted_data = qrCodeData.encrypted_data;
      orderData.payment_access_code = qrCodeData.access_code;
      orderData.payment_gateway_url = gatewayUrl;
    }

    const savedOrder = await new OrderDetailsSchema(orderData).save();
    console.log('✓ Admin order created:', savedOrder.invoice_no);

    return successResponse(res, "Order created", {
      order_id: savedOrder._id,
      invoice_no: savedOrder.invoice_no,
      payment_status: savedOrder.payment_status,
      total_amount: savedOrder.total_amount,
      payment_link: `${FRONTEND_BASE_URL}/payment/${savedOrder.invoice_no}`,
      qr_code: savedOrder.payment_qr_code,
      qr_url: savedOrder.payment_qr_url
    });
  } catch (err) {
    console.error('Admin order error:', err);
    return errorResponse(res, "Failed to create order");
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, payment_status, order_status, created_by, search } = req.query;
    const query = {};
    
    if (payment_status) query.payment_status = payment_status;
    if (order_status) query.order_status = order_status;
    if (created_by) query.created_by = created_by;
    if (search) {
      query.$or = [
        { invoice_no: { $regex: search, $options: 'i' } },
        { 'delivery_address.email': { $regex: search, $options: 'i' } },
        { 'delivery_address.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await OrderDetailsSchema.find(query)
      .select('-payment_qr_code -payment_encrypted_data')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await OrderDetailsSchema.countDocuments(query);

    return successResponse(res, "Orders retrieved", {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    return errorResponse(res, "Failed to retrieve orders");
  }
};

const generatePaymentLink = async (req, res) => {
  try {
    const { order_id } = req.params;
    const order = await OrderDetailsSchema.findOne({ 
      $or: [{ invoice_no: order_id }, { _id: order_id }]
    });

    if (!order) return errorResponse(res, "Order not found");
    if (order.payment_status !== 'pending') {
      return errorResponse(res, "Link only for pending orders");
    }

    const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'https://printe.in');
    const BACKEND_BASE_URL = getEnv('BACKEND_BASE_URL', 'https://printe.in');

    return successResponse(res, "Payment link generated", {
      payment_link: `${FRONTEND_BASE_URL}/payment/${order.invoice_no}`,
      qr_payment_link: `${BACKEND_BASE_URL}/api/payment/qr-redirect/${order.invoice_no}`,
      order_id: order.invoice_no,
      amount: order.total_amount,
      customer_email: order.delivery_address.email,
      qr_code: order.payment_qr_code,
      qr_url: order.payment_qr_url
    });
  } catch (err) {
    return errorResponse(res, "Failed to generate link");
  }
};

const regenerateQRCode = async (req, res) => {
  try {
    const { order_id } = req.params;
    const order = await OrderDetailsSchema.findOne({ 
      $or: [{ invoice_no: order_id }, { _id: order_id }]
    });

    if (!order) return errorResponse(res, "Order not found");

    // Regenerate encryption and QR
    const credentialCheck = validateCCAvenueCredentials();
    if (!credentialCheck.valid) {
      return errorResponse(res, credentialCheck.error);
    }

    const { merchantId, workingKey, accessCode } = credentialCheck.credentials;
    const BACKEND_BASE_URL = getEnv('BACKEND_BASE_URL', 'https://printe.in');

    const ccavenueParams = {
      merchant_id: merchantId,
      order_id: order.invoice_no,
      amount: order.total_amount.toFixed(2),
      currency: "INR",
      redirect_url: `${BACKEND_BASE_URL}/api/payment/ccavenue/callback`,
      cancel_url: `${BACKEND_BASE_URL}/api/payment/ccavenue/callback`,
      merchant_param2: order._id.toString()
    };

    const ccavenue = new CCAvenue(workingKey);
    const encryptedData = ccavenue.encryptData(ccavenueParams);

    const qrCodeData = await generatePaymentQRCode(
      { invoice_no: order.invoice_no },
      encryptedData,
      accessCode
    );

    await OrderDetailsSchema.findByIdAndUpdate(order._id, {
      payment_qr_code: qrCodeData.qr_code,
      payment_qr_url: qrCodeData.qr_url,
      qr_code_generated_at: qrCodeData.generated_at,
      payment_encrypted_data: qrCodeData.encrypted_data,
      updated_at: new Date()
    });

    return successResponse(res, "QR Code regenerated", {
      order_id: order.invoice_no,
      qr_code: qrCodeData.qr_code,
      qr_url: qrCodeData.qr_url,
      generated_at: qrCodeData.generated_at
    });
  } catch (err) {
    return errorResponse(res, "Failed to regenerate QR");
  }
};

module.exports = {
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
};