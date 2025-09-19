const { Schema, model } = require("mongoose");

module.exports = model(
  "vendor",
  Schema(
    {
      vendor_name: {
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
      shipping_address: {
        type: String,
        required: true,
      },
      billing_address: {
        type: String,
        required: true,
      },
      alternate_vendor_contact_number: {
        type: Number,
        required: true,
      },
      password:{
        type: String,
        required: true
      },
      gstNo:{
        type: String,
      },
      state:{
        type: String,
      },
      city:{
        type: String,
      },
      country:{
        type: String,
      },
      profile_img:{
        type: String,
      },
    },
    {
      timestamps: true,
      collection: "vendor",
    }
  )
);
