const { default: mongoose } = require("mongoose");
const { model, Schema } = require("mongoose");

module.exports = new model(
  "main category",
  Schema(
    {
      main_category_name: {
        required: true,
        type: String,
      },
      subCategory: [
        {
          type: Schema.Types.ObjectId,
          ref: "sub category",
        },
      ],
      // position: {
      //   type: Number,
      //   required: true,
      // },
      category_active_status: {
        type: Boolean,
        required: false,
      },
      Add_to_nav: {
        type: Boolean,
        required: false,
      },
        cat_imgs: {
        type: String,
        required: true,
      },
    },

    {
      collection: "main category",
      timestamps: true,
    }
  )
);
