// ==================== PAYMENT CONTROLLER ====================
// File: controller/Payment.controller.js

const { errorResponse, successResponse } = require("../helper/response.helper");
const { SOMETHING_WENT_WRONG } = require("../helper/message.helper");
const CCAvenue = require("../utils/ccavenue");
const { OrderDetailsSchema,User } = require("./models_import");
require("dotenv").config();

// Create payment order from frontend checkout
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
      total_before_discount,
      created_by = "customer"
    } = req.body;

    console.log('Payment order request received:', {
      amount, order_id, billing_email, user_id, payment_type, created_by
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

    // Get environment variables
    const getEnv = (key, defaultValue = '') => {
      const value = process.env[key];
      if (value && typeof value === 'string') {
        return value.trim();
      }
      return defaultValue;
    };

    const CCA_MERCHANT_ID = getEnv('CCA_MERCHANT_ID');
    const CCA_WORKING_KEY = getEnv('CCA_WORKING_KEY');
    const CCA_ACCESS_CODE = getEnv('CCA_ACCESS_CODE');
    const FRONTEND_BASE_URL = getEnv('FRONTEND_BASE_URL', 'https://printe.in');
    const BACKEND_BASE_URL = getEnv('BACKEND_BASE_URL', 'https://printe.in');

    // Validate critical environment variables
    const missingCriticalEnvVars = [];
    if (!CCA_MERCHANT_ID) missingCriticalEnvVars.push('CCA_MERCHANT_ID');
    if (!CCA_WORKING_KEY) missingCriticalEnvVars.push('CCA_WORKING_KEY');
    if (!CCA_ACCESS_CODE) missingCriticalEnvVars.push('CCA_ACCESS_CODE');

    if (missingCriticalEnvVars.length > 0) {
      console.error('Missing critical environment variables:', missingCriticalEnvVars);
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
        quantity: parseInt(item.quantity || item.product_quantity) || 1,
        price: parseFloat(item.price || item.final_total_withoutGst || item.final_total) || 0,
        image: item.image || item.product_image || '',
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
      created_by: created_by, // "customer" or "admin"
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
      merchant_param3: created_by
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
      
      await OrderDetailsSchema.findByIdAndUpdate(savedOrder._id, {
        order_status: "payment gateway error",
        payment_failure_reason: "Encryption failed: " + encryptError.message,
        updated_at: new Date()
      });
      
      return errorResponse(res, "Payment gateway configuration error. Please try again later.");
    }

    // Determine gateway URL
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

    console.log('Payment order created successfully');

    return successResponse(res, "Order created successfully. Redirect to payment gateway.", responseData);
    
  } catch (err) {
    console.error('Unexpected error in createPaymentOrder:', err);
    return errorResponse(res, "An unexpected error occurred. Please try again.");
  }
};

// CCAvenue callback handler
const handleCCAvenueCallback = async (req, res) => {
  try {
    console.log('CCAvenue callback received:', {
      timestamp: new Date().toISOString(),
      method: req.method
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
      console.log('Decrypted CCAvenue response');
    } catch (decryptError) {
      console.error('CCAvenue decryption error:', decryptError);
      return res.redirect(`${process.env.FRONTEND_BASE_URL}/payment/error?message=Invalid payment response`);
    }

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
      merchant_param3
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

    // Set payment status based on CCAvenue response
    if (order_status === 'Success') {
      updateData.payment_status = 'completed';
      updateData.order_status = 'accounting team';
      if (tracking_id) updateData.transaction_id = tracking_id;
      if (bank_ref_no) updateData.payment_id = bank_ref_no;
      
      frontendRedirectUrl = `${process.env.FRONTEND_BASE_URL}/payment/success`;
      redirectParams.append('order_id', order_id);
      if (tracking_id) redirectParams.append('tracking_id', tracking_id);
      redirectParams.append('amount', amount);
      
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
      
    } else {
      updateData.payment_status = 'failed';
      updateData.order_status = 'payment failed';
      updateData.payment_failure_reason = status_message || 'Unknown payment status';
      
      frontendRedirectUrl = `${process.env.FRONTEND_BASE_URL}/payment/error`;
      redirectParams.append('order_id', order_id);
    }

    // Update order in database
    if (order) {
      try {
        await OrderDetailsSchema.findByIdAndUpdate(
          order._id,
          updateData,
          { new: true }
        );

        console.log('Order updated:', {
          order_id: order_id,
          payment_status: updateData.payment_status
        });

      } catch (dbError) {
        console.error('Error updating order:', dbError);
      }
    }

    const finalRedirectUrl = `${frontendRedirectUrl}?${redirectParams.toString()}`;
    console.log('Redirecting to:', finalRedirectUrl);
    
    return res.redirect(finalRedirectUrl);
  } catch (err) {
    console.error('Unexpected error in CCAvenue callback:', err);
    const errorUrl = `${process.env.FRONTEND_BASE_URL}/payment/error?message=${encodeURIComponent('Payment processing error')}`;
    return res.redirect(errorUrl);
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    
    if (!order_id) {
      return errorResponse(res, "Order ID is required");
    }

    let order;
    try {
      order = await OrderDetailsSchema.findOne({ invoice_no: order_id });
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
      updated_at: order.updated_at,
      created_by: order.created_by
    });
  } catch (err) {
    console.error('Error getting payment status:', err);
    return errorResponse(res, SOMETHING_WENT_WRONG);
  }
};

