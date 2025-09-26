const { Schema, model } = require("mongoose");

module.exports = model(
  "Bulk_order",
  Schema(
    {
      product_name: {
        type: String,
        required: true,
      },
      quantity: {
        type: String,
        required: true,
      },
      mobile
: {
        type: String,
        required: true,
      },
      
email: {
        type: String,
        required: true,
      },
      additional_requirements: {
        type: Number,
      }
    },
    {
      timestamps: true,
      collection: "Bulk_order",
    }
  )
);
