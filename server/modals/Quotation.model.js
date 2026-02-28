// ==================== QUOTATION MODEL ====================
// File: models/Quotation.model.js

const { Schema, model } = require("mongoose");

const quotationCartItemSchema = new Schema(
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
  },
  { _id: false }
);

const Quotation = model(
  "quotation",
  Schema(
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
      quotation_no: {
        type: String,
        required: true,
        unique: true,
      },
      company_name: { type: String, default: "" },
      cart_items: {
        type: [quotationCartItemSchema],
        required: true,
      },
      billing_address: {
        type: Object,
        required: true,
      },
      quotation_status: {
        type: String,
        enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'],
        default: 'draft',
      },
      status_updated_at: { type: Date },
      subtotal:             { type: Number, default: 0 },
      discount_percentage:  { type: Number, default: 0 },
      discount_amount:      { type: Number, default: 0 },
      taxable_amount:       { type: Number, default: 0 },
      tax_amount:           { type: Number, default: 0 },
      DeliveryCharges:      { type: Number, default: 0 },
      FreeDelivery:         { type: Boolean, default: false },
      total_amount:         { type: Number, required: true },
      gst_no:               { type: String, default: "" },
      valid_until:          { type: Date, required: true },
      notes:                { type: String, default: "" },
      terms_and_conditions: { type: String, default: "" },
      qr_code:              { type: String },
      qr_url:               { type: String },
      qr_generated_at:      { type: Date },
      converted_to_order:   { type: Boolean, default: false },
      order_invoice_no:     { type: String },
      converted_at:         { type: Date },
      created_by: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'admin',
      },
      created_by_admin_id: {
        type: Schema.Types.ObjectId,
        ref: "admin_users",
      },
    },
    {
      collection: "quotations",
      timestamps: true,
    }
  )
);

module.exports = { Quotation };