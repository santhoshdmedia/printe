import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Reward = () => {
  const [copied, setCopied] = useState(false);
  const couponCode = "VICTORIA100";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🎁 Exclusive Coupon Offer</h1>
        <p className="mb-6 text-yellow-100">Limited Time Only!</p>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Victoria100 Coupon</h2>
              <p className="mb-4">FLAT ₹4477/pc on Victoria Luxe</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-xl">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2 font-semibold">COUPON CODE</p>
                <div className="bg-yellow-100 rounded-lg p-3 mb-4 border-2 border-yellow-300">
                  <span className="text-3xl font-bold text-yellow-700 tracking-wider">
                    {couponCode}
                  </span>
                </div>
                
                <CopyToClipboard text={couponCode} onCopy={handleCopy}>
                  <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all">
                    {copied ? '✓ Copied!' : 'Copy Code'}
                  </button>
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <p className="font-medium">
            Apply at checkout for instant savings
          </p>
          <p className="text-sm text-yellow-100">
            🎯 Valid till December 31, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reward;