const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
    productUniqueCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    productName: {
        type: String,
        required: true
    },
    productModel: {
        type: String,
        required: true
    },
    batchNumber: {
        type: String,
        required: true,
        index: true
    },
    manufacturingDate: {
        type: Date,
        required: true
    },
    warrantyDuration: {
        type: Number, // in months
        default: 6
    },
    warrantyType: {
        type: String,
        enum: ['standard', 'extended', 'premium'],
        default: 'standard'
    },
    
    // Activation fields
    isActivated: {
        type: Boolean,
        default: false
    },
    activationDate: Date,
    warrantyStartDate: Date,
    warrantyEndDate: Date,
    
    // Customer info (filled during activation)
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    purchaseDate: Date,
    retailerName: String,
    invoiceNumber: String,
    
    // Verification tracking
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: Date,
    verificationCount: {
        type: Number,
        default: 0
    },
    lastVerifiedAt: Date,
    
    // Claim information
    isClaimed: {
        type: Boolean,
        default: false
    },
    claimDate: Date,
    claimDetails: {
        issueType: String,
        description: String,
        claimedAt: Date,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed'],
            default: 'pending'
        }
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for faster queries
warrantySchema.index({ productUniqueCode: 1 }, { unique: true });
warrantySchema.index({ batchNumber: 1 });
warrantySchema.index({ isActivated: 1 });
warrantySchema.index({ warrantyEndDate: 1 });

// Virtual for warranty status
warrantySchema.virtual('warrantyStatus').get(function() {
    if (!this.isActivated) return 'not-activated';
    
    const now = new Date();
    if (now > this.warrantyEndDate) return 'expired';
    if (now > new Date(this.warrantyEndDate.getTime() - (7 * 24 * 60 * 60 * 1000))) return 'expiring-soon';
    return 'active';
});

// Middleware to update timestamps
warrantySchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Warranty', warrantySchema);