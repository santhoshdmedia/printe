
const mongoose = require('mongoose');

const discountTierSchema = new mongoose.Schema({
  minimumQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'shipping', 'tiered_quantity'],
    required: true
  },
  discountValue: {
    type: Number,
    required: function() {
      return this.discountType !== 'tiered_quantity';
    },
    min: 0
  },
  discountTiers: [discountTierSchema],
  minimumOrderAmount: {
    type: Number,
    default: 0
  },
  maximumDiscount: {
    type: Number,
    default: null
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: String
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  singleUse: {
    type: Boolean,
    default: false
  },
  userIdsUsed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isPerProductDiscount: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ endDate: 1 });
couponSchema.index({ discountType: 1 });

module.exports = mongoose.model('Coupon', couponSchema);