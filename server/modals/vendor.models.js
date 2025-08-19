const { Schema, model } = require("mongoose");

module.exports = model(
  "vendor",
  Schema(
    {
      vendor_name: {
        type: String,
        required: true,
      },
      vendor_image: {
        type: String,
        required: true,
      },
      vendor_email: {
        type: String,
        required: true,
      },
      vendor_contact_number: {
        type: Number,
        required: true,
      },
      unique_code: {
        type: String,
        required: true,
      },
      business_name: {
        type: String,
        required: true,
      },
      business_address: {
        type: String,
        required: true,
      },
      alternate_vendor_contact_number: {
        type: Number,
        required: true,
      },
    },
    {
      timestamps: true,
      collection: "vendor",
    }
  )
);
