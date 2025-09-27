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
        type: Number,
        required: true,
      },
      
email: {
        type: String,
        required: true,
      },
      additional_requirements: {
        type: String,
      }
    },
    {
      timestamps: true,
      collection: "Bulk_order",
    }
  )
);
