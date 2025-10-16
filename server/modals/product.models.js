const { default: mongoose } = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    value: { type: String },
    _id: { type: String },
    variant_type: { type: String },
   image_names: { type: Array }
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    variant_name: { type: String },
    variant_type: { type: String },
    
    options: {type: Array},
    _id: { type: Number },
  },
  { _id: false }
);

const stockInfoSchema = new mongoose.Schema(
  {
    date: { 
      type: Date, 
      required: true,
      default: Date.now 
    },
    add_stock: { 
      type: Number, 
      required: true 
    },
    invoice: { 
      type: String 
    },
    notes: { 
      type: String 
    },
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
      product_codeS_NO: {
        type: String,
        required: true,
      },
      Vendor_Code: {
        type: String,
        required: true,
      },
      product_Lock: {
        type: Boolean,
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
      is_visible: {
        type: Boolean,
      },
      is_customer: {
        type: Boolean,
      },
      is_dealer: {
        type: Boolean,
      },
      is_corporate: {
        type: Boolean,
      },
      unit: { type: String },
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
      seo_title: { type: String, require: true },
      quantity_type: { type: String, require: true },
      max_quantity: { type: Number },
      seo_url: { type: String, require: true },
      seo_description: { type: String, require: true },
      seo_keywords: { type: String, require: true },
      variants: [variantSchema],
      variants_price: { type: Array },
      description_tabs: { type: Array },
      quantity_discount_splitup: { type: Array },
      vendor_details: [{ type: mongoose.Schema.Types.ObjectId, ref: "vendor" }],
      new_product: { type: Boolean, require: true },
      recommended_product: { type: Boolean, require: true },
      popular_product: { type: Boolean, require: true },
      MRP_price: { type: String, require: true },
      customer_product_price: { type: String, require: true },
      Deler_product_price: { type: String, require: true },
      corporate_product_price: { type: String, require: true },
      parent_product_id: {
        type: String,
      },
      stock_info: [stockInfoSchema],
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