// Admin: Create order manually
const adminCreateOrder = async (req, res) => {
  try {
    const { 
      customer_name,
      customer_email,
      customer_phone,
      cart_items,
      delivery_address,
      delivery_charges = 0,
      free_delivery = false,
      gst_no,
      subtotal,
      tax_amount,
      discount_amount,
      total_amount,
      payment_type = "Online Payment",
      notes,
      admin_id
    } = req.body;

    console.log('Admin creating order:', { customer_email, admin_id });

    // Validate required fields FIRST (before any async operations)
    if (!customer_name || !customer_email || !customer_phone || !cart_items || !delivery_address) {
      return errorResponse(res, "Missing required fields");
    }

    // Validate delivery_address structure
    if (!delivery_address.city || !delivery_address.state || !delivery_address.pincode) {
      return errorResponse(res, "Delivery address must include city, state, and pincode");
    }
let userId = null;
try {
  // Check if User model is properly imported
    const existingUser = await User.findOne({ email: customer_email });
    if (existingUser) {
      userId = existingUser._id;
      console.log(`Found existing user: ${userId}`);
    } else {
      console.log(`No user found for email: ${customer_email}. Creating order without user ID.`);
    }
  
} catch (userError) {
  console.error('Error finding user:', userError);
  console.log('Continuing without user ID lookup');
}

    // Generate unique invoice number
    const invoiceNo = `PRINTE${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Process cart items
    let processedCartItems = [];
    if (Array.isArray(cart_items)) {
      processedCartItems = cart_items.map(item => ({
        product_id: item.product_id || '',
        product_name: item.product_name || '',
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
        image: item.image || '',
        size: item.size || '',
        color: item.color || ''
      }));
    } else {
      return errorResponse(res, "cart_items must be an array");
    }

    // Validate numeric fields
    const subtotalValue = parseFloat(subtotal) || 0;
    const taxAmountValue = parseFloat(tax_amount || 0);
    const discountAmountValue = parseFloat(discount_amount || 0);
    const deliveryChargesValue = parseFloat(delivery_charges || 0);
    const totalAmountValue = parseFloat(total_amount) || 0;

    // Calculate total_before_discount
    const totalBeforeDiscount = subtotalValue + taxAmountValue + deliveryChargesValue;

    // Create order
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
        country: delivery_address.country || 'India'
      },
      order_status: "pending payment",
      total_price: totalAmountValue,
      DeliveryCharges: deliveryChargesValue,
      FreeDelivery: !!free_delivery,
      payment_type: payment_type,
      invoice_no: invoiceNo,
      payment_status: "pending",
      gst_no: gst_no || "",
      subtotal: subtotalValue,
      tax_amount: taxAmountValue,
      discount_amount: discountAmountValue,
      total_amount: totalAmountValue,
      total_before_discount: totalBeforeDiscount,
      payment_option: "full",
      created_by: "admin",
      admin_notes: notes || "",
      created_by_admin_id: admin_id,
      created_at: new Date(),
      updated_at: new Date()
    };

    const newOrder = new OrderDetailsSchema(orderData);
    const savedOrder = await newOrder.save();

    console.log('Admin order created:', {
      order_id: savedOrder._id,
      invoice_no: savedOrder.invoice_no
    });

    return successResponse(res, "Order created successfully", {
      order_id: savedOrder._id,
      invoice_no: savedOrder.invoice_no,
      payment_status: savedOrder.payment_status,
      total_amount: savedOrder.total_amount,
      payment_link: `${process.env.FRONTEND_BASE_URL}/admin-payment/${savedOrder.invoice_no}`
    });

  } catch (err) {
    console.error('Error in adminCreateOrder:', err);
    return errorResponse(res, "Failed to create order: " + err.message);
  }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      payment_status, 
      order_status,
      created_by,
      search 
    } = req.query;

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
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await OrderDetailsSchema.countDocuments(query);

    return successResponse(res, "Orders retrieved successfully", {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    console.error('Error in getAllOrders:', err);
    return errorResponse(res, "Failed to retrieve orders");
  }
};

// Generate payment link for order
const generatePaymentLink = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await OrderDetailsSchema.findOne({ 
      $or: [
        { invoice_no: order_id },
        { _id: order_id }
      ]
    });

    if (!order) {
      return errorResponse(res, "Order not found");
    }

    if (order.payment_status !== 'pending') {
      return errorResponse(res, "Payment link can only be generated for pending orders");
    }

    const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'https://printe.in';
    const paymentLink = `${FRONTEND_BASE_URL}/admin-payment/${order.invoice_no}`;

    return successResponse(res, "Payment link generated", {
      payment_link: paymentLink,
      order_id: order.invoice_no,
      amount: order.total_amount,
      customer_email: order.delivery_address.email,
      customer_name: order.delivery_address.name
    });

  } catch (err) {
    console.error('Error in generatePaymentLink:', err);
    return errorResponse(res, "Failed to generate payment link");
  }
};

// Get order by invoice number (for payment page)
const getOrderByInvoice = async (req, res) => {
  try {
    const { invoice_no } = req.params;

    const order = await OrderDetailsSchema.findOne({ invoice_no });

    if (!order) {
      return errorResponse(res, "Order not found");
    }

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
      created_at: order.created_at
    });

  } catch (err) {
    console.error('Error in getOrderByInvoice:', err);
    return errorResponse(res, "Failed to retrieve order");
  }
};

module.exports = {
  createPaymentOrder,
  handleCCAvenueCallback,
  getPaymentStatus,
  adminCreateOrder,
  getAllOrders,
  generatePaymentLink,
  getOrderByInvoice
};