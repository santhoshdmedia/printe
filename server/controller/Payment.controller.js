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
      gst_no
    } = req.body;

    if (!amount || !billing_name || !billing_email || !billing_tel || !cart_items || !delivery_address) {
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

    const finalOrderId = order_id || `PRINTE${Date.now()}`;

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    // Create order in database according to your exact schema format
    try {
      const newOrder = new OrderDetailsSchema({
        user_id: user_id,
        cart_items: cart_items, // This should be a single object, not array
        delivery_address: {
          name: delivery_address.name || billing_name,
          email: delivery_address.email || billing_email,
          mobile_number: delivery_address.mobile_number || billing_tel,
          alternateMobileNumber: delivery_address.alternateMobileNumber || '',
          street: delivery_address.street || delivery_address.address || '',
          pincode: delivery_address.pincode || delivery_address.zip || ''
        },
        order_status: "pending payment",
        total_price: parseFloat(amount),
        DeliveryCharges: parseFloat(delivery_charges),
        FreeDelivery: free_delivery,
        payment_type: "Online Payment", // Match your format
        invoice_no: finalOrderId,
        payment_status: "pending",
        gst_no: gst_no || "",
        transaction_id: "" // Initialize empty
      });

      await newOrder.save();
      console.log('Order created in database:', newOrder._id);

    } catch (dbError) {
      console.error('Error creating order in database:', dbError);
      return errorResponse(res, "Failed to create order record");
    }

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
      billing_address: req.body.billing_address || delivery_address.street || '',
      billing_city: req.body.billing_city || '',
      billing_state: req.body.billing_state || '',
      billing_zip: req.body.billing_zip || delivery_address.pincode || '',
      billing_country: req.body.billing_country || 'India',
      delivery_name: delivery_address.name || billing_name,
      delivery_address: delivery_address.street || '',
      delivery_city: req.body.delivery_city || '',
      delivery_state: req.body.delivery_state || '',
      delivery_zip: delivery_address.pincode || '',
      delivery_country: req.body.delivery_country || 'India',
      delivery_tel: delivery_address.mobile_number || billing_tel,
    };

    console.log('Creating CCAvenue order:', {
      order_id: finalOrderId,
      amount: ccavenueParams.amount
    });

    const ccavenue = new CCAvenue(process.env.CCA_WORKING_KEY);
    const encryptedData = ccavenue.encryptData(ccavenueParams);

    const gatewayUrl = process.env.NODE_ENV === 'production' 
      ? 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
      : 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction';

    const orderData = {
      order_id: finalOrderId,
      amount: ccavenueParams.amount,
      currency: currency,
      encrypted_data: encryptedData,
      access_code: process.env.CCA_ACCESS_CODE,
      gateway_url: gatewayUrl,
      merchant_id: process.env.CCA_MERCHANT_ID
    };

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

    console.log('Payment response:', decryptedData);

    // Update order in database with payment status and transaction ID
    if (decryptedData.order_id) {
      try {
        const updateData = {
          payment_status: decryptedData.order_status === 'Success' ? 'completed' : 
                         decryptedData.order_status === 'Aborted' ? 'cancelled' : 'failed',
          payment_date: new Date()
        };

        // Store transaction ID and payment ID
        if (decryptedData.tracking_id) {
          updateData.transaction_id = decryptedData.tracking_id;
        }

        if (decryptedData.bank_ref_no) {
          updateData.payment_id = decryptedData.bank_ref_no;
        }

        // Update order status based on payment status
        if (decryptedData.order_status === 'Success') {
          updateData.order_status = 'accounting team'; // Your default status
        } else if (decryptedData.order_status === 'Aborted') {
          updateData.order_status = 'cancelled';
        } else {
          updateData.order_status = 'payment failed';
        }

        const updatedOrder = await OrderDetailsSchema.findOneAndUpdate(
          { invoice_no: decryptedData.order_id },
          updateData,
          { new: true }
        );

        if (updatedOrder) {
          console.log('Order updated successfully:', {
            order_id: decryptedData.order_id,
            payment_status: updateData.payment_status,
            transaction_id: updateData.transaction_id,
            payment_id: updateData.payment_id
          });
        }

      } catch (dbError) {
        console.error('Error updating order in database:', dbError);
      }
    }

    const customerUrl = process.env.CUSTOMER_SIDE_URL || 'https://printe.in';

    if (decryptedData.order_status === 'Success') {
      const successUrl = `${customerUrl}/payment/success?order_id=${decryptedData.order_id}&tracking_id=${decryptedData.tracking_id || ''}&amount=${decryptedData.amount}`;
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
    const customerUrl = process.env.CUSTOMER_SIDE_URL || 'https://printe.in';
    return res.redirect(`${customerUrl}/payment/error?message=Processing error`);
  }
};

module.exports = {
  createPaymentOrder,
  handleCCAvenueCallback
};