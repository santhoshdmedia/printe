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
      },
      nav_menu_square_image: {
        type: String,
        required: false,
        default: "",
      },
      nav_menu_horizontal_image: {
        type: String,
        required: false,
        default: "",
      },
    },
    {
      collection: "main category",
      timestamps: true,
    }
  )
);