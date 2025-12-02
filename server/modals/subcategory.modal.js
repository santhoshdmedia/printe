const { Schema, model, default: mongoose } = require("mongoose");

module.exports = new model(
  "sub category",
  Schema(
    {
      select_main_category: {
        type: Schema.Types.ObjectId,
        ref: "main category",
        required: true,
      },
      sub_category_name: {
        type: String,
        required: true,
      },
      sub_category_image: {
        type: String,
        required: true,
      },
      slug: {
        type: String,
        required: true,
      },
      position: {
        type: Number,
        default: 1,
      },
      sub_category_banner_image: {
        type: String,
        required: true,
      },
      show: {
        type: Boolean,
        dafault: true,
      },
    },
    {
      collection: "sub category",
      timestamps: true,
    }
  )
);
