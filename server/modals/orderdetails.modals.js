const { Schema, model } = require("mongoose");

const Order = model(
  "order_details",
  Schema(
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      cart_items: {
        type: Object,
        required: true,
      },
      delivery_address: {
        type: Object,
        required: true,
      },
      order_status: {
        type: String,
        required: true,
        default: "placed",
      },
      total_price: {
        type: String, // Changed to String to preserve decimal format
        required: true,
      },
      payment_type: {
        type: String,
        required: true,
      },
      invoice_no: {
        type: String,
        required: true,
      },
      payment_ids: {
        type: [String],
        default: []
      },
      transaction_ids: {
        type: [String],
        default: []
      },
      gst_no: {
        type: String,
      },
      payment_status: {
        type: String,
        enum: ["pending", "advance_paid", "completed", "failed"],
        default: "pending",
      },
      payment_date: {
        type: Date
      },
      payment_mode: {
        type: String,
        enum: ["card", "netbanking", "upi", "wallet"],
      },
      advance_payment: {
        type: String, // Changed to String
        default: "0.00",
      },
      full_payment: {
        type: String, // Changed to String
        default: "0.00",
      },
      remaining_amount: {
        type: String, // Changed to String
        default: "0.00"
      }
    },
    {
      collection: "order_details",
      timestamps: true,
    }
  )
);


const order_delivery_timeline = model(
  "order_delivery_timeline",
  Schema(
    {
      order_id: {
        type: Schema.Types.ObjectId,
        ref: "order_details",
        required: true,
      },
      order_status: {
        type: String,
        required: true,
        default: "placed",
      },
    },
    {
      collection: "order_delivery_timeline",
      timestamps: true,
    }
  )
);

module.exports = {
  Order,
  order_delivery_timeline,
};
