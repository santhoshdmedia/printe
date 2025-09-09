const { default: mongoose } = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    value: { type: String },
    _id: { type: String },
    variant_type: { type: String },
    image_name: { type: String },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    variant_name: { type: String },
    variant_type: { type: String },
    options: [optionSchema],
    _id: { type: Number },
  },
  { _id: false }
);

module.exports = mongoose.model(
  "product",
  new mongoose.Schema(
    {
      sub_product_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sub product",
      },
      category_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "main category",
      },
      sub_category_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sub category",
      },
      product_card_color: {
        type: String,
      },
      type: {
        type: String,
        enum: ["Stand Alone Product", "Variable Product"],
        required: true,
      },
      HSNcode_time: {
        type: String,
        required: true,
      },
      Production_time: {
        type: String,
        required: true,
      },
      Stock_Arrangement_time: {
        type: String,
        required: true,
      },
      GST: {
        type: String,
      },
      Tax_prefernce: {
        type: String,
      },
      Visiblity: {
        type: Boolean,
      },
      unit_splitup: { type: Array },
      name: { type: String, require: true },
      Point_one: { type: String, require: true },
      Point_two: { type: String, require: true },
      Point_three: { type: String, require: true },
      Point_four: { type: String, require: true },
      stocks_status: { type: String, require: true },
      stock_count: { type: Number },
      dropdown_gap: { type: Number },
      product_code: { type: String, require: true },
      product_description_tittle: { type: String, require: true },
      images: { type: Array },
      label: [{ type: String }],
      description: { type: String },
      design_guidelines: { type: String },
      specification: { type: String },
      seo_title: { type: String, require: true },
      short_description: { type: String, require: true },
      quantity_type: { type: String, require: true },
      max_quantity: { type: Number },
      seo_url: { type: String, require: true },
      seo_description: { type: String, require: true },
      seo_keywords: { type: String, require: true },
      single_product_price: { type: Number, default: 0 },
      Seller_price: { type: Number, default: 0 },
      Cost: { type: Number, default: 0 },
      variants: [variantSchema],
      variants_price: { type: Array },
      description_tabs: { type: Array },
      quantity_discount_splitup: { type: Array },
      vendor_details: [{ type: mongoose.Schema.Types.ObjectId, ref: "vendor" }],
      new_product: { type: Boolean, require: true },
      recommended_product: { type: Boolean, require: true },
      popular_product: { type: Boolean, require: true },
      product_price: { type: String, require: true },
      parent_product_id: {
        type: String,
      },
      is_cloned: {
        type: Boolean,
        default: false,
      },
    },

    {
      collection: "product",
      timestamps: true,
    }
  )
);
