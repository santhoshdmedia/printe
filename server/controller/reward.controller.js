// controllers/rewardController.js
const Reward = require('../modals/reward.moda');
const mongoose = require('mongoose');
const User = require('../modals/user.modal'); // Adjust path as needed

// Get all rewards
exports.getAllRewards = async (req, res) => {
  try {
    const { category, minPoints, maxPoints, featured, search } = req.query;
    
    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by points range
    if (minPoints || maxPoints) {
      query.pointsRequired = {};
      if (minPoints) query.pointsRequired.$gte = parseInt(minPoints);
      if (maxPoints) query.pointsRequired.$lte = parseInt(maxPoints);
    }

    // Filter featured rewards
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Only show active rewards for non-admin users
   

    const rewards = await Reward.find(query).sort({ pointsRequired: 1 });
    
    res.json({
      success: true,
      count: rewards.length,
      data: rewards
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single reward
exports.getRewardById = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    res.json({
      success: true,
      data: reward
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create reward (Admin only)
exports.createReward = async (req, res) => {
  try {
    const reward = new Reward(req.body);
    await reward.save();
    
    res.status(201).json({
      success: true,
      data: reward
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update reward (Admin only)
exports.updateReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    res.json({
      success: true,
      data: reward
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete reward (Admin only)
exports.deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);

    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    res.json({
      success: true,
      message: 'Reward deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Claim reward
exports.claimReward = async (req, res) => {
  // Check if mongoose is available
  if (!mongoose.connection.readyState) {
    return res.status(500).json({ message: 'Database connection not available' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const rewardId = req.params.id;
    const userId = req.body.userId; // Changed from 'user' to 'userId'

    // Validate input
    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(rewardId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Fetch reward with session for transaction
    const reward = await Reward.findById(rewardId).session(session);
    
    // Check if reward exists
    if (!reward) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Reward not found' });
    }

    // Fetch user with session for transaction
    const user = await User.findById(userId).session(session);
    
    // Check if user exists
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if reward is available
    if (reward.status !== 'active') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Reward is not available' });
    }

    // Check stock
    if (reward.stock <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Reward is out of stock' });
    }

    // Check user points
    if (user.points < reward.pointsRequired) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'Insufficient points',
        required: reward.pointsRequired,
        available: user.points,
        needed: reward.pointsRequired - user.points
      });
    }

    // Check if user already claimed this reward recently (24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentClaim = user.redeemedRewards.find(
      r => r.rewardId && 
      r.rewardId.toString() === rewardId && 
      r.redeemedAt && 
      new Date(r.redeemedAt) > twentyFourHoursAgo
    );

    if (recentClaim) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'You can only claim this reward once per person',
        nextAvailable: new Date(new Date(recentClaim.redeemedAt).getTime() + 24 * 60 * 60 * 1000)
      });
    }

    // Prepare redemption record
    const redemptionRecord = {
      rewardId: reward._id,
      rewardName: reward.name, // Store reward name for reference
      pointsSpent: reward.pointsRequired,
      redeemedAt: new Date(),
      status: 'pending'
    };

    // Update user
    user.points -= reward.pointsRequired;
    user.totalPointsSpent = (user.totalPointsSpent || 0) + reward.pointsRequired;
    user.redeemedRewards.push(redemptionRecord);

    // Update reward
    reward.stock -= 1;
    reward.totalRedemptions = (reward.totalRedemptions || 0) + 1;
    if (reward.stock === 0) {
      reward.status = 'out_of_stock';
    }

    // Save both changes in transaction
    await Promise.all([
      user.save({ session }),
      reward.save({ session })
    ]);

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Get the last redemption ID
    const lastRedemption = user.redeemedRewards[user.redeemedRewards.length - 1];

    res.json({
      success: true,
      message: 'Reward claimed successfully!',
      data: {
        reward: {
          id: reward._id,
          name: reward.name,
          pointsRequired: reward.pointsRequired,
          stock: reward.stock
        },
        user: {
          id: user._id,
          remainingPoints: user.points,
          totalPointsSpent: user.totalPointsSpent
        },
        redemptionId: lastRedemption._id || lastRedemption.id,
        redemptionDate: new Date()
      }
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction().catch(() => {});
    session.endSession();
    
    console.error('Error claiming reward:', error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        error: error.message 
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({ 
        message: 'Database error occurred' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to claim reward',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};