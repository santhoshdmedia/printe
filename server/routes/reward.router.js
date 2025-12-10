// routes/rewardRoutes.js
const router = require("express").Router();
const { 
  getAllRewards, 
  getRewardById, 
  createReward, 
  updateReward, 
  deleteReward, 
  claimReward 
} = require('../controller/reward.controller');
const { VerfiyToken } = require("../helper/shared.helper");



router.get('/',getAllRewards);
router.get('/:id',getRewardById);

// Protected routes
router.post('/',createReward);
router.put('/:id',updateReward);
router.delete('/:id',deleteReward);

// Claim reward (requires auth)
router.post('/:id/claim', claimReward);

module.exports = router;