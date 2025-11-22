const { errorResponse, successResponse } = require("../helper/response.helper");
const { SOMETHING_WENT_WRONG } = require("../helper/message.helper");
const CCAvenue = require("../utils/ccavenue");
require("dotenv").config();

const createPaymentOrder = async (req, res) => {
  try {
    const { amount, order_id, currency = "INR", billing_name, billing_email, billing_tel } = req.body;

    if (!amount || !billing_name || !billing_email || !billing_tel) {
      return errorResponse(res, "Missing required payment fields");
    }

    const requiredEnvVars = [
      'CCA_MERCHANT_ID',
      'CCA_WORKING_KEY',
      'CCA_ACCESS_CODE'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars);
      return errorResponse(res, `Payment configuration error: Missing ${missingVars.join(', ')}`);
    }

    const finalOrderId = order_id || `ORD_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    const ccavenueParams = {
      merchant_id: process.env.CCA_MERCHANT_ID,
      order_id: finalOrderId,
      amount: parseFloat(amount).toFixed(2),
      currency: currency,
      redirect_url: `${baseUrl}/api/payment/ccavenue/callback`,
      cancel_url: `${baseUrl}/api/payment/ccavenue/callback`,
      language: 'EN',
      billing_name: billing_name,
      billing_email: billing_email,
      billing_tel: billing_tel,
      billing_address: req.body.billing_address || '',
      billing_city: req.body.billing_city || '',
      billing_state: req.body.billing_state || '',
      billing_zip: req.body.billing_zip || '',
      billing_country: req.body.billing_country || 'India',
      delivery_name: req.body.delivery_name || billing_name,
      delivery_address: req.body.delivery_address || req.body.billing_address || '',
      delivery_city: req.body.delivery_city || req.body.billing_city || '',
      delivery_state: req.body.delivery_state || req.body.billing_state || '',
      delivery_zip: req.body.delivery_zip || req.body.billing_zip || '',
      delivery_country: req.body.delivery_country || 'India',
      delivery_tel: req.body.delivery_tel || billing_tel,
    };

    console.log('Creating CCAvenue order:', {
      order_id: finalOrderId,
      amount: ccavenueParams.amount,
      merchant_id: process.env.CCA_MERCHANT_ID
    });

    const ccavenue = new CCAvenue(process.env.CCA_WORKING_KEY);
    const encryptedData = ccavenue.encryptData(ccavenueParams);

    const isProduction = process.env.NODE_ENV === 'production';
    const gatewayUrl =  'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
      

    const orderData = {
      order_id: finalOrderId,
      amount: ccavenueParams.amount,
      currency: currency,
      encrypted_data: encryptedData,
      access_code: process.env.CCA_ACCESS_CODE,
      gateway_url: gatewayUrl,
    };

    console.log('Order created successfully:', {
      order_id: orderData.order_id,
      encrypted_data_length: encryptedData.length
    });

    return successResponse(res, "Order created successfully", orderData);
  } catch (err) {
    console.error('Error in createPaymentOrder:', err);
    return errorResponse(res, SOMETHING_WENT_WRONG);
  }
};

const handleCCAvenueCallback = async (req, res) => {
  try {
    const { encResp } = req.body;

    if (!encResp) {
      console.error('No encrypted response received');
      return res.redirect(`${process.env.CUSTOMER_SIDE_URL||""}/payment/error?message=No response data`);
    }

    console.log('Received CCAvenue callback');

    const ccavenue = new CCAvenue(process.env.CCA_WORKING_KEY);
    const decryptedData = ccavenue.decryptData(encResp);

    console.log('Payment response:', {
      order_id: decryptedData.order_id,
      order_status: decryptedData.order_status,
      tracking_id: decryptedData.tracking_id,
    });

    const customerUrl = process.env.CUSTOMER_SIDE_URL || 'http://localhost:5173';
    

    if (decryptedData.order_status === 'Success') {
      const successUrl = `${customerUrl}/payment/success?order_id=${decryptedData.order_id}&tracking_id=${decryptedData.tracking_id}&amount=${decryptedData.amount}`;
      return res.redirect(successUrl);
    } else if (decryptedData.order_status === 'Aborted') {
      const cancelUrl = `${customerUrl}/payment/cancelled?order_id=${decryptedData.order_id}`;
      return res.redirect(cancelUrl);
    } else {
      const failureMessage = encodeURIComponent(decryptedData.failure_message || decryptedData.status_message || 'Payment failed');
      const failureUrl = `${customerUrl}/payment/failed?order_id=${decryptedData.order_id}&message=${failureMessage}`;
      return res.redirect(failureUrl);
    }
  } catch (err) {
    console.error('Error in CCAvenue callback:', err);
    const customerUrl = process.env.CUSTOMER_SIDE_URL || 'http://localhost:5173';
    return res.redirect(`${customerUrl}/payment/error?message=Processing error`);
  }
};

module.exports = {
  createPaymentOrder,
  handleCCAvenueCallback,
};
