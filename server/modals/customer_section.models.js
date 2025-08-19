const { model, Schema, default: mongoose } = require("mongoose");

module.exports = model(
  "CustomerSection",
  Schema(
    {
      banner_images: {
        type: Array,
      },
      section_type:{
        type:String,
        enum:["product Floating","bannear"]
      },
      section_name: {
        type: String,
        required: true,
      },
      sub_title: {
        type: String,
        required: true,
      },
      banner_count: {
        type: Number,
      },
      section_products: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
      ],
      product_display: {
        type: String,
        required: true,
      },
    },
    {
      collection: "CustomerSection",
      timestamps: true,
    }
  )
);
