const { model, Schema } = require("mongoose");

module.exports = model(
  "Banner",
  Schema(
    {
      banner_name: {
        type: String,
        required: true,
      },
      tag: {
        type: String,
        required: true,
      },
      feature: {
        type: Array,
        required: true,
      },
      banner_image: {
        type: String,
        required: true,
      },
      is_reward: {
        type: Boolean,
        default:false
      },
      banner_products: [
        {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
    },
    {
      collection: "Banner",
      timestamps: true,
    }
  )
);
