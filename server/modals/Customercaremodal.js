const { model, Schema } = require("mongoose");

module.exports = model(
  "CustomerCare",
  Schema(
    {
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
        unique: true,
      },
      password: {
        type: String,
        required: true,
        minlength: 6,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      role: {
        type: String,
        default: "customer_care",
        enum: ["customer_care", "admin", "manager"]
      }
    },
    {
      collection: "CustomerCare",
      timestamps: true,
    }
  )
);