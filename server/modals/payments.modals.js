const { Schema, model } = require("mongoose");

const Payment = model(
  "payment_details",
  Schema(
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      invoice_no: {
        type: String,
        required: true,
      },
      total_price: {
        type: Number,
        required: true,
      },
      advance_payment: {
        type: Number,
        default: 0,
      },
      full_payment: {
        type: Number,
        default: 0,
      },
      payment_details: [
        {
          payment_id: String,
          transaction_id: String,
          razorpay_order_id: String,
          amount: Number,
          payment_date: Date,
          payment_status: {
            type: String,
            enum: ["pending", "advance_paid", "completed", "failed"],
          },
          payment_mode: {
            type: String,
            enum: ["card", "netbanking", "upi", "wallet"],
          }
        }
      ],
      payment_status: {
        type: String,
        enum: ["pending", "advance_paid", "completed", "failed"],
        default: "pending",
      },
      payment_date: {
        type: Date,
        required: true,
      }
    },
    {
      collection: "payment_details",
      timestamps: true,
    }
  )
);

module.exports = {
  Payment,
};