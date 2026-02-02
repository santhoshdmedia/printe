const { model, Schema } = require("mongoose");

const BannerSchema = Schema(
  {
    banner_name: {
      type: String,
      required: true,
    },
    banner_slug: {
      type: String,
    },
    rating: {
      type: String,
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
      default: false
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
      // This flag indicates if banner was auto-hidden due to expiry
    }
  },
  {
    collection: "Banner",
    timestamps: true,
  }
);

// Middleware to check and auto-hide expired banners before any find operation
BannerSchema.pre(/^find/, async function(next) {
  const now = new Date();
  
  // Auto-hide expired banners
  await this.model.updateMany(
    {
      expiry_date: { $lte: now, $ne: null },
      is_visible: true
    },
    {
      $set: {
        is_visible: false,
        auto_hidden: true
      }
    }
  );
  
  next();
});

// Method to check if banner is expired
BannerSchema.methods.isExpired = function() {
  if (!this.expiry_date) return false;
  return new Date() > this.expiry_date;
};

// Virtual to get days until expiry
BannerSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiry_date) return null;
  const now = new Date();
  const diff = this.expiry_date - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON
BannerSchema.set('toJSON', { virtuals: true });
BannerSchema.set('toObject', { virtuals: true });

module.exports = model("Banner", BannerSchema);