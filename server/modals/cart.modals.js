const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────────────────────
// Schema Definition
// ─────────────────────────────────────────────────────────────────────────────

const ShoppingCardSchemaDefinition = new mongoose.Schema(
  {
    // ── Owner identification ───────────────────────────────────────────────
    user_id:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    guest_id: { type: String, default: null, index: true },

    // ── Product info ───────────────────────────────────────────────────────
    product_id:          { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    product_name:        { type: String, default: "" },
    product_image:       { type: String, default: "" },
    product_seo_url:     { type: String, default: "" },
    product_design_file: { type: String, default: "" },
    product_variants:    { type: Array,  default: [] },
    product_price:       { type: Number, default: 0 },

    // ── Quantity ───────────────────────────────────────────────────────────
    quantity:         { type: Number, default: 1, min: 1 },
    product_quantity: { type: Number, default: 1, min: 1 },

    // ── Category ───────────────────────────────────────────────────────────
    category_name:    { type: String, default: "" },
    subcategory_name: { type: String, default: "" },

    // ── Pricing ────────────────────────────────────────────────────────────
    final_total:            { type: Number, default: 0 },
    final_total_withoutGst: { type: Number, default: 0 },
    cgst:                   { type: Number, default: 0 },
    sgst:                   { type: Number, default: 0 },
    MRP_savings:            { type: Number, default: 0 },
    TotalSavings:           { type: Number, default: 0 },

    // ── Delivery ───────────────────────────────────────────────────────────
    FreeDelivery:    { type: Boolean, default: false },
    DeliveryCharges: { type: Number,  default: 0 },
    noCustomtation:  { type: Boolean, default: false },

    // ── Optional product fields ────────────────────────────────────────────
    size:         { type: String, default: null },
    color:        { type: String, default: null },
    instructions: { type: String, default: null },

    // ── QR product platform tracking ──────────────────────────────────────
    is_qr_product:      { type: Boolean,  default: false },
    selected_platforms: { type: [String], default: [] },
    platform_links:     { type: Map, of: String, default: {} },

    // ── Contact info for abandonment reminders ────────────────────────────
    phone_number: { type: String, default: null, index: true },
    email:        { type: String, default: null },

    // ── ✅ Repeated reminder tracking ─────────────────────────────────────
    //
    // OLD (wrong): reminder_sent: Boolean  ← blocked all future reminders
    //
    // NEW: track count + last sent time instead of a boolean flag.
    //
    // reminder_count        — increments on every successful reminder
    // last_reminder_sent_at — when the last reminder was sent;
    //                         cron uses this to decide if interval has elapsed
    //
    reminder_count:        { type: Number, default: 0,    index: true },
    last_reminder_sent_at: { type: Date,   default: null, index: true },

    // ── Timestamps ────────────────────────────────────────────────────────
    // updated_at: tracks the LAST TIME THE CUSTOMER touched the cart.
    // The cron uses this to confirm the cart is truly idle (abandoned).
    // NEVER update this from the cron — use CRON_INTERNAL_UPDATE: true.
    created_at: { type: Date, default: Date.now },
    updated_at:  { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────

// Covers the full cron query in one index
ShoppingCardSchemaDefinition.index({
  updated_at:           1,
  last_reminder_sent_at: 1,
  reminder_count:        1,
});

ShoppingCardSchemaDefinition.index({ user_id:  1, product_id: 1 });
ShoppingCardSchemaDefinition.index({ guest_id: 1, product_id: 1 });

// ─────────────────────────────────────────────────────────────────────────────
// Middleware — auto-update updated_at on every CUSTOMER-driven write.
//
// Pass { CRON_INTERNAL_UPDATE: true } as the options argument to any
// updateOne / updateMany / findOneAndUpdate called from the cron job.
// This skips the hook so cron writes don't reset the abandon clock.
// ─────────────────────────────────────────────────────────────────────────────

ShoppingCardSchemaDefinition.pre("save", function (next) {
  if (!this.isNew) this.updated_at = new Date();
  next();
});

ShoppingCardSchemaDefinition.pre(
  ["updateOne", "updateMany", "findOneAndUpdate"],
  function (next) {
    if (!this.getOptions()?.CRON_INTERNAL_UPDATE) {
      this._update.$set = this._update.$set || {};
      this._update.$set.updated_at = new Date();
    }
    next();
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Model
// ─────────────────────────────────────────────────────────────────────────────

const ShoppingCardSchema = mongoose.model("ShoppingCard", ShoppingCardSchemaDefinition);

module.exports = { ShoppingCardSchema };

// ─────────────────────────────────────────────────────────────────────────────
// ONE-TIME MIGRATION — run once in mongo shell on existing collection:
//
//   // 1. Replace old boolean fields with new counter fields
//   db.shoppingcards.updateMany({}, {
//     $unset: { reminder_sent: "", reminder_sent_at: "" },
//     $set:   { reminder_count: 0, last_reminder_sent_at: null }
//   })
//
//   // 2. Backfill missing updated_at
//   db.shoppingcards.updateMany(
//     { updated_at: { $exists: false } },
//     [{ $set: { updated_at: "$created_at" } }]
//   )
//
//   // 3. Recreate index
//   db.shoppingcards.createIndex({
//     updated_at: 1, last_reminder_sent_at: 1, reminder_count: 1
//   })
// ─────────────────────────────────────────────────────────────────────────────