const { model, Schema } = require("mongoose");

module.exports = model(
  "blog",
  Schema(
    {
      blog_name: {
        type: String,
        required: true,
      },
      blog_image: {
        type: String,
        required: true,
      },
      blog_slug: {
        type: String,
        required: true,
        unique: true, // optional – ensures slug uniqueness
      },
      short_description: {
        type: String,
        required: true,
      },
      blog_descriptions: {
        type: Array,
        required: true,
      },
      // 🔽 NEW SEO FIELDS
      meta_title: {
        type: String,
        default: "",
      },
      meta_description: {
        type: String,
        default: "",
      },
      meta_keywords: {
        type: String,
        default: "",
      },
      // Optional: canonical URL, OG image, etc.
    },
    {
      collection: "blog",
      timestamps: true,
    }
  )
);