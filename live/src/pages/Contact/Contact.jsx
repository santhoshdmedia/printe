import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuMail } from "react-icons/lu";
import { FiPhoneCall } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { FaHeadset, FaShippingFast, FaAward, FaClock, FaChevronDown } from "react-icons/fa";

const Contact = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  // Enhanced Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0, rotateX: 15 },
    visible: {
      scale: 1,
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.7,
        ease: "backOut"
      }
    },
    hover: {
      scale: 1.03,
      y: -12,
      rotateY: 5,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  const floatingAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const pulseGlow = {
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 0 rgba(242, 196, 26, 0.4)",
      "0 0 0 10px rgba(242, 196, 26, 0)",
      "0 0 0 0 rgba(242, 196, 26, 0)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const contactMethods = [
    {
      icon: <LuMail className="text-white" size={36} />,
      title: "E-mail us",
      description: "Sales enquiries and customer support",
      details: "info@printe.in",
      highlight: "text-gray-800 font-semibold text-lg hover:text-[#f2c41a] cursor-pointer transition-colors"
    },
    {
      icon: <FiPhoneCall className="text-white" size={36} />,
      title: "Call us for Queries",
      description: "Get immediate assistance",
      details: "+91 9585610000",
      timing: "(Mon-Sat: 10:00 AM - 7:00 PM)",
      highlight: "text-gray-800 font-semibold text-lg hover:text-[#f2c41a] cursor-pointer transition-colors"
    },
    {
      icon: <IoLocationOutline className="text-white" size={36} />,
      title: "Visit our Office",
      description: "Come see us in person",
      details: "No 8, Church Colony, Vayalur Main Road",
      address: "Trichy 620017, Tamilnadu, India",
      highlight: "text-gray-700"
    }
  ];

  const features = [
    {
      icon: <FaHeadset className="text-[#f2c41a]" size={28} />,
      title: "Expert Support",
      description: "Our printing specialists are ready to assist you with any project"
    },
    {
      icon: <FaShippingFast className="text-[#f2c41a]" size={28} />,
      title: "Fast Delivery",
      description: "Pan-India shipping with real-time tracking"
    },
    {
      icon: <FaAward className="text-[#f2c41a]" size={28} />,
      title: "Quality Guarantee",
      description: "100% satisfaction guarantee on all our products"
    },
    {
      icon: <FaClock className="text-[#f2c41a]" size={28} />,
      title: "Quick Turnaround",
      description: "Express printing options available for urgent needs"
    }
  ];

  const faqs = [
    {
      question: "What is your typical turnaround time?",
      answer: "Standard orders take 3-5 business days. Express options available in 24-48 hours."
    },
    {
      question: "Do you offer design services?",
      answer: "Yes! Our professional design team can help create or refine your print materials."
    },
    {
      question: "Can I get a sample before bulk order?",
      answer: "Absolutely! We provide samples for most products to ensure quality and satisfaction."
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        animate={floatingAnimation}
        className="absolute top-20 left-10 w-4 h-4 bg-[#f2c41a] rounded-full opacity-20"
      />
      <motion.div
        animate={{
          ...floatingAnimation,
          y: [0, -20, 0],
          transition: { ...floatingAnimation.transition, delay: 1 }
        }}
        className="absolute top-40 right-16 w-6 h-6 bg-[#f2c41a] rounded-full opacity-30"
      />
      <motion.div
        animate={{
          ...floatingAnimation,
          y: [0, -25, 0],
          transition: { ...floatingAnimation.transition, delay: 2 }
        }}
        className="absolute bottom-40 left-20 w-3 h-3 bg-[#f2c41a] rounded-full opacity-25"
      />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center mb-20 relative z-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          className="w-20 h-1 bg-[#f2c41a] mx-auto mb-6"
        />
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
        >
          Get in <span className="text-[#f2c41a]">Touch</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          We're here to help you with all your printing needs. Reach out to us through any of the following channels.
        </motion.p>
      </motion.div>

      {/* Contact Methods Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto mb-24 relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 cursor-pointer relative overflow-hidden group"
            >
              {/* Animated background effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#f2c41a] to-yellow-400 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
              />
              
              {/* Icon Container */}
              <motion.div
                whileHover={{ 
                  rotate: [0, -10, 10, 0],
                  transition: { duration: 0.5 }
                }}
                className="w-16 h-16 bg-gradient-to-br from-[#f2c41a] to-yellow-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
              >
                {method.icon}
              </motion.div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {method.title}
              </h3>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {method.description}
              </p>
              
              <p className={method.highlight}>
                {method.details}
              </p>
              
              {method.address && (
                <p className="text-gray-700 mt-2 leading-relaxed">
                  {method.address}
                </p>
              )}
              
              {method.timing && (
                <p className="text-gray-500 text-sm mt-2">
                  {method.timing}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-xl relative overflow-hidden group"
            >
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200 group-hover:border-[#f2c41a] transition-col duration-300">
                {feature.icon}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                {feature.title}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl p-10 shadow-2xl border border-gray-100 mb-20 relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-[#f2c41a] to-transparent w-1/3" />
          </div>
          
          <div className="text-center max-w-4xl mx-auto relative z-10">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold text-gray-900 mb-8"
            >
              Quick Response <span className="text-[#f2c41a]">Guaranteed</span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              We understand the importance of timely communication. Our dedicated team ensures 
              that all queries are addressed within 24 hours. For urgent matters, feel free to call us directly.
            </motion.p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { value: "24/7", label: "Email Support", color: "text-[#f2c41a]" },
                { value: "10 Hours", label: "Phone Support Daily", color: "text-[#f2c41a]" },
                { value: "1 Hour", label: "Quick Response Time", color: "text-[#f2c41a]" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.2, type: "spring" }}
                  className="p-6"
                >
                  <motion.div
                    className={`text-3xl font-bold ${stat.color} mb-3`}
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="bg-gradient-to-br from-[#f2c41a] to-yellow-500 rounded-2xl p-10 shadow-2xl border border-yellow-400 mb-16 relative overflow-hidden"
        >
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-4xl font-bold text-white text-center mb-12"
          >
            Frequently Asked <span className="text-gray-900">Questions</span>
          </motion.h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 overflow-hidden"
              >
                <motion.button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-white/10 transition-colors duration-300"
                  whileHover={{ x: 4 }}
                >
                  <span className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: activeFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <FaChevronDown className="text-white" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5">
                        <p className="text-gray-900 leading-relaxed font-medium">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Business Hours Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="bg-white rounded-2xl p-10 shadow-2xl border border-gray-100 mb-16"
        >
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-10">
              Business <span className="text-[#f2c41a]">Hours</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-2xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200"
              >
                <h4 className="text-xl font-semibold text-[#f2c41a] mb-5">Customer Support</h4>
                <div className="space-y-3 text-gray-700">
                  <p>Monday - Saturday: 10:00 AM - 7:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200"
              >
                <h4 className="text-xl font-semibold text-[#f2c41a] mb-5">Production Hours</h4>
                <div className="space-y-3 text-gray-700">
                  <p>Monday - Saturday: 9:00 AM - 8:00 PM</p>
                  <p>Sunday: Emergency orders only</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

 
    </div>
  );
};

export default Contact;