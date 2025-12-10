import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { getReward, redeemReward } from '../../helper/api_helper';
import { useSelector } from 'react-redux';

const Reward = () => {
  const [rewards, setRewards] = useState([]); // Changed to array
  const [selectedReward, setSelectedReward] = useState(null); // Changed name
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useSelector((state) => state.authSlice);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReward();
      console.log('Rewards API Response:', response);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setRewards(response.data.data);
        // Select first reward by default, or you can let user choose
        if (response.data.data.length > 0) {
          setSelectedReward(response.data.data[0]);
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError(err.response?.data?.message || err.message || "Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedReward || !user) {
      setError('Please select a reward and ensure you are logged in');
      return;
    }

    const data = {
      userId: user._id
    };
    
    console.log('Redeeming reward:', selectedReward._id, 'for user:', user._id);
    
    try {
      setRedeeming(true);
      setError(null);
      
      // Call your redeem API endpoint
      const response = await redeemReward(selectedReward._id, data);
      console.log('Redemption response:', response);
      
      if (response.data && response.data.success) {
        setSuccess(true);
        
        // Update local reward data
        setSelectedReward(prev => ({
          ...prev,
          stock: prev.stock - 1
        }));
        
        // Update rewards array
        setRewards(prev => prev.map(reward => 
          reward._id === selectedReward._id 
            ? { ...reward, stock: reward.stock - 1 }
            : reward
        ));
        
        // Show success message and reset after delay
        setTimeout(() => setSuccess(false), 5000);
      } else {
        throw new Error(response.data?.message || "Redemption failed");
      }
    } catch (err) {
      console.error('Redemption error:', err);
      setError(err.response?.data?.message || err.message || "Failed to redeem reward");
    } finally {
      setRedeeming(false);
    }
  };

  const handleSelectReward = (reward) => {
    setSelectedReward(reward);
    setSuccess(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  if (error && !rewards.length) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4 min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchRewards}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!rewards.length) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4 min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No rewards available at the moment</p>
          <button 
            onClick={fetchRewards}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (!selectedReward) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4 min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please select a reward</p>
          <div className="space-y-2">
            {rewards.map(reward => (
              <button
                key={reward._id}
                onClick={() => handleSelectReward(reward)}
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                {reward.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-white min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg"
          >
            <p className="font-semibold">Successfully redeemed!</p>
            <p className="text-sm">Your reward will be processed shortly.</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
          >
            <p className="font-semibold">Error</p>
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-sm underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Reward Selection */}
        {rewards.length > 1 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Rewards</h3>
            <div className="flex flex-wrap gap-2">
              {rewards.map(reward => (
                <button
                  key={reward._id}
                  onClick={() => handleSelectReward(reward)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedReward._id === reward._id
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {reward.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-600 rounded-full text-sm font-semibold">
                {selectedReward.category || 'Premium Reward'}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                {selectedReward.name}
              </h1>
              <p className="text-gray-600 text-lg">
                {selectedReward.description}
              </p>
            </div>

            <div className="space-y-4">
             

              <button 
                onClick={handleRedeem}
                disabled={redeeming || selectedReward.stock <= 0 || success || (user?.points || 0) < selectedReward.pointsRequired}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg w-full md:w-auto ${
                  redeeming || selectedReward.stock <= 0 || (user?.points || 0) < selectedReward.pointsRequired
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {redeeming ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Processing...
                  </span>
                ) : success ? (
                  '✓ Redeemed Successfully'
                ) : selectedReward.stock <= 0 ? (
                  'Out of Stock'
                ) : (user?.points || 0) < selectedReward.pointsRequired ? (
                  `Need ${selectedReward.pointsRequired - (user?.points || 0)} more points`
                ) : (
                  'Redeem Now'
                )}
              </button>
              
              {selectedReward.stock > 0 && selectedReward.stock < 10 && (
                <p className="text-sm text-orange-600 font-medium">
                  ⚠️ Only {selectedReward.stock} left in stock!
                </p>
              )}
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <div className="space-y-2">
                {selectedReward.features && selectedReward.features.length > 0 ? (
                  selectedReward.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      {feature}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No features listed</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Image */}
          <motion.div
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-yellow-100 to-cyan-50 rounded-2xl p-8 shadow-xl">
              <img 
                src={selectedReward.imageUrl || selectedReward.image || "https://via.placeholder.com/400x400?text=Reward+Image"} 
                alt={selectedReward.name}
                className="w-full max-w-md mx-auto transform -rotate-6 object-contain h-96"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x400?text=Reward+Image";
                }}
              />
            </div>
            
            {/* Stock status badge */}
            <div className="absolute -top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-400 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
              Welcome Gift
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Reward;