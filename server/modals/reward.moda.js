// models/Reward.js
const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Reward name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  pointsRequired: {
    type: Number,
    required: [true, 'Points required is needed'],
    min: [0, 'Points cannot be negative']
  },
  category: {
    type: String,
    enum: ['electronics', 'lifestyle', 'food', 'travel', 'other'],
    default: 'lifestyle'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  features: [{
    type: String,
    trim: true
  }],
  stock: {
    type: Number,
    default: 10,
    min: [0, 'Stock cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'out_of_stock', 'expired'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reward', rewardSchema);