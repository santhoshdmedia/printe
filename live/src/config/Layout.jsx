/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
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

const GOOGLE_CLIENT_ID = "323773820042-ube4qhfaig1dbrgvl85gchkrlvphnlv9.apps.googleusercontent.com";



/* ─────────────────────────────────────────────
   LAYOUT
   ───────────────────────────────────────────── */
const LayoutContent = () => {
  const [showIcon, setShowIcon] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showValentineBanner, setShowValentineBanner] = useState(true);


  const path = useHref();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuth } = useSelector((state) => state.authSlice || { isAuth: false });
  const excludedPaths = ['/login', '/sign-up', '/forget-password', '/reset-password'];
  const isExcludedPath = excludedPaths.some(p => location.pathname.includes(p));

  useEffect(() => {
    if (!isAuth) {
      const timer = setInterval(() => setShowGreeting(true), 600000);
      return () => clearInterval(timer);
    }
  }, [isAuth]);




  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      console.log("🔵 Google One Tap triggered");
      await handleGoogleLoginSuccess(credentialResponse, dispatch, navigate,
        (err) => console.error("One Tap Error:", err));
    },
    onError: () => console.log("❌ Google One Tap Login Failed"),
    disabled: isAuth || isExcludedPath,
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: true,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const handleScroll = () => {
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setScrollProgress(pct);
      setShowIcon(window.scrollY > 700);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full mx-auto !transition-all !duration-700">



      {/* ══════════════════════════════════════════════════
          SCROLLING PROMO STRIP
          ══════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-[999] w-full overflow-hidden valentine-strip">
        <div className="scrolling-text-container">
          <div className="scrolling-text valentine-strip__text whitespace-nowrap">
             Buy 2 Get upto 5%, Buy 3 Get upto 10%
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          NAV
          ══════════════════════════════════════════════════ */}
      <div className="sticky top-[40px] z-[999] w-full">
        <Navbar />
      </div>
      <div className="sticky top-[50px] z-[20]">
        <NavMenu />
      </div>

      {/* ══════════════════════════════════════════════════
          PAGE CONTENT
          ══════════════════════════════════════════════════ */}
      <div className="lg:pt-0 pt-10 overflow-x-hidden max-w-[2000px] mx-auto">
        <Outlet />
      </div>

      {/* ══════════════════════════════════════════════════
          BACK TO TOP
          ══════════════════════════════════════════════════ */}
      <div
        className={`${showIcon ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
          fixed bottom-28 right-20 cursor-pointer z-50 transition-all duration-300`}
      >
        <div className="relative group" onClick={scrollToTop}>
          <svg className="w-14 h-14 transform -rotate-90">
            <circle cx="28" cy="28" r="24" stroke="#e5e7eb" strokeWidth="3" fill="none" />
            <circle
              cx="28" cy="28" r="24" stroke="#facc15" strokeWidth="3" fill="none"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`}
              className="transition-all duration-300" strokeLinecap="round"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ImageHelper.UP_arrow className="text-yellow-400 text-3xl group-hover:animate-bounce transition-all" />
          </div>
          <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          WHATSAPP BUTTON
          ══════════════════════════════════════════════════ */}
      <div
        className={`${showIcon ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
          fixed bottom-8 right-20 cursor-pointer z-50 transition-all duration-300`}
      >
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
          <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse opacity-50" />
          <a
            href="https://wa.me/919585610000?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F"
            target="_blank" rel="noopener noreferrer"
            className="relative block bg-green-500 rounded-full lg:p-4 p-3 shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-green-300 rounded-full opacity-0 group-hover:opacity-60 blur-md transition-opacity duration-300" />
            <img src={ImageHelper.WHATSAPP_IMG} alt="WhatsApp Icon" className="w-7 h-7 relative z-10" />
          </a>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Chat with us!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
          </div>
        </div>
      </div>

      <Footer />

      {/* ══════════════════════════════════════════════════
          TOAST
          ══════════════════════════════════════════════════ */}
      <Toaster
        position="top-right" reverseOrder={true}
        containerStyle={{ position:"fixed", top:"400px", right:"20px", zIndex:1000 }}
        toastOptions={{
          duration: 4000,
          style: { background:"#28aa59", color:"#fff", zIndex:1001 },
          success: { duration:3000, theme:{ primary:"green", secondary:"black" } },
          error:   { duration:5000, style:{ background:"#ff4d4f", color:"#fff", zIndex:1001 } },
        }}
      />

      {/* ══════════════════════════════════════════════════
          STYLES
          ══════════════════════════════════════════════════ */}
      <style jsx>{`
        /* ─── scrolling strip ─── */
        .valentine-strip {
          background: linear-gradient(135deg, #fffbf0 0%, #fff3e0 45%, #fffbf0 100%);
          border-bottom: 1px solid rgba(202,138,4,0.18);
          padding: 0.5rem 0;
        }
        .scrolling-text-container { width:100%; overflow:hidden; }
        .scrolling-text {
          display: inline-block;
          padding-left: 100%;
          animation: scroll 34s linear infinite;
        }
        .valentine-strip__text {
          font-weight: 300;
          font-size: 0.88rem;
          letter-spacing: 0.05em;
          color: #92400e;
        }
        @keyframes scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ─── ORBS: slow drifting radial glows ─── */
        .v-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(38px);
          animation: orb-drift ease-in-out infinite alternate;
          will-change: transform;
        }
        @keyframes orb-drift {
          0%   { transform: translate(0px, 0px) scale(1);      }
          33%  { transform: translate(40px, -30px) scale(1.08); }
          66%  { transform: translate(-30px, 20px) scale(0.94); }
          100% { transform: translate(20px, 35px) scale(1.04);  }
        }

        /* ─── PETALS: abstract ovals drifting down ─── */
        .v-petal {
          position: absolute;
          top: -30px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(239,68,68,0.9)  0%,
            rgba(220,38,38,0.7) 40%,
            rgba(248,113,113,0.5) 100%
          );
          box-shadow: 0 2px 8px rgba(185,28,28,0.25);
          animation: petal-fall linear infinite;
          will-change: transform;
        }
        @keyframes petal-fall {
          0%   { transform: translateY(-40px)  translateX(0)                          rotate(0deg);   }
          20%  { transform: translateY(20vh)   translateX(var(--sway))                rotate(35deg);  }
          45%  { transform: translateY(45vh)   translateX(calc(var(--sway) * 0.3))    rotate(90deg);  }
          70%  { transform: translateY(72vh)   translateX(calc(var(--sway) * -0.5))   rotate(200deg); }
          100% { transform: translateY(108vh)  translateX(0)                          rotate(360deg); }
        }

        /* ─── SPARKLES: tiny ✦ fade in & out ─── */
        .v-sparkle {
          position: absolute;
          opacity: 0;
          animation: sparkle-flash ease-in-out infinite;
          will-change: opacity, transform;
        }
        @keyframes sparkle-flash {
          0%,  100% { opacity: 0;   transform: scale(0.4) rotate(0deg);   }
          15%       { opacity: 0;   transform: scale(0.4) rotate(0deg);   }
          35%       { opacity: 0.9; transform: scale(1)   rotate(20deg);  }
          55%       { opacity: 0.7; transform: scale(0.85) rotate(40deg); }
          75%       { opacity: 0;   transform: scale(0.3) rotate(60deg);  }
        }

        /* ─── FLOATING HEARTS: GRADIENT hearts rising from bottom ─── */
        .v-heart {
          position: absolute;
          bottom: -50px;
          opacity: 0;
          font-weight: bold;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 25%, #f87171 50%, #fca5a5 75%, #fee2e2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
          filter: drop-shadow(0 0 15px rgba(239,68,68,0.8)) 
                  drop-shadow(0 0 30px rgba(220,38,38,0.6)) 
                  drop-shadow(0 0 45px rgba(248,113,113,0.4))
                  drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          animation: heart-float linear infinite;
          will-change: transform, opacity;
        }
        @keyframes heart-float {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(0.4);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          20% {
            transform: translateY(-20vh) translateX(var(--drift)) rotate(10deg) scale(1.1);
            opacity: 1;
          }
          40% {
            transform: translateY(-40vh) translateX(calc(var(--drift) * -0.5)) rotate(-8deg) scale(1);
            opacity: 0.95;
          }
          60% {
            transform: translateY(-60vh) translateX(calc(var(--drift) * 0.3)) rotate(15deg) scale(0.85);
            opacity: 0.75;
          }
          80% {
            transform: translateY(-80vh) translateX(calc(var(--drift) * -0.2)) rotate(-5deg) scale(0.6);
            opacity: 0.5;
          }
          100% {
            transform: translateY(-110vh) translateX(0) rotate(0deg) scale(0.3);
            opacity: 0;
          }
        }

        /* ─── FLOATING YELLOW PARTICLES: small yellow dots floating from bottom to top ─── */
        .v-yellow-particle {
          position: absolute;
          bottom: -20px;
          border-radius: 50%;
          background: radial-gradient(circle, #fbbf24 0%, #fcd34d 50%, #fde68a 100%);
          box-shadow: 
            0 0 10px rgba(251,191,36,0.6),
            0 0 20px rgba(250,204,21,0.3);
          opacity: 0;
          animation: yellow-particle-float linear infinite;
          will-change: transform, opacity;
        }
        @keyframes yellow-particle-float {
          0% {
            transform: translateY(0) translateX(0) scale(0.3);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          50% {
            transform: translateY(-50vh) translateX(var(--drift)) scale(1);
            opacity: 0.8;
          }
          80% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-110vh) translateX(calc(var(--drift) * -0.5)) scale(0.5);
            opacity: 0;
          }
        }

        /* ─── ANIMATED RED ROSE IN BOTTOM LEFT ─── */
        .rose-container {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 25;
          pointer-events: none;
          transform: scale(0.7);
        }

        
   
        .leaves {
          position: relative;
          top: -354px;
          left: -6px;
        }
        .leaves > div:nth-last-child(1) {
          position: absolute;
          width: 55px;
          height: 30px;
          background: #22c55e;
          top: 120px;
          left: 75px;
          border-radius: 10px;
        }
        .leaves > div:nth-child(1) {
          position: absolute;
          width: 6px;
          height: 210px;
          background: #16a34a;
          top: 95px;
          left: 100px;
          border-radius: 0 0 100px 100px;
        }
        .leaves > div:nth-child(2) {
          position: absolute;
          width: 30px;
          height: 50px;
          top: 180px;
          left: 80px;
          border-radius: 5px 40px 20px 40px;
          background: #22c55e;
          transform-origin: bottom;
          transform: rotate(-30deg);
          box-shadow: inset 5px 5px #15803d;
        }
        .leaves > div:nth-child(3) {
          position: absolute;
          width: 30px;
          height: 50px;
          top: 150px;
          left: 95px;
          border-radius: 40px 5px 40px 20px;
          background: #22c55e;
          transform-origin: bottom;
          transform: rotate(30deg);
          box-shadow: inset -5px 5px #15803d;
        }

        .thorns {
          position: relative;
          top: -350px;
          left: -6px;
        }
        .thorns > div {
          position: absolute;
          width: 0;
          height: 0;
          top: 140px;
        }
        .thorns > div:nth-child(odd) {
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-left: 5px solid #15803d;
          left: 105px;
        }
        .thorns > div:nth-child(even) {
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-right: 5px solid #15803d;
          left: 95px;
        }
        .thorns > div:nth-child(1) {
          top: 200px;
        }
        .thorns > div:nth-child(2) {
          top: 170px;
        }
        .thorns > div:nth-child(4) {
          top: 230px;
        }

        .petals {
          position: relative;
          top: -335px;
          left: -6px;
        }
        .petals > div {
          position: absolute;
          background: #ef4444;
          width: 45px;
          height: 60px;
          top: 55px;
          transition: all 0.5s ease-out;
        }
        .petals > div:nth-child(1) {
          border-radius: 15px;
          left: 80px;
          top: 60px;
          box-shadow: 0px 0px 30px rgba(239, 68, 68, 1);
        }
        .petals > div:nth-child(2),
        .petals > div:nth-child(4),
        .petals > div:nth-child(6) {
          background: #dc2626;
          left: 60px;
          border-radius: 0px 30px 0px 30px;
          transform-origin: bottom right;
        }
        .petals > div:nth-child(3),
        .petals > div:nth-child(5),
        .petals > div:nth-child(7) {
          background: #dc2626;
          left: 100px;
          border-radius: 30px 0px 30px 0px;
          transform-origin: bottom left;
        }
        .petals > div:nth-child(2) {
          z-index: 5;
          background: #b91c1c;
          top: 75px;
          height: 60px;
          box-shadow: 0px 0px 50px rgba(239, 68, 68, .5);
          animation: bloom2 5s ease-in-out 5s;
          animation-fill-mode: forwards;
        }
        .petals > div:nth-child(3) {
          z-index: 4;
          background: #b91c1c;
          top: 75px;
          height: 60px;
          box-shadow: 0px 0px 50px rgba(239, 68, 68, .5);
          animation: bloom3 5s ease-in-out 23s;
          animation-fill-mode: forwards;
        }
        .petals > div:nth-child(4) {
          z-index: 3;
          background: #dc2626;
          top: 70px;
          height: 65px;
          box-shadow: 0px 0px 50px rgba(239, 68, 68, .5);
          animation: bloom4 3s ease-in-out infinite alternate, glowing 2.5s ease-in-out infinite;
          animation-fill-mode: forwards;
        }
        .petals > div:nth-child(5) {
          z-index: 2;
          background: #dc2626;
          top: 70px;
          height: 65px;
          box-shadow: 0px 0px 50px rgba(239, 68, 68, .5);
          animation: bloom5 3s ease-in-out infinite alternate, glowing 2.5s ease-in-out infinite;
          animation-fill-mode: forwards;
        }
        .petals > div:nth-child(6) {
          z-index: 1;
          background: #ef4444;
          top: 65px;
          height: 60px;
          box-shadow: 0px 0px 50px rgba(239, 68, 68, .3);
          animation: bloom6 3s ease-in-out infinite alternate, glowing 2.5s ease-in-out infinite;
          animation-fill-mode: forwards;
        }
        .petals > div:nth-child(7) {
          z-index: 0;
          background: #ef4444;
          top: 65px;
          height: 60px;
          box-shadow: 0px 0px 50px rgba(239, 68, 68, .3);
          animation: bloom7 3s ease-in-out infinite alternate, glowing 2.5s ease-in-out infinite;
          animation-fill-mode: forwards;
        }

        .deadPetals {
          position: relative;
          top: -350px;
          left: -6px;
        }
        .deadPetals > div {
          position: absolute;
          width: 20px;
          height: 15px;
          top: 120px;
          background: #ef4444;
          border-radius: 0px 30px 0px 30px;
          transform: rotate(-30deg);
          box-shadow: 0px 0px 30px rgba(239, 68, 68, .5);
        }
        .deadPetals > div:nth-child(1) {
          left: 85px;
          animation: falling 20s 4s ease-in-out infinite;
        }
        .deadPetals > div:nth-child(2) {
          left: 105px;
          animation: falling 20s 8s ease-in-out infinite;
        }
        .deadPetals > div:nth-child(3) {
          left: 75px;
          animation: falling 20s 12s ease-in-out infinite;
        }
        .deadPetals > div:nth-child(4) {
          left: 115px;
          animation: falling 20s 16s ease-in-out infinite;
        }

        .sparkles {
          position: relative;
        }
        .sparkles > div {
          position: absolute;
          z-index: 999;
          width: 2px;
          height: 2px;
          border-radius: 100px;
          background: #fde68a;
          box-shadow: 0px 0px 12px 2px #fbbf24;
          bottom: 0;
          opacity: 0;
        }
        .sparkles > div:nth-child(1) { left: 40px; animation: sparkle 10s ease-in-out 0.5s infinite; }
        .sparkles > div:nth-child(2) { left: 65px; animation: sparkle 10s ease-in-out 1s infinite; }
        .sparkles > div:nth-child(3) { left: 90px; animation: sparkle 10s ease-in-out 1.5s infinite; }
        .sparkles > div:nth-child(4) { left: 115px; animation: sparkle 10s ease-in-out 2s infinite; }
        .sparkles > div:nth-child(5) { left: 140px; animation: sparkle 10s ease-in-out 2.5s infinite; }
        .sparkles > div:nth-child(6) { left: 55px; animation: sparkle 10s ease-in-out 3s infinite; }
        .sparkles > div:nth-child(7) { left: 80px; animation: sparkle 10s ease-in-out 3.5s infinite; }
        .sparkles > div:nth-child(8) { left: 105px; animation: sparkle 10s ease-in-out 4s infinite; }
        .sparkles > div:nth-child(9) { left: 130px; animation: sparkle 10s ease-in-out 4.5s infinite; }
        .sparkles > div:nth-child(10) { left: 45px; animation: sparkle 10s ease-in-out 5s infinite; }
        .sparkles > div:nth-child(11) { left: 70px; animation: sparkle 10s ease-in-out 5.5s infinite; }
        .sparkles > div:nth-child(12) { left: 95px; animation: sparkle 10s ease-in-out 6s infinite; }
        .sparkles > div:nth-child(13) { left: 120px; animation: sparkle 10s ease-in-out 6.5s infinite; }
        .sparkles > div:nth-child(14) { left: 145px; animation: sparkle 10s ease-in-out 7s infinite; }
        .sparkles > div:nth-child(15) { left: 60px; animation: sparkle 10s ease-in-out 7.5s infinite; }
        .sparkles > div:nth-child(16) { left: 85px; animation: sparkle 10s ease-in-out 8s infinite; }
        .sparkles > div:nth-child(17) { left: 110px; animation: sparkle 10s ease-in-out 8.5s infinite; }
        .sparkles > div:nth-child(18) { left: 135px; animation: sparkle 10s ease-in-out 9s infinite; }
        .sparkles > div:nth-child(19) { left: 50px; animation: sparkle 10s ease-in-out 9.5s infinite; }
        .sparkles > div:nth-child(20) { left: 100px; animation: sparkle 10s ease-in-out 10s infinite; }

        /* Rose animations */
        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: scale(1.5);
          }
          15% {
            opacity: 1;
          }
          30% {
            bottom: 290px;
            opacity: 0;
          }
        }

        @keyframes bloom2 {
          0% {
            z-index: 10;
          }
          25% {
            transform: rotate(-100deg);
            top: 100px;
            left: 130px;
          }
          50% {
            transform: rotate(-40deg);
            top: 150px;
            left: 50px;
          }
          75% {
            transform: rotate(-80deg);
            top: 200px;
            left: 130px;
            opacity: 1;
          }
          100% {
            transform: rotate(-60deg);
            top: 252px;
            left: 50px;
            background: #7f1d1d;
            opacity: 0;
            z-index: 10;
            box-shadow: 0px 0px 0px rgba(239, 68, 68, 0);
          }
        }

        @keyframes bloom3 {
          0% {
            z-index: 10;
          }
          25% {
            transform: rotate(100deg);
            top: 100px;
            left: 50px;
          }
          50% {
            transform: rotate(40deg);
            top: 150px;
            left: 120px;
          }
          75% {
            transform: rotate(80deg);
            top: 200px;
            left: 50px;
            opacity: 1;
          }
          100% {
            transform: rotate(50deg);
            top: 252px;
            left: 130px;
            background: #7f1d1d;
            opacity: 0;
            z-index: 10;
            box-shadow: 0px 0px 0px rgba(239, 68, 68, 0);
          }
        }

        @keyframes bloom4 {
          100% {
            transform: rotate(-20deg);
          }
        }

        @keyframes bloom5 {
          100% {
            transform: rotate(20deg);
          }
        }

        @keyframes bloom6 {
          100% {
            transform: rotate(-5deg);
          }
        }

        @keyframes bloom7 {
          100% {
            transform: rotate(5deg);
          }
        }

       

        @keyframes falling {
          20% {
            top: 337px;
            background: #b91c1c;
            box-shadow: 0px 0px 0px rgba(239, 68, 68, 0);
          }
          100% {
            top: 337px;
            opacity: 0;
          }
        }

        /* ─── VALENTINE BANNER ─── */
        .vb {
          position: relative;
          margin-top: 16px;
          width: 90%;
          max-width: 480px;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255,253,247,0.97) 0%, rgba(255,243,224,0.97) 100%);
          box-shadow:
            0  4px  20px rgba(202,138,4,0.14),
            0 14px  44px rgba(202,138,4,0.07);
          border: 1px solid rgba(251,191,36,0.30);
          backdrop-filter: blur(14px);
        }

        /* glass streak */
        .vb__streak {
          position: absolute;
          top: -50%; left: -60%;
          width: 70%; height: 200%;
          background: linear-gradient(
            108deg,
            transparent 38%,
            rgba(255,255,255,0.42) 47%,
            rgba(255,255,255,0.56) 50%,
            rgba(255,255,255,0.42) 53%,
            transparent 62%
          );
          animation: streak 4.2s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes streak {
          0%   { left: -60%; }
          100% { left: 120%; }
        }

        /* close */
        .vb__close {
          position: absolute; top: 10px; right: 16px; z-index: 2;
          background: none; border: none; cursor: pointer;
          font-size: 1.4rem; line-height: 1;
          color: rgba(154,52,18,0.4);
          transition: color 0.2s;
        }
        .vb__close:hover { color: rgba(154,52,18,0.8); }

        /* body */
        .vb__body {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: center;
          gap: 16px;
          padding: 20px 30px 18px;
        }

        /* accent sparkle icons */
        .vb__icon {
          font-size: 1.5rem;
          color: #fbbf24;
          text-shadow: 0 0 8px rgba(251,191,36,0.5);
          animation: icon-pulse 2.2s ease-in-out infinite;
        }
        .vb__icon--r { animation-delay: 1.1s; }
        @keyframes icon-pulse {
          0%, 100% { transform: scale(1)    rotate(0deg);  opacity: 0.7; }
          50%      { transform: scale(1.25) rotate(15deg); opacity: 1;   }
        }

        /* text */
        .vb__text { text-align: center; }
        .vb__title {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 1.2rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #92400e;
          margin: 0 0 4px;
        }
        .vb__sub {
          font-size: 0.82rem;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: #b45309;
          opacity: 0.8;
          margin: 0;
        }

        /* bottom shimmer — gold */
        .vb__shimmer {
          position: relative; z-index: 1;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(251,191,36,0.3)  18%,
            rgba(250,204,21,0.75) 50%,
            rgba(251,191,36,0.3)  82%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2.8s linear infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ─── legacy / whatsapp ─── */
        @keyframes ping {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping { animation: ping 2s cubic-bezier(0,0,0.2,1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }

        /* ─── google one tap ─── */
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

const Layout = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <LayoutContent />
  </GoogleOAuthProvider>
);

export default Layout;