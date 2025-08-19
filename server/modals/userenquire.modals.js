const { Schema, model } = require("mongoose");

module.exports = model(
  "enquires",
  Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: Number,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },
    },
    {
      collection: "enquires",
      timestamps: true,
    }
  )
);
