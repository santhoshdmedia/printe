const { Schema, model } = require("mongoose");

module.exports = model(
  "admin_users",
  Schema(
    {
      profileImg: {
        type: String,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      phone: {
        type: Number,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: [
          "super admin",
          "accounting team",
          "designing team",
          "quality check team ",
          "production team",
          "delivery team",
        ],
        required: true,
      },
      available: {
        type: Boolean,
        default: true,
      },
      isOnline: {
        type: Boolean,
        default: false,
      },
    },
    {
      collection: "admin users",
      timestamps: true,
    }
  )
);
