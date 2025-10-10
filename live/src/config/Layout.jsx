/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Nav/Navbar.jsx";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useHref } from "react-router-dom";
import { ImageHelper } from "../helper/ImageHelper";
import QuickAccess from "./QuickAccess";
import NavMenu from "../components/Nav/NavMenu.jsx";
import { Toaster } from "react-hot-toast";
import { BottomNavigation } from "../components/Nav/Navbar.jsx";

const Layout = () => {
  const [showIcon, setShowIcon] = useState(false);
  const path = useHref();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
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

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isProduct = ["product"].some((route) =>
    location.pathname.includes(route)
  );

  return (
    <div className={` w-full mx-auto !transition-all !duration-700 `}>
      {/* <div
        className={`fixed top-0 left-0 -z-10 h-[100vh] w-full  ${
          isProduct ? "hidden" : ""
        }`}
      >
        <div
          className="absolute inset-0 h-full w-full bg-gradient-to-b from-white to-[#FFF9C7] "
          aria-hidden="true"
        />
      </div> */}

      <div className="sticky top-0 z-[999] w-full overflow-hidden bg-[#f5f5f5] p-2">
        <div className="scrolling-text-container">
          <div className="scrolling-text !font-[300] whitespace-nowrap">
            ✨ Special Launch Offer – Flat 25% OFF on all items. Shop now and be
            part of our grand beginning!
          </div>
        </div>
      </div>

      <div className="sticky top-[40px] z-[999] w-full">
        <Navbar />
      </div>
      <div className="sticky top-[50px] z-[20]">
        <NavMenu />
      </div>

      <div className="lg:pt-0 pt-10 overflow-x-hidden max-w-[2000px] mx-auto ">
        <Outlet />
      </div>
         <div
        className={`${
          showIcon ? "" : "hidden"
        } sticky bottom-24 left-[89.1%] cursor-pointer z-50 w-fit !h-0 overflow-visible `}
      >
        <div
          className={` transition-all transition-500  sticky bottom-24 !left-[90%] cursor-pointer z-50   rounded-full lg:p-4 p-3`}
        >
          <span className="">
            <ImageHelper.UP_arrow
              className="text-yellow-400 text-5xl hover:animate-bounce"
              onClick={scrollToTop}
            />
          </span>
        </div>
      </div>
      <div
        className={`${
          showIcon ? "" : "hidden"
        } sticky bottom-8 left-[90%] cursor-pointer z-50 w-fit h-fit `}
      >
        <div
          className={`${
            showIcon ? "" : "hidden"
          } sticky bottom-8 right-8 cursor-pointer z-50 bg-green-500 rounded-full lg:p-4 p-3`}
        >
          <a
            href="https://wa.me/919585610000?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F"
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
      </div>
     
      <Footer />
      <div className="sticky bottom-[0px] z-[20]">
        <BottomNavigation />
      </div>
      
      {/* <div className="relative bottom-[90vh]">
        <BottomNavigation/>
      </div> */}

      {/* React Hot Toast Configuration - Fixed z-index */}
      <Toaster
        position="top-right"
        reverseOrder={true}
        containerStyle={{
          position: "fixed",
          top: "400px", // Adjust this value based on your navbar height
          right: "20px",
          zIndex: 1000, // Higher than navbar z-index (999)
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#28aa59",
            color: "#fff",
            zIndex: 1001, // Even higher than container
          },
          success: {
            duration: 3000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "#ff4d4f",
              color: "#fff",
              zIndex: 1001,
            },
          },
        }}
      />

      <style jsx>{`
        .scrolling-text-container {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .scrolling-text {
          display: inline-block;
          padding-left: 100%;
          animation: scroll 22s linear infinite;
          color: #000000;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
