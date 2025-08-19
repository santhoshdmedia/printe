const { Schema, model } = require("mongoose");

module.exports = model(
  "product_description",
  Schema(
    {
      product_id: {
        type: Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      tabs: {
        type: Array,
        required: true,
      },
    },
    {
      timestamps: true,
      collection: "product_description",
    }
  )
);
