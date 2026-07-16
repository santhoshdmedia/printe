const { Schema, model } = require("mongoose");

// ─── Cart item sub-schema ─────────────────────────────────────────────────────
// photo_frame_details must be Mixed (plain object), NOT Array.
// Using Array caused Mongoose to silently discard the object sent from the client.
const cartItemSchema = new Schema(
  {
    product_id:   { type: String, default: "" },
    product_name: { type: String, required: true },
    quantity:     { type: Number, required: true, min: 1 },
    mrp_price:    { type: Number, default: 0 },
    price:        { type: Number, required: true },
    image:        { type: String, default: "" },
    size:         { type: String, default: "" },
    color:        { type: String, default: "" },
    notes:        { type: String, default: "" },

    // FIX: was `type: Array` — Mongoose silently dropped objects stored here.
    // Schema.Types.Mixed accepts any shape (object, array, primitives).
    photo_frame_details: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

// ─── Main order schema ────────────────────────────────────────────────────────
const Order = model(
  "order_details",
  Schema(
    {
      user_id: { type: Schema.Types.ObjectId, ref: "user" },

      cart_items: { type: [cartItemSchema], required: true },

      delivery_address: { type: Object, required: true },

      order_status: {
        type: String,
        required: true,
        default: "accounting team",
      },

      total_price: { type: Number, required: true },

      DeliveryCharges: { type: Number },
      FreeDelivery:    { type: Boolean },
      BrandingCharges: { type: Number, default: 0 }, // flat, one-time branding/customization charge for this order's item

      // ─── Photo frame fields ───────────────────────────────────────────
      // is_photoframe: canonical flag name used throughout backend & frontend.
      // The payload may arrive as is_photo_frame (with underscore) — the
      // CreateOrder controller normalises both spellings before saving.
      is_photoframe: { type: Boolean, default: false },

      // delivery_to_home: only meaningful when is_photoframe === true.
      //   false → customer collects in-store → delivery charge = ₹0
      //   true  → normal home delivery
      // FIX: was previously read from item.delivery_to_home (top-level),
      // but the actual flag lives inside photo_frame_details.delivery_to_home.
      // The controller now reads it from the correct nested location.
      delivery_to_home: { type: Boolean, default: true },

      // photo_frame_details: full customisation object (size, frame style,
      // uploaded image URL, names, message, delivery mode, etc.)
      // FIX: type is Mixed so Mongoose persists the entire plain object.
      photo_frame_details: { type: Schema.Types.Mixed, default: null },
      // ─────────────────────────────────────────────────────────────────

      payment_type:   { type: String, required: true },

      account_id:       { type: String },
      designerId:       { type: String },
      designFile:       { type: String },
      design_time:      { type: String },
      production_id:    { type: String },
      vender_id:        { type: String },
      Quality_check_id: { type: String },
      package_team_id:  { type: String },
      delivery_team_id: { type: String },

      invoice_no:       { type: String, required: true },
      payment_id:       { type: String },
      payment_status:   { type: String, default: "pending" },
      payment_date:     { type: Date },
      transaction_id:   { type: String },
      gst_no:           { type: String },

      vendor_deadline:    { type: Date },
      vendor_accepted_at: { type: Date },
      vendor_notes:       { type: String },

      payment_qr_code:       { type: String },
      payment_qr_url:        { type: String },
      qr_code_generated_at:  { type: Date },

      subtotal:             { type: Number },
      tax_amount:           { type: Number },
      discount_amount:      { type: Number },
      total_amount:         { type: Number },
      total_before_discount:{ type: Number },

      payment_option: { type: String, default: "full" },
      payment_mode:   { type: String },
      card_name:      { type: String },
      payment_failure_reason: { type: String },

      created_by: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer",
      },
      created_by_admin_id: { type: Schema.Types.ObjectId, ref: "admin_users" },
      admin_notes: { type: String },

      Is_cancelledOrder:        { type: Boolean, default: false },
      cancellation_requested:   { type: Boolean, default: false },
      cancellation_requested_at:{ type: Date },
      cancellation_requested_by:{ type: Schema.Types.ObjectId, ref: "admin_users" },
      cancellation_reason:      { type: String },
      status_before_cancellation:{ type: String },

      coupon: {
        code:           String,
        discount_type:  String,
        discount_value: Number,
        discount_amount:Number,
        final_amount:   Number,
        applied_at:     Date,
      },
    },
    { collection: "order_details", timestamps: true }
  )
);

// ─── Order delivery timeline ──────────────────────────────────────────────────
const order_delivery_timeline = model(
  "order_delivery_timeline",
  Schema(
    {
      order_id: {
        type: Schema.Types.ObjectId,
        ref: "order_details",
        required: true,
      },
      order_status:    String,
      team_status:     String,
      action_type:     String,
      changed_by:      { type: Schema.Types.ObjectId, ref: "admin_users" },
      changed_by_name: String,
      changed_by_role: String,
      notes:           String,
      team_participation: {
        type: Map,
        of: new Schema({
          user_id:  { type: Schema.Types.ObjectId, ref: "admin_users" },
          name:     String,
          role:     String,
          action: {
            type: String,
            enum: [
              "processed","verified","approved","rejected",
              "cancelled","accepted","completed","restored",
            ],
          },
          timestamp:   { type: Date, default: Date.now },
          assigned_by: { type: Schema.Types.ObjectId, ref: "admin_users" },
        }),
      },
    },
    { collection: "order_delivery_timeline", timestamps: true }
  )
);

module.exports = { Order, order_delivery_timeline };