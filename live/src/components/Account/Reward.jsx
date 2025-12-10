import React from 'react';
import waterBottle from "../../assets/mockup/water_bottles.png";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';

const Reward = () => {
  return (
    <div className=" bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-600 rounded-full text-sm font-semibold">
                Premium Reward
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Steel
                <span className="block text-yellow-600">Water Bottle</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Stay hydrated with our premium insulated water bottle. 
                Perfect for daily use, keeps your drinks at the perfect temperature for hours.
              </p>
            </div>

            <div className="space-y-4">
              
              
              <Link to={'/category/corporate'} className="px-8 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors shadow-lg">
                Claim Reward
              </Link>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="space-y-2">
                {[
                  "✓ Insulated stainless steel",
                  "✓ Leak-proof design",
                  "✓ BPA-free materials"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    {item}
                  </div>
                ))}
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
                src={waterBottle} 
                alt="Water Bottle" 
                className="w-full max-w-md mx-auto transform -rotate-6"
              />
            </div>
            
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-500 to-cyan-400 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
              BESTSELLER
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Reward;