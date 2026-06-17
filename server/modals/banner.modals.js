const { model, Schema } = require("mongoose");

const BannerSchema = Schema(
  {
    // ── Core fields ────────────────────────────────────────────────────────
    banner_name: {
      type: String,
      required: true,
      // Displayed as the giant background title text (e.g. "BMW Isetta")
    },
    banner_slug: {
      type: String,
    },

    // ── New fields for editorial / Classic style design ────────────────────
    origin: {
      type: String,
      default: null,
      // Shown top-left in small caps (e.g. "Germany  Italy")
    },
    year_range: {
      type: String,
      default: null,
      // Shown top-right in small caps (e.g. "1955–1962")
    },
    description: {
      type: String,
      default: null,
      // Short paragraph shown below the image in small caps
    },

    // ── Existing fields ────────────────────────────────────────────────────
    rating: {
      type: String,
    },
    tag: {
      type: String,
      required: true,
      // Used as the centered top label (e.g. "Classic Microcars")
    },
    feature: {
      type: Array,
      required: true,
      // Small feature bullets shown below description (e.g. ["Low emission", "Iconic design"])
    },
    banner_image: {
      type: String,
      required: true,
      // Product/hero image centered over the giant title
    },
    is_reward: {
      type: Boolean,
      default: false,
    },
    banner_products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    position: {
      type: Number,
      default: 0,
    },
    is_visible: {
      type: Boolean,
      default: true,
    },
    expiry_date: {
      type: Date,
      default: null,
    },
    auto_hidden: {
      type: Boolean,
      default: false,
      // Set to true when the banner was automatically hidden on expiry
    },
  },
  {
    collection: "Banner",
    timestamps: true,
  }
);

// ── Auto-hide expired banners before any find ────────────────────────────────
BannerSchema.pre(/^find/, async function (next) {
  const now = new Date();
  await this.model.updateMany(
    {
      expiry_date: { $lte: now, $ne: null },
      is_visible: true,
    },
    {
      $set: {
        is_visible: false,
        auto_hidden: true,
      },
    }
  );
  next();
});

// ── Instance helpers ─────────────────────────────────────────────────────────
BannerSchema.methods.isExpired = function () {
  if (!this.expiry_date) return false;
  return new Date() > this.expiry_date;
};

BannerSchema.virtual("daysUntilExpiry").get(function () {
  if (!this.expiry_date) return null;
  const diff = this.expiry_date - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

BannerSchema.set("toJSON", { virtuals: true });
BannerSchema.set("toObject", { virtuals: true });

module.exports = model("Banner", BannerSchema);