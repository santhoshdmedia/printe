const { Schema, model } = require("mongoose");

const Order = model(
  "order_details",
  Schema(
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "user",
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
        default: "accounting team",
      },
      total_price: {
        type: Number,
        required: true,
      },
      DeliveryCharges: {
        type: Number,
      },
      FreeDelivery: {
        type: Boolean,
      },
      payment_type: {
        type: String,
        required: true,
      },
      account_id: {
        type: String,
      },
      designerId: {
        type: String,
      },
      designFile: {
        type: String,
      },
      design_time: {
        type: String,
      },
      production_id: {
        type: String,
      },
      vender_id: {
        type: String,
      },
      Quality_check_id: {
        type: String,
      },
      package_team_id: {
        type: String,
      },
      delivery_team_id: {
        type: String,
      },
      invoice_no: {
        type: String,
        required: true,
      },
      payment_id: {
        type: String,
      },
      payment_status: {
        type: String,
        default: "pending"
      },
      payment_date: {
        type: Date
      },
      transaction_id: {
        type: String
      },
      gst_no: {
        type: String,
      },
      vendor_deadline: {
        type: Date,
      },
      vendor_accepted_at: {
        type: Date,
      },
      vendor_notes: {
        type: String,
      },
      // New QR Code fields
      payment_qr_code: {
        type: String, // Base64 encoded QR code image
      },
      payment_qr_url: {
        type: String, // URL encoded in QR code
      },
      qr_code_generated_at: {
        type: Date,
      },
      // Additional payment fields
      subtotal: {
        type: Number,
      },
      tax_amount: {
        type: Number,
      },
      discount_amount: {
        type: Number,
      },
      total_amount: {
        type: Number,
      },
      total_before_discount: {
        type: Number,
      },
      payment_option: {
        type: String,
        default: "full"
      },
      payment_mode: {
        type: String,
      },
      card_name: {
        type: String,
      },
      payment_failure_reason: {
        type: String,
      },
      created_by: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
      },
      created_by_admin_id: {
        type: Schema.Types.ObjectId,
        ref: "admin_users",
      },
      admin_notes: {
        type: String,
      },
      Is_cancelledOrder: {
        type: Boolean,
        default:false
      },
      coupon: {
        code: String,
        discount_type: String,
        discount_value: Number,
        discount_amount: Number,
        final_amount: Number,
        applied_at: Date
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
      order_status: String,
      team_status: String,
      changed_by: {
        type: Schema.Types.ObjectId,
        ref: "admin_users",
      },
      changed_by_name: String,
      changed_by_role: String,
      notes: String,
      team_participation: {
        type: Map,
        of: new Schema({
          user_id: {
            type: Schema.Types.ObjectId,
            ref: "admin_users",
          },
          name: String,
          role: String,
          action: {
            type: String,
            enum: ["processed", "verified", "approved", "rejected","cancelled"],
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          assigned_by: {
            type: Schema.Types.ObjectId,
            ref: "admin_users",
          },
        }),
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