const { Schema, model } = require("mongoose");

module.exports = model(
  "user_review",
  Schema(
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      product_id: {
        type: Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      rating: {
        type: Number,
      },
      review: {
        type: String,
      },
    },
    {
      collection: "user_review",
      timestamps: true,
    }
  )
);
