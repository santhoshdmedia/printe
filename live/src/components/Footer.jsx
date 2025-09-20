/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { footerItems } from "../../data";
import { IoCallOutline } from "react-icons/io5";
import { CiMail } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitterSquare, FaArrowRight } from "react-icons/fa";
import moment from "moment";
import Logo from "../assets/logo/without_bg.png";
import Gpay from "../assets/payment/gpay.svg";
import Phonepay from "../assets/payment/phone-pay.svg";
import Paytm from "../assets/payment/paytm.svg";
import Bhimupi from "../assets/payment/bhim-upi.svg";
import Master from "../assets/payment/mastercard.svg";
import Mastro from "../assets/payment/mastro.svg";
import visaelectron from "../assets/payment/visa-electron.svg";
import visa from "../assets/payment/visa.svg";

const Footer = () => {
  const navigate = useNavigate();

  const handleMove = (res) => {
    navigate(`${res.link}`);
  };

  return (
    <div className="pt-16 bg-gray-950 text-white relative  !font-primary">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f2c41a] to-transparent"></div>
      <div className="absolute top-10 left-0 w-40 h-40 rounded-full bg-[#f2c41a] opacity-5 -translate-x-20"></div>
      
      {/* Logo container */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#f2c41a] rounded-lg shadow-lg p-3 border border-gray-800 transform hover:scale-105 transition-transform duration-300 group">
        <Link to="/" className="font-bold text-xl rounded uppercase cursor-pointer">
          <div className="flex flex-row items-center justify-center p-1">
            <img src={Logo} alt="Printe Logo" className="w-auto h-12 bg-center bg-cover group-hover:brightness-110 transition-all" />
          </div>
        </Link>
      </div>
      
      {/* Main footer content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 px-[6vw] md:px-[8vw] xl:px-[10vw] items-start py-12 relative z-10">
        {footerItems.map((data, index) => {
          return (
            <ul key={index} className="space-y-4">
              <li className="text-lg font-semibold text-[#f2c41a] flex items-center">
                {data.title}
                <div className="w-8 h-0.5 bg-[#f2c41a] ml-2"></div>
              </li>
              {data.sub.map((items, subIndex) => {
                return (
                  <li key={subIndex} className="cursor-pointer group/item">
                    <div 
                      onClick={() => handleMove(items)} 
                      className={`flex items-center text-gray-400 hover:text-[#f2c41a] w-fit !text-sm transition-all duration-200 ${items.link === location.pathname ? "text-[#f2c41a] font-medium" : ""}`}
                    >
                      <FaArrowRight size={10} className="mr-2 text-[#f2c41a] opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      {items.value}
                    </div>
                  </li>
                );
              })}
            </ul>
          );
        })}

        {/* Contact section */}
        <div className="lg:col-span-1">
          <h1 className="text-lg font-semibold text-[#f2c41a] flex items-center pb-4">
            Contact Us
            <div className="w-8 h-0.5 bg-[#f2c41a] ml-2"></div>
          </h1>
          <ul className="flex text-gray-400 justify-start items-start flex-col gap-5">
            <li className="flex justify-start items-center gap-3 transition-all duration-200 hover:text-[#f2c41a] group">
              <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-[#f2c41a] transition-colors duration-300">
                <IoCallOutline size={16} className="text-[#f2c41a] group-hover:text-gray-900 transition-colors duration-300" />
              </div>
              <span><a href="tel:+919585610000" className="hover:text-[#f2c41a]">+91 95856 10000</a></span>
            </li>
            <li className="flex justify-start items-center gap-3 transition-all duration-200 hover:text-[#f2c41a] group">
              <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-[#f2c41a] transition-colors duration-300">
                <CiMail size={16} className="text-[#f2c41a] group-hover:text-gray-900 transition-colors duration-300" />
              </div>
              <span><a href="mailto:info@printe.in" className="hover:text-[#f2c41a]">info@printe.in</a></span>
            </li>
            <li className="flex flex-col justify-start items-start gap-3 mt-2">
              <span className="text-[#f2c41a] font-medium">Follow us</span>
              <ul className="flex gap-3 mt-1">
                <li>
                  <Link 
                    to={'https://www.facebook.com/profile.php?id=61578118705571&sk=about'} 
                    target="_blank"
                    className="flex items-center justify-center p-2 bg-gray-800 rounded-lg hover:bg-[#f2c41a] transition-all duration-300 group"
                  >
                    <FaFacebook size={18} className="text-[#f2c41a] group-hover:text-gray-900 transition-colors duration-300" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to={'https://www.instagram.com/the.printe/'} 
                    target="_blank"
                    className="flex items-center justify-center p-2 bg-gray-800 rounded-lg hover:bg-[#f2c41a] transition-all duration-300 group"
                  >
                    <FaInstagram size={18} className="text-[#f2c41a] group-hover:text-gray-900 transition-colors duration-300" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to={'#'} 
                    target="_blank"
                    className="flex items-center justify-center p-2 bg-gray-800 rounded-lg hover:bg-[#f2c41a] transition-all duration-300 group"
                  >
                    <FaTwitterSquare size={18} className="text-[#f2c41a] group-hover:text-gray-900 transition-colors duration-300" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to={'#'} 
                    target="_blank"
                    className="flex items-center justify-center p-2 bg-gray-800 rounded-lg hover:bg-[#f2c41a] transition-all duration-300 group"
                  >
                    <FaLinkedin size={18} className="text-[#f2c41a] group-hover:text-gray-900 transition-colors duration-300" />
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      {/* Newsletter subscription */}
      <div className="px-[6vw] md:px-[8vw] xl:px-[10vw] py-8 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#f2c41a] mb-2">Trust & Security Focused</h3>
            <p className="text-gray-400 text-sm">Your security is encrypted in every transaction. We use advanced protection to keep your payments safe.</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#f2c41a] mb-2">100% SECURE PAYMENTS</h3>
            <div className="flex gap-2">
              <div className="">
                <img src={Gpay} alt="Gpay" />
              </div>
              <div className="">
                <img src={Phonepay} alt="Phonepay" />
              </div>
              <div className="">
                <img src={Paytm} alt="Paytm" />
              </div>
              <div className="">
                <img src={Bhimupi} alt="Bhim UPI" />
              </div>
              <div className="">
                <img src={visa} alt="visa" />
              </div>
              <div className="">
                <img src={visaelectron} alt="visa Electron" />
              </div>
              <div className="">
                <img src={Mastro} alt="Mastro" />
              </div>
              <div className="">
                <img src={Master} alt="Master" />
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 border-t border-gray-800 bg-gray-900 font-primary flex flex-col md:flex-row justify-between items-center py-6 px-[6vw] md:px-[8vw] xl:px-[10vw]">
        <span className="text-sm text-center text-gray-400 order-2 md:order-1">
          © {moment().format("YYYY")} <a href="https://dmedia.in/" className="hover:text-[#f2c41a]">Dmedia</a>. All Rights Reserved.
        </span>
        <div className="flex gap-6 mb-4 md:mb-0 order-1 md:order-2">
          <Link to="#" className="text-gray-400 hover:text-[#f2c41a] text-sm transition-colors">Privacy Policy</Link>
          <Link to="#" className="text-gray-400 hover:text-[#f2c41a] text-sm transition-colors">Terms of Service</Link>
          <Link to="#" className="text-gray-400 hover:text-[#f2c41a] text-sm transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;  