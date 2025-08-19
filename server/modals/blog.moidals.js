const { model, Schema } = require("mongoose");

module.exports = model(
  "blog",
  Schema(
    {
      blog_name: {
        type: String,
        require: true,
      },
      blog_image: {
        type: String,
        required: true,
      },

      short_description: {
        type: String,
        required: true,
      },

      blog_descriptions: {
        type: Array,
        required: true,
      },
    },
    {
      collection: "blog",
      timestamps: true,
    }
  )
);
