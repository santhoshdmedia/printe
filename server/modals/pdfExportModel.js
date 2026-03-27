// models/pdfExportModel.js
const mongoose = require("mongoose");

const exportedProductSchema = new mongoose.Schema(
  {
    product_id: { type: String, required: true },
    name: { type: String, default: "N/A" },
    product_code: { type: String, default: "N/A" },
    product_codeS_NO: { type: String, default: "N/A" },
    category: { type: String, default: "N/A" },
    sub_category: { type: String, default: "N/A" },
    mrp_price: { type: String, default: "N/A" },
    customer_price: { type: String, default: "N/A" },
    dealer_price: { type: String, default: "N/A" },
    stock: { type: Number, default: 0 },
    is_visible: { type: Boolean, default: true },
    image_url: { type: Array, default: [] },
    type: { type: String, default: "N/A" },
    gst: { type: String, default: "18" },
    hsn_code: { type: String, default: "N/A" },
    stocks_status: { type: String, default: "N/A" },
    DaysNeeded: { type: String, default: "N/A" },
    product_url: { type: String }

  },
  { _id: false }
);

const pdfExportSchema = new mongoose.Schema(
  {
    exported_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,   // optional — safe when auth middleware isn't applied
      default: null,
    },
    exported_by_name: { type: String, default: "Unknown" },
    export_type: {
      type: String,
      enum: ["selected", "all", "filtered"],
      default: "selected",
    },
    product_count: { type: Number, required: true },
    min_price: { type: String, default: "" },
    max_price: { type: String, default: "" },
    filename: { type: String, default: "" },
    products: [exportedProductSchema],
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for fast lookups by user and date
pdfExportSchema.index({ exported_by: 1, createdAt: -1 });
pdfExportSchema.index({ createdAt: -1 });

module.exports = mongoose.model("PdfExport", pdfExportSchema);