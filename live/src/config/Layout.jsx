/* eslint-disable no-unused-vars */
import React,{useEffect, useState} from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Nav/Navbar";
import { Outlet } from "react-router-dom";
import { useHref } from "react-router-dom";
import { ImageHelper } from "../helper/ImageHelper";
import QuickAccess from "./QuickAccess";
import NavMenu from "../components/Nav/NavMenu.jsx";

const Layout = () => {
  const [showIcon,setShowIcon]=useState(false)
  const path = useHref();
  // bg-gradient-to-b from-slate-50 via-pink-100 to-sky-300
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

 useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 700) {
        setShowIcon(true);
      } else {
        setShowIcon(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array means this runs only once on mount
  return (
    <div className={` w-full mx-auto !transition-all !duration-700 `}>
      <div className="fixed top-0 left-0 -z-10 h-[100vh] w-full">
        <div 
          className="absolute inset-0 h-full w-full bg-gradient-to-b from-white to-[#FFF9C7]"
          aria-hidden="true"
        />
      </div>
      <div className="sticky top-0 z-[999] w-full">
        <Navbar />
      </div>
      <div className="sticky top-[80px] z-[20]">

      <NavMenu />
      </div>

      <div className="lg:pt-0 pt-10 overflow-x-hidden">
        <Outlet />
      </div>

      <Footer />
      <div className={`${showIcon?"":"hidden"} fixed bottom-8 right-8 cursor-pointer z-50 bg-green-500 rounded-full lg:p-4 p-3`} >
        <a
          href="https://wa.me/919789583097?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F"
          target="_blank"
          rel="noopener noreferrer "
        >
          <img
            src={ImageHelper.WHATSAPP_IMG}
            alt="WhatsApp Icon"
            className="w-7 h-7  "
          />
        </a>
      </div>
      
      <div className={`${showIcon?"":"hidden"}  transition-all transition-500  fixed bottom-24 right-6 cursor-pointer z-50   rounded-full lg:p-4 p-3`}>
       
          <span className=""><ImageHelper.UP_arrow className="text-yellow-400 text-5xl hover:animate-bounce"onClick={scrollToTop}/></span>
          
      </div>
    </div>
  );
};

export default Layout;
