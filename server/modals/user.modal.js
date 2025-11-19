const mongoose = require("mongoose");

// Address Schema
const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  alternateMobileNumber: { type: String, require: true },
  street: { type: String, required: true },
  locality: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  addressType: { type: String, enum: ["home", "office"], required: true },
  pincode: { type: String, required: true },
});

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      trim: true,
    },
   googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values while maintaining uniqueness for non-null values
  },
    picture: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    gst_no: {
      type: String,
    },
     business_name: {
      type: String,
    },
    business_phone: {
      type: String,
    },
    business_email: {
      type: String,
    },
    business_address: {
      type: String,
    },
    person_address: {
      type: String,
    },
    person_phone: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "Corporate", "Dealer"],
    },
    phone: { type: String },

    wish_list: [],
    history_data: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
    ],

    addresses: [addressSchema],
    // corporate and dealer
    unique_code: {
      type: String,
    },
    business_name: {
      type: String,
    }
  },
  {
    timestamps: true,
    collection: "user",
  }
);

module.exports = mongoose.model("User", userSchema);
