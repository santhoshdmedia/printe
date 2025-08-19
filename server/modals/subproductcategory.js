const { model, Schema } = require("mongoose");

module.exports = new model(
  "sub product",
  Schema(
    {
      select_sub_category: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      sub_product_name: {
        type: String,
        required: true,
      },
      sub_product_image: {
        type: String,
        required: true,
      },    
      label: [{ type: String }],
    },
    {
      collection: "sub product",
      timestamps: true,
    }
  )
);
