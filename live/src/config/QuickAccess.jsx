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
        <div className="lg:px-20 px-2 pb-10">
          <WGDesigns />
        </div>
      </div>
    </div>
  );
};

export default QuickAccess;

import {
  FaGlobe,
  FaPiggyBank,
  FaHeadset,
  FaMoneyBillWave,
  FaGift,
  FaHandsHelping,
  FaThumbsUp,
} from "react-icons/fa";
import { motion } from "motion/react";

export const WGDesigns = () => {
  return (
    <div className="max-w-full mx-auto p-6 font-sans policy_section">
      {/* Two Column Layout */}
      <div className="flex flex-col gap-4  justify-center lg:justify-between items-center  w-full">
        <div className="flex lg:flex-row flex-col items-center justify-between w-[100%] lg:w-[90%] mx-auto">
          {/* Shop Worldwide */}
          <motion.div 
            initial={{
                opacity: 0,
                x:  -100 ,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.8,
                  ease: "easeOut",
                },
              }}
          className="w-[350px]  p-6 rounded-lg  transition-shadow">
            <div className="flex items-center mb-4">
              <FaGlobe className="text-4xl text-blue-600 mr-4" />
              <h2 className="text-lg lg:text-2xl font-semibold text-[#f9c114]">
               Shop Worldwide
              </h2>
            </div>
            <div className="mb-3">
              <span className="font-bold text-[#987c34] lg:text-md text-sm">GLOBAL REACH</span>
            </div>
            <p className="text-gray-600 lg:text-md text-sm">
              Access our products from anywhere in the world with fast
              international shipping options.
            </p>
          </motion.div>
          <motion.div 
          initial={{
                opacity: 0,
                x:  100 ,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.8,
                  ease: "easeOut",
                },
              }}
          className="w-[350px]  p-6 rounded-lg  transition-shadow">
            <div className="flex items-center mb-4">
              <FaPiggyBank className="text-4xl text-green-600 mr-4" />
              <h2 className="text-lg lg:text-2xl font-semibold text-[#f9c114]">
                Big Saving Shop
              </h2>
            </div>
            <div className="mb-3">
              <span className="font-bold text-[#987c34] lg:text-md text-sm">VALUE DEALS</span>
            </div>
            <p className="text-gray-600 lg:text-md text-sm">
              Enjoy massive discounts and special offers on our premium product
              range throughout the year.
            </p>
          </motion.div>
        </div>

        <div className="flex lg:flex-row flex-col items-center  justify-between w-[100%] mx-auto">
          {/* 24/7 Support */}
          <motion.div
          initial={{
                opacity: 0,
                x:  -100 ,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.8,
                  ease: "easeOut",
                  delay:0.3

                },
              }}
          className="w-[350px]  p-6 rounded-lg  transition-shadow">
            <div className="flex  items-center mb-4">
              <FaHeadset className="text-3xl text-purple-600 mr-4" />
              <h2 className="text-lg lg:text-2xl font-semibold text-[#f9c114]">
                24/7 Support
              </h2>
            </div>
            <div className="mb-3">
              <span className="font-bold text-[#987c34] lg:text-md text-sm">ALWAYS AVAILABLE</span>
            </div>
            <p className="text-gray-600 lg:text-md text-sm">
              Our customer service team is available round the clock to assist
              with any queries or issues.
            </p>
          </motion.div>

          {/* Money Back Guarantee */}
          
          <motion.div 
          initial={{
                opacity: 0,
                x:  100 ,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.8,
                  ease: "easeOut",
                  delay:0.3

                },
              }} 
          className="w-[350px]  p-6 rounded-lg  transition-shadow">
            <div 
             className="flex items-center mb-4">
              <FaMoneyBillWave className="text-3xl text-yellow-600 mr-4" />
              <h2 className="text-lg lg:text-2xl font-semibold text-[#f9c114]">
                Money Back Guarantee
              </h2>
            </div>
            <div className="mb-3">
              <span className="font-bold text-[#987c34] lg:text-md text-sm">RISK-FREE</span>
            </div>
            <p className="text-gray-600 lg:text-md text-sm">
              Not satisfied? Get a full refund within 30 days with our
              no-questions-asked policy.
            </p>
          </motion.div>
        
        </div>
        <div className="flex lg:flex-row flex-col items-center justify-between w-[100%] mx-auto">
          {/* Personalized Gift */}          
          <motion.div
          initial={{
                opacity: 0,
                x:  -100 ,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.8,
                  ease: "easeOut",
                  delay:0.5

                },
              }}
           className="w-[350px]  p-6 rounded-lg  transition-shadow">
            <div className="flex items-center mb-4">
              <FaGift className="text-3xl text-red-600 mr-4" />
              <h2 className="text-lg lg:text-2xl font-semibold text-[#f9c114]">
                Personalized Gift
              </h2>
            </div>
            <div className="mb-3">
              <span className="font-bold text-[#987c34] lg:text-md text-sm">UNIQUE TOUCH</span>
            </div>
            <p className="text-gray-600 lg:text-md text-sm">
              Customize your products with names, messages, or special designs
              for that perfect personal touch.
            </p>
          </motion.div>

          {/* Free Consultancy */}
          <motion.div
          initial={{
                opacity: 0,
                x:  100 ,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.8,
                  ease: "easeOut",
                  delay:0.5
                },
              }}
          className="w-[350px]  p-6 rounded-lg  transition-shadow">
            <div className="flex items-center mb-4">
              <FaHandsHelping className="text-3xl text-teal-600 mr-4" />
              <h2 className="text-lg lg:text-2xl font-semibold text-[#f9c114]">
                Free Consultancy
              </h2>
            </div>
            <div className="mb-3">
              <span className="font-bold text-[#987c34] lg:text-md text-sm">EXPERT ADVICE</span>
            </div>
            <p className="text-gray-600 lg:text-md text-sm">
              Get professional design advice and recommendations from our
              experienced team at no extra cost.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
