import { Divider, Input } from "antd";
import _ from "lodash";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ImageHelper } from "../helper/ImageHelper";
import "./quickaccess.css";

const QuickAccess = () => {
  const navigation = useNavigate();
  // const { menu } = useSelector((state) => state.publicSlice);
  const items = [
    "SIGNAGES",
    "PREMIUM GIFTS",
    "CORPORATE GIFTS",
    "CUSTOMIZED BAGS",
    "ID CARDS & LAYARDS",
    "BUSINESS CARDS",
    "WALL FRAMES",
    "CALENDERS & DIARIES",
    "STANDEES",
    "LABELS & STICKERS",
    "MUG PRINTING",
    "BROCHURES",
    "DIGITAL DISPLAY",
    "FLYERS",
    "PREMIUM BOXES",
  ];

  return (
    <div>
      <div className="lg:py-10 pb-0">
        {/* <Divider className="!pb-4">
          <h1 className="text-center lg:text-2xl font-bold text-primary  ">Fast Track to Our Products!</h1>
        </Divider> */}
        {/* <div className="flex-wrap gap-x-2 gap-y-4 lg:justify-start justify-center flex">
          {menu.map((result, index) => {
            return (
              <>
                <span
                  key={index}
                  className="hover:text-primary !text-sm  capitalize cursor-pointer"
                  onClick={() => {
                    navigation(`/category/${_.get(result, "main_category_name", "")}/${_.get(result, "_id", "")}`);
                  }}
                >
                  {_.get(result, "main_category_name", "")} <Divider type="vertical" />
                </span>
                {_.get(result, "sub_categories_details", []).map((side_subcat, index) => {
                  return (
                    <>
                      <span
                        key={index}
                        className="hover:text-primary !text-sm capitalize  cursor-pointer"
                        onClick={() => {
                          navigation(`/category/${_.get(result, "main_category_name", "")}/${_.get(side_subcat, "sub_category_name", "")}/${_.get(result, "_id", "")}/${_.get(side_subcat, "_id", "")}`);
                        }}
                      >
                        {String(_.get(side_subcat, "sub_category_name", "")).toLowerCase()}
                        <Divider type="vertical" />
                      </span>
                      {_.get(result, "product_details", []).map((product, index) => {
                        return (
                          <span
                            key={index}
                            className="hover:text-primary !text-sm capitalize  cursor-pointer"
                            onClick={() => {
                              navigation(`/product/${_.get(product, "seo_url", "")}`);
                            }}
                          >
                            {_.get(product, "name", "")}
                            <Divider type="vertical" />
                          </span>
                        );
                      })}
                    </>
                  );
                })}
              </>
            );
          })}
        </div> */}
        <div className="scrolling-banner-container">
          {/* Top scrolling layer */}
          <div className="scrolling-layer top-layer">
            <div className="scrolling-content">
              {[...items, ...items].map((item, index) => (
                <React.Fragment key={index}>
                  <span className="scrolling-item">{item}</span>
                  <span className="separator">•</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Bottom scrolling layer */}
          <div className="scrolling-layer bottom-layer">
            <div className="scrolling-content reverse">
              {[...items, ...items].map((item, index) => (
                <React.Fragment key={index}>
                  <span className="scrolling-item">{item}</span>
                  <span className="separator">•</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        {/* <div className="lg:px-20 px-2 pb-10">
          <WGDesigns />
        </div> */}
      </div>
    </div>
  );
};

export default QuickAccess;


import { motion, useMotionValue, useTransform } from 'framer-motion';
import { FaGlobe, FaPiggyBank, FaHeadset, FaMoneyBillWave, FaGift, FaHandsHelping } from 'react-icons/fa';
import { useState } from 'react';

const FeatureCard = ({ feature, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = feature.icon;
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.08,
        ease: [0.34, 1.56, 0.64, 1]
      }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
      className="group cursor-pointer"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative h-full"
      >
        {/* Main Card */}
        <div 
          className="relative h-full rounded-3xl p-8 transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, ${feature.gradientStart}, ${feature.gradientEnd})`,
            transform: "translateZ(0px)",
            boxShadow: isHovered 
              ? `0 30px 60px -12px ${feature.shadowColor}` 
              : `0 10px 30px -10px ${feature.shadowColor}`,
          }}
        >
          {/* Floating Elements */}
          <motion.div
            className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20"
            style={{
              background: feature.accentColor,
              transform: "translateZ(20px)",
            }}
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div
            className="absolute bottom-8 left-8 w-16 h-16 rounded-full opacity-10"
            style={{
              background: feature.accentColor,
              transform: "translateZ(15px)",
            }}
            animate={{
              y: [0, 10, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          {/* Icon Container with 3D Effect */}
          <motion.div
            style={{
              transform: "translateZ(50px)",
            }}
            className="relative mb-6"
          >
            <motion.div
              animate={{
                rotate: isHovered ? 360 : 0,
              }}
              transition={{ duration: 0.6 }}
              className="relative inline-flex"
            >
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{
                  background: feature.accentColor,
                }}
              >
                <Icon className="text-3xl text-white" />
              </div>
              
              {/* Glow Effect */}
              <div 
                className="absolute inset-0 rounded-2xl blur-xl opacity-60"
                style={{
                  background: feature.accentColor,
                }}
              />
            </motion.div>
          </motion.div>

          {/* Content */}
          <div style={{ transform: "translateZ(30px)" }}>
            <motion.div
              animate={{
                x: isHovered ? 5 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                {feature.title}
              </h3>
            </motion.div>
            
            <motion.p 
              className="text-white/80 leading-relaxed mb-6"
              animate={{
                opacity: isHovered ? 1 : 0.8,
              }}
            >
              {feature.description}
            </motion.p>

            {/* Animated Badge */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: "auto", opacity: 1 }}
              transition={{ delay: index * 0.08 + 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm"
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ background: feature.accentColor }}
              />
              <span className="text-sm font-semibold text-white tracking-wide">
                {feature.tag}
              </span>
            </motion.div>
          </div>

          {/* Corner Accent */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10"
            style={{
              background: feature.accentColor,
              transform: "translateZ(5px)",
            }}
          />
        </div>

        {/* 3D Shadow Layer */}
        <div 
          className="absolute inset-0 rounded-3xl -z-10"
          style={{
            background: `linear-gradient(135deg, ${feature.gradientStart}, ${feature.gradientEnd})`,
            transform: "translateZ(-20px)",
            opacity: 0.3,
            filter: "blur(20px)",
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export const WGDesigns = () => {
  const features = [
    {
      icon: FaGlobe,
      title: "Shop Worldwide",
      tag: "GLOBAL REACH",
      description: "Access our products from anywhere in the world with fast international shipping options.",
      gradientStart: "#667eea",
      gradientEnd: "#764ba2",
      accentColor: "#f093fb",
      shadowColor: "rgba(102, 126, 234, 0.4)",
    },
    {
      icon: FaPiggyBank,
      title: "Big Saving Shop",
      tag: "VALUE DEALS",
      description: "Enjoy massive discounts and special offers on our premium product range throughout the year.",
      gradientStart: "#f093fb",
      gradientEnd: "#f5576c",
      accentColor: "#feca57",
      shadowColor: "rgba(240, 147, 251, 0.4)",
    },
    {
      icon: FaHeadset,
      title: "Customer Support",
      tag: "24/7 AVAILABLE",
      description: "Our customer service team is available round the clock to assist with any queries or issues.",
      gradientStart: "#4facfe",
      gradientEnd: "#00f2fe",
      accentColor: "#a8edea",
      shadowColor: "rgba(79, 172, 254, 0.4)",
    },
    {
      icon: FaMoneyBillWave,
      title: "Money Back Guarantee",
      tag: "RISK-FREE",
      description: "Not satisfied? Get a full refund within 30 days with our no-questions-asked policy.",
      gradientStart: "#43e97b",
      gradientEnd: "#38f9d7",
      accentColor: "#fee140",
      shadowColor: "rgba(67, 233, 123, 0.4)",
    },
    {
      icon: FaGift,
      title: "Personalized Gift",
      tag: "UNIQUE TOUCH",
      description: "Customize your products with names, messages, or special designs for that perfect personal touch.",
      gradientStart: "#fa709a",
      gradientEnd: "#fee140",
      accentColor: "#ffd89b",
      shadowColor: "rgba(250, 112, 154, 0.4)",
    },
    {
      icon: FaHandsHelping,
      title: "Free Consultancy",
      tag: "EXPERT ADVICE",
      description: "Get professional design advice and recommendations from our experienced team at no extra cost.",
      gradientStart: "#30cfd0",
      gradientEnd: "#330867",
      accentColor: "#a8edea",
      shadowColor: "rgba(48, 207, 208, 0.4)",
    },
  ];

  return (
    <div className="relative bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] py-24 px-6 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-20 right-20 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(240,147,251,0.08) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <span className="text-sm font-semibold text-white/80 tracking-widest uppercase">
                Why Choose Us
              </span>
            </div>
          </motion.div>

          <h2 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Experience the
            <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#4facfe]">
              Difference
            </span>
          </h2>

          <p className="text-xl text-white/70 max-w-2xl mx-auto font-light">
            Six exceptional features designed to elevate your shopping experience
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        
      </div>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
        * {
          font-family: 'Outfit', sans-serif;
        }
      `}</style>
    </div>
  );
};


