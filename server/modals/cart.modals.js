const { Schema, model } = require("mongoose");

module.exports = model(
  "shopping_cart",
  Schema(
    {
      guest_id: {
        type: String,
      },
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
      product_id: {
        type: Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      product_design_file: {
        type: String,
        required: false, 
      },
      FreeDelivery: {
        type: Boolean,
        required: true,
        default: false
      },
      product_image: {
        type: String,
        required: true,
      },
      product_name: {
        type: String,
        required: true,
      },
      category_name: {
        type: String,
        required: true,
      },
      subcategory_name: {
        type: String,
        required: true,
      },
      product_price: {
        type: Number,
        required: true,
      },
      MRP_savings: {
        type: String,
      },
      TotalSavings: {
        type: String,
      },
      product_quantity: {
        type: String,
        required: true,
      },
      product_seo_url: {
        type: String,
        required: true,
      },
      product_variants: {
        type: Array,
        required: true,
      },
      sgst: {
        type: String,
        required: true,
      },
      cgst: {
        type: String,
        required: true,
      },
      final_total: {
        type: Number,

        required: true,
      },
    },
    {
      timestamps: true,
      collection: "shopping_cart",
    }
  )
);
