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
import pongal from "../assets/Pongal/PONGAL.png"

// Google Client ID
const GOOGLE_CLIENT_ID = "323773820042-ube4qhfaig1dbrgvl85gchkrlvphnlv9.apps.googleusercontent.com";

// Inner Layout Component with Google One Tap
const LayoutContent = () => {
  const [showIcon, setShowIcon] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const path = useHref();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Redux - adjust this according to your Redux structure
  const { isAuth } = useSelector((state) => state.authSlice || { isAuth: false });
  
  // Excluded paths where One Tap should not appear
  const excludedPaths = ['/login', '/sign-up', '/forget-password', '/reset-password'];
  const isExcludedPath = excludedPaths.some(path => location.pathname.includes(path));

  // Show greeting popup every 1 minute if user is not logged in
  useEffect(() => {
    if (!isAuth) {
      const timer = setInterval(() => {
        setShowGreeting(true);
      }, 600000); // 1 minute = 60000ms

      return () => clearInterval(timer);
    }
  }, [isAuth]);

  // Close greeting popup
  const closeGreeting = () => {
    setShowGreeting(false);
  };

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
      // Calculate scroll progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(scrollPercent);

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
           Limited Time! Pongal Offer 70% OFF on Customized QR Stands
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
      
      {/* Enhanced Back to Top Button with Progress Circle */}
      <div
        className={`${
          showIcon ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        } fixed bottom-28 right-20 cursor-pointer z-50 transition-all duration-300`}
      >
        <div
          className="relative group"
          onClick={scrollToTop}
        >
          {/* Progress Circle */}
          <svg className="w-14 h-14 transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="24"
              stroke="#e5e7eb"
              strokeWidth="3"
              fill="none"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              stroke="#facc15"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`}
              className="transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          
          {/* Icon in Center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ImageHelper.UP_arrow
              className="text-yellow-400 text-3xl group-hover:animate-bounce transition-all"
            />
          </div>
          
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
        </div>
      </div>
      
      {/* <div>
        <div
          className={`fixed bottom-0 -Left-8 cursor-pointer z-50 rounded-full lg:p-4 p-3`}
        >
          <img
            src={pongal}
            alt="Pongal"
            className="w-40 h-52"
          />
        </div>
      </div> */}
      
      {/* Enhanced WhatsApp Button with Glow Animation */}
      <div
        className={`${
          showIcon ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        } fixed bottom-8 right-20 cursor-pointer z-50 transition-all duration-300`}
      >
        <div className="relative group">
          {/* Animated glow rings */}
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
          <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse opacity-50"></div>
          
          {/* Main button with enhanced glow */}
          <a
            href="https://wa.me/919585610000?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="relative block bg-green-500 rounded-full lg:p-4 p-3 shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-green-300 rounded-full opacity-0 group-hover:opacity-60 blur-md transition-opacity duration-300"></div>
            
            <img
              src={ImageHelper.WHATSAPP_IMG}
              alt="WhatsApp Icon"
              className="w-7 h-7 relative z-10"
            />
          </a>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Chat with us!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>

      {/* Pongal Greeting Popup */}
      {showGreeting && !isAuth && (
        <div className="fixed bottom-8 left-8 z-[9999] animate-slideIn">
          <div className="bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 rounded-2xl shadow-2xl p-6 max-w-sm relative">
            {/* Close Button */}
            <button
              onClick={closeGreeting}
              className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Content */}
            <div className="text-center">
              <div className="text-5xl mb-3">🌾🎉</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Happy Pongal!
              </h3>
              <p className="text-white/90 mb-4 text-sm">
                Wishing you prosperity and joy this harvest season! May your life be filled with abundance and happiness.
              </p>
              <button
                onClick={() => navigate('/sign-up')}
                className="bg-white text-orange-600 font-semibold px-6 py-2 rounded-full hover:bg-orange-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Join Us Today
              </button>
            </div>
          </div>
        </div>
      )}
     
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

        /* Slide in animation for greeting popup */
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }

        /* Ping animation for WhatsApp button */
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* Pulse animation */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

const Layout = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LayoutContent />
    </GoogleOAuthProvider>
  );
};

export default Layout;