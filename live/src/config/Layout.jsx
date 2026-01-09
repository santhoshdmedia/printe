/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Nav/Navbar.jsx";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useHref } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ImageHelper } from "../helper/ImageHelper";
import QuickAccess from "./QuickAccess";
import NavMenu from "../components/Nav/NavMenu.jsx";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider, useGoogleOneTapLogin } from '@react-oauth/google';
import { handleGoogleLoginSuccess } from "../utils/googleAuthHelper";

// Google Client ID
const GOOGLE_CLIENT_ID = "323773820042-ube4qhfaig1dbrgvl85gchkrlvphnlv9.apps.googleusercontent.com";

// Inner Layout Component with Google One Tap
const LayoutContent = () => {
  const [showIcon, setShowIcon] = useState(false);
  const path = useHref();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Redux - adjust this according to your Redux structure
  const { isAuth } = useSelector((state) => state.authSlice || { isAuth: false });
  
  // Excluded paths where One Tap should not appear
  const excludedPaths = ['/login', '/sign-up', '/forget-password', '/reset-password'];
  const isExcludedPath = excludedPaths.some(path => location.pathname.includes(path));

  // Google One Tap Login - Only show when user is NOT logged in and NOT on login pages
  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      console.log("🔵 Google One Tap triggered - User clicked");
      await handleGoogleLoginSuccess(
        credentialResponse,
        dispatch,
        navigate,
        (error) => console.error("One Tap Error:", error)
      );
    },
    onError: () => {
      console.log("❌ Google One Tap Login Failed");
    },
    // Only enable One Tap when user is not authenticated and not on excluded paths
    disabled: isAuth || isExcludedPath,
    // Auto-select if user has one Google account
    auto_select: false, // Set to false for better UX, true for auto-login
    // Cancel on tap outside
    cancel_on_tap_outside: true,
    // Use moment notification
    use_fedcm_for_prompt: true,
  });

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
    <div className={`w-full mx-auto !transition-all !duration-700`}>
      <div className="sticky top-0 z-[999] w-full overflow-hidden bg-[#f5f5f5] p-2">
        <div className="scrolling-text-container">
          <div className="scrolling-text !font-[300] whitespace-nowrap">
            Premium Roll-Up Standee for just ₹1030 – limited stock, order today!
          </div>
        </div>
      </div>
   
      <div className="sticky top-[40px] z-[999] w-full">
        <Navbar />
      </div>
      <div className="sticky top-[50px] z-[20]">
        <NavMenu />
      </div>

      <div className="lg:pt-0 pt-10 overflow-x-hidden max-w-[2000px] mx-auto">
        <Outlet />
      </div>
      
      <div
        className={`${
          showIcon ? "" : "hidden"
        } fixed bottom-20 right-[4.5rem] cursor-pointer z-50`}
      >
        <div
          className={`transition-all transition-500 sticky bottom-24 !left-[90%] cursor-pointer z-50 rounded-full lg:p-4 p-3`}
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
        } !sticky bottom-20 right-40 cursor-pointer z-50`}
      >
        <div
          className={`${
            showIcon ? "" : "hidden"
          } fixed bottom-8 right-20 cursor-pointer z-50 bg-green-500 rounded-full lg:p-4 p-3`}
        >
          <a
            href="https://wa.me/919585610000?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={ImageHelper.WHATSAPP_IMG}
              alt="WhatsApp Icon"
              className="w-7 h-7"
            />
          </a>
        </div>
      </div>
     
      <Footer />

      {/* React Hot Toast Configuration - Fixed z-index */}
      <Toaster
        position="top-right"
        reverseOrder={true}
        containerStyle={{
          position: "fixed",
          top: "400px",
          right: "20px",
          zIndex: 1000,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#28aa59",
            color: "#fff",
            zIndex: 1001,
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

        /* Google One Tap container styling */
        #credential_picker_container {
          position: fixed !important;
          top: 100px !important;
          right: 20px !important;
          z-index: 10000 !important;
        }
      `}</style>
    </div>
  );
};

// Main Layout Component wrapped with GoogleOAuthProvider
const Layout = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LayoutContent />
    </GoogleOAuthProvider>
  );
};

export default Layout;