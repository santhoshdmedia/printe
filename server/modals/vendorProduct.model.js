const { Schema, model } = require("mongoose");

module.exports = model(
  "vendor_Products",
  new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true
      },
      category: {
        type: String,
        required: true,
      },
      sellerPrice: {
        type: Number,
        required: true,
        min: 0
      },
      quantity: {
        type: Number,
        required: true,
        min: 0
      },
      sku: {
        type: String,
        required: true,
        unique: true
      },
      division: {
        type: String,
        required: true
      },
      Product_image: [{
        type: String // Cloudinary URLs or file paths
      }],
      status: {
        type: String,
        enum: ['active', 'inactive', 'draft'], // Added 'draft' to enum
        default: 'draft'
      }
    },
    {
      timestamps: true,
      collection: "vendor_Products"
    }
  )
);