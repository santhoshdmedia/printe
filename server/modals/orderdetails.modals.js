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
        default: "accounting team",
      },
      total_price: {
        type: Number,
        required: true,
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
      design_time:{
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
            enum: ["processed", "verified", "approved", "rejected"],
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
