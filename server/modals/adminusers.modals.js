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
          "Frontend admin",
          "Backend admin",
          "accounting team",
          "designing team",
          "quality check",
          "production team",
          "packing team",
          "delivery team",
        ],
        required: true,
      },
      permissions: {
        view: {
          type: Boolean,
          default: true,
        },
        edit: {
          type: Boolean,
          default: false,
        },
        delete: {
          type: Boolean,
          default: false,
        },
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