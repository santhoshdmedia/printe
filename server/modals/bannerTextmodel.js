const { model, Schema } = require("mongoose");

module.exports = model(
  "BannerText",
  new Schema(
    {
      bannerText: {
        type: String,
        required: true,
      }
    },
    {
      collection: "BannerText",
      timestamps: true,
    }
  )
);