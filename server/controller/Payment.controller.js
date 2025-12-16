const { errorResponse, successResponse } = require("../helper/response.helper");
const { SOMETHING_WENT_WRONG } = require("../helper/message.helper");
const CCAvenue = require("../utils/ccavenue");
const { OrderDetailsSchema } = require("./models_import");
require("dotenv").config();

const createPaymentOrder = async (req, res) => {
  try {
    const { 
      amount, 
      order_id, 
      currency = "INR", 
      billing_name, 
      billing_email, 
      billing_tel,
      cart_items,
      delivery_address,
      delivery_charges = 0,
      free_delivery = false,
      user_id,
      gst_no,
      coupon,
      subtotal,
      tax_amount,
      discount_amount,
      total_amount,
      payment_type,
      total_before_discount
    } = req.body;

    console.log('Payment order request received:', {
      amount, order_id, billing_email, user_id, payment_type
    });

    // Validate required fields
    const requiredFields = [
      'amount', 'billing_name', 'billing_email', 'billing_tel', 
      'cart_items', 'delivery_address'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.error('Invalid amount:', amount);
      return errorResponse(res, "Invalid amount");
    }

    // Validate and get environment variables with safe defaults
    const getEnv = (key, defaultValue = '') => {
      const value = process.env[key];
      if (value && typeof value === 'string') {
        return value.trim();
      }
      return defaultValue;
    };

    // Critical CCAvenue credentials
    const CCA_MERCHANT_ID = getEnv('CCA_MERCHANT_ID');
    const CCA_WORKING_KEY = getEnv('CCA_WORKING_KEY');
    const CCA_ACCESS_CODE = getEnv('CCA_ACCESS_CODE');
    
    // URLs with defaults
    const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'https://printe.in');
    const BACKEND_BASE_URL = getEnv('BACKEND_BASE_URL', 'https://printe.in');

    // Validate critical environment variables
    const missingCriticalEnvVars = [];
    if (!CCA_MERCHANT_ID) missingCriticalEnvVars.push('CCA_MERCHANT_ID');
    if (!CCA_WORKING_KEY) missingCriticalEnvVars.push('CCA_WORKING_KEY');
    if (!CCA_ACCESS_CODE) missingCriticalEnvVars.push('CCA_ACCESS_CODE');

    if (missingCriticalEnvVars.length > 0) {
      console.error('Missing critical environment variables:', missingCriticalEnvVars);
      console.error('Env check:', {
        CCA_MERCHANT_ID: CCA_MERCHANT_ID ? 'SET' : 'MISSING',
        CCA_WORKING_KEY: CCA_WORKING_KEY ? 'SET' : 'MISSING',
        CCA_ACCESS_CODE: CCA_ACCESS_CODE ? 'SET' : 'MISSING'
      });
      return errorResponse(res, `Payment gateway configuration error. Missing: ${missingCriticalEnvVars.join(', ')}`);
    }

    // Generate unique order ID
    const finalOrderId = order_id || `PRINTE${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Prepare cart items
    let processedCartItems = [];
    if (Array.isArray(cart_items)) {
      processedCartItems = cart_items.map(item => ({
        product_id: item.product_id || item.id || '',
        product_name: item.product_name || item.name || 'Product',
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
        image: item.image || '',
        size: item.size || '',
        color: item.color || ''
      }));
    } else {
      console.error('Cart items is not an array:', cart_items);
      return errorResponse(res, "Invalid cart items format");
    }

    // Prepare delivery address
    const processedDeliveryAddress = {
      name: delivery_address.name || billing_name || '',
      email: delivery_address.email || billing_email || '',
      mobile_number: delivery_address.mobile_number || billing_tel || '',
      alternateMobileNumber: delivery_address.alternateMobileNumber || '',
      street: delivery_address.street || delivery_address.address || '',
      city: delivery_address.city || '',
      state: delivery_address.state || '',
      pincode: delivery_address.pincode || delivery_address.zip || '',
      country: delivery_address.country || 'India',
      landmark: delivery_address.landmark || '',
      address_type: delivery_address.address_type || 'home'
    };

    // Create order in database
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
      created_at: new Date(),
      updated_at: new Date()
    };

    // Add coupon data if exists
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

    let savedOrder;
    try {
      console.log('Creating database order:', { invoice_no: finalOrderId });
      const newOrder = new OrderDetailsSchema(orderData);
      savedOrder = await newOrder.save();
      
      console.log('Order created successfully:', {
        order_id: savedOrder._id,
        invoice_no: savedOrder.invoice_no,
        amount: savedOrder.total_amount,
        status: savedOrder.payment_status
      });

    } catch (dbError) {
      console.error('Database error creating order:', dbError);
      return errorResponse(res, "Failed to create order record. Please try again.");
    }

    // Prepare CCAvenue parameters
    const ccavenueParams = {
      merchant_id: CCA_MERCHANT_ID,
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
      merchant_param2: savedOrder._id.toString(),
      merchant_param3: 'web_order_v1'
    };

    console.log('Preparing CCAvenue request for order:', finalOrderId);

    // Encrypt data for CCAvenue
    let encryptedData;
    try {
      const ccavenue = new CCAvenue(CCA_WORKING_KEY);
      encryptedData = ccavenue.encryptData(ccavenueParams);
      console.log('CCAvenue encryption successful');
    } catch (encryptError) {
      console.error('CCAvenue encryption error:', encryptError);
      
      // Update order status to reflect encryption failure
      await OrderDetailsSchema.findByIdAndUpdate(savedOrder._id, {
        order_status: "payment gateway error",
        payment_failure_reason: "Encryption failed: " + encryptError.message,
        updated_at: new Date()
      });
      
      return errorResponse(res, "Payment gateway configuration error. Please try again later.");
    }

    // Determine gateway URL based on environment
    const gatewayUrl = process.env.NODE_ENV === 'production' 
      ? 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
      : 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction';

    const responseData = {
      success: true,
      order_id: finalOrderId,
      database_order_id: savedOrder._id,
      amount: ccavenueParams.amount,
      currency: currency,
      encrypted_data: encryptedData,
      access_code: CCA_ACCESS_CODE,
      gateway_url: gatewayUrl,
      merchant_id: CCA_MERCHANT_ID,
      frontend_redirect_urls: {
        success: `${FRONTEND_BASE_URL}/payment/success`,
        failure: `${FRONTEND_BASE_URL}/payment/failed`,
        cancel: `${FRONTEND_BASE_URL}/payment/cancelled`,
        error: `${FRONTEND_BASE_URL}/payment/error`
      }
    };

    console.log('Payment order created successfully for:', {
      order_id: finalOrderId,
      amount: numericAmount,
      email: billing_email
    });

    return successResponse(res, "Order created successfully. Redirect to payment gateway.", responseData);
    
  } catch (err) {
    console.error('Unexpected error in createPaymentOrder:', err);
    console.error('Error stack:', err.stack);
    return errorResponse(res, "An unexpected error occurred. Please try again.");
  }
};

const handleCCAvenueCallback = async (req, res) => {
  try {
    console.log('CCAvenue callback received:', {
      timestamp: new Date().toISOString(),
      method: req.method,
      query: req.query,
      body: req.body
    });

    let encResp = req.body.encResp || req.query.encResp;

    if (!encResp) {
      console.error('No encrypted response received from CCAvenue');
      return res.redirect(`${process.env.FRONTEND_BASE_URL}/payment/error?message=No response from payment gateway`);
    }

    let decryptedData;
    try {
      const ccavenue = new CCAvenue(process.env.CCA_WORKING_KEY.trim());
      decryptedData = ccavenue.decryptData(encResp);
      console.log('Decrypted CCAvenue response:', JSON.stringify(decryptedData, null, 2));
    } catch (decryptError) {
      console.error('CCAvenue decryption error:', decryptError);
      return res.redirect(`${process.env.FRONTEND_BASE_URL}/payment/error?message=Invalid payment response`);
    }

    // Extract important fields
    const {
      order_id,
      tracking_id,
      bank_ref_no,
      order_status,
      failure_message,
      status_message,
      amount,
      payment_mode,
      card_name,
      status_code,
      billing_name,
      billing_email,
      billing_tel
    } = decryptedData;

    if (!order_id) {
      console.error('No order_id in CCAvenue response');
      return res.redirect(`${process.env.FRONTEND_BASE_URL}/payment/error?message=Invalid payment response`);
    }

    // Find order in database
    let order;
    try {
      order = await OrderDetailsSchema.findOne({ invoice_no: order_id });
      if (!order) {
        console.error('Order not found in database:', order_id);
        // Try to find by merchant_param2 which contains database _id
        const merchantParam2 = decryptedData.merchant_param2;
        if (merchantParam2) {
          order = await OrderDetailsSchema.findById(merchantParam2);
        }
      }
    } catch (dbError) {
      console.error('Database error finding order:', dbError);
    }

    // Prepare update data
    const updateData = {
      payment_date: new Date(),
      payment_mode: payment_mode || 'Online',
      card_name: card_name || '',
      updated_at: new Date()
    };

    let frontendRedirectUrl;
    let redirectParams = new URLSearchParams();

    // Set payment status and transaction IDs
    if (order_status === 'Success') {
      updateData.payment_status = 'completed';
      updateData.order_status = 'accounting team';
      if (tracking_id) {
        updateData.transaction_id = tracking_id;
      }
      if (bank_ref_no) {
        updateData.payment_id = bank_ref_no;
      }
      
      frontendRedirectUrl = `${process.env.FRONTEND_BASE_URL}/payment/success`;
      redirectParams.append('order_id', order_id);
      if (tracking_id) redirectParams.append('tracking_id', tracking_id);
      redirectParams.append('amount', amount);
      redirectParams.append('payment_mode', payment_mode || '');
      
    } else if (order_status === 'Aborted') {
      updateData.payment_status = 'cancelled';
      updateData.order_status = 'cancelled';
      updateData.payment_failure_reason = 'Payment cancelled by user';
      
      frontendRedirectUrl = `${process.env.FRONTEND_BASE_URL}/payment/cancelled`;
      redirectParams.append('order_id', order_id);
      
    } else if (order_status === 'Failure') {
      updateData.payment_status = 'failed';
      updateData.order_status = 'payment failed';
      updateData.payment_failure_reason = failure_message || status_message || 'Payment failed';
      
      frontendRedirectUrl = `${process.env.FRONTEND_BASE_URL}/payment/failed`;
      redirectParams.append('order_id', order_id);
      if (failure_message) redirectParams.append('message', encodeURIComponent(failure_message));
      if (status_code) redirectParams.append('status_code', status_code);
      
    } else {
      updateData.payment_status = 'failed';
      updateData.order_status = 'payment failed';
      updateData.payment_failure_reason = status_message || 'Unknown payment status';
      
      frontendRedirectUrl = `${process.env.FRONTEND_BASE_URL}/payment/error`;
      redirectParams.append('order_id', order_id);
      redirectParams.append('message', encodeURIComponent(status_message || 'Unknown payment status'));
    }

    // Update order in database if found
    if (order) {
      try {
        const updatedOrder = await OrderDetailsSchema.findByIdAndUpdate(
          order._id,
          updateData,
          { new: true }
        );

        console.log('Order updated in database:', {
          order_id: order_id,
          database_id: order._id,
          payment_status: updateData.payment_status,
          transaction_id: updateData.transaction_id,
          order_status: updateData.order_status
        });

      } catch (dbError) {
        console.error('Error updating order in database:', dbError);
      }
    }

    // Construct final redirect URL
    const finalRedirectUrl = `${frontendRedirectUrl}?${redirectParams.toString()}`;
    console.log('Redirecting to:', finalRedirectUrl);
    
    return res.redirect(finalRedirectUrl);
  } catch (err) {
    console.error('Unexpected error in CCAvenue callback:', err);
    const errorUrl = `${process.env.FRONTEND_BASE_URL}/payment/error?message=${encodeURIComponent('Payment processing error')}`;
    return res.redirect(errorUrl);
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    
    if (!order_id) {
      return errorResponse(res, "Order ID is required");
    }

    let order;
    try {
      // Try to find by invoice_no first
      order = await OrderDetailsSchema.findOne({ invoice_no: order_id });
      
      // If not found, try to find by database _id
      if (!order) {
        order = await OrderDetailsSchema.findById(order_id);
      }
    } catch (dbError) {
      console.error('Database error finding order:', dbError);
      return errorResponse(res, "Error retrieving order information");
    }

    if (!order) {
      return errorResponse(res, "Order not found");
    }

    return successResponse(res, "Order status retrieved", {
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
      created_at: order.created_at,
      updated_at: order.updated_at
    });
  } catch (err) {
    console.error('Error getting payment status:', err);
    return errorResponse(res, SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  createPaymentOrder,
  handleCCAvenueCallback,
  getPaymentStatus
};