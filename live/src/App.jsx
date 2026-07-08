import { useState, useEffect, useRef } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./config/Router.jsx";
import { useDispatch, useSelector } from "react-redux";
import { ConfigProvider, Button } from "antd";
import { CartProvider } from "./helper/Carthelper.jsx";

// One small utility — replaces AOS entirely
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);
document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
import LogoLoader from "./components/reusable/LogoLoader.jsx";

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenicating } = useSelector((state) => state.authSlice);
  
  // Countdown Timer State
  const [showCountdown, setShowCountdown] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0, 
    hours: 0, 
    minutes: 0, 
    seconds: 0, 
    expired: false
  });
  const [targetDate, setTargetDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const confettiIntervalRef = useRef(null);



  // Initialize target date - MAIN LOGIC
  useEffect(() => {
    const now = new Date();

    setIsLoading(false);
  }, []);


  // Authentication check effect
  useEffect(() => {
    const result = dispatch({ type: "CHECK_LOGIN" });
  }, []);

 


  // Show loading state
  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-white flex items-center justify-center">
        <LogoLoader fullScreen size={80} label="Loading..." />
      </div>
    );
  }

  // If countdown is active and not expired, show countdown screen


  // If countdown has expired, show the main application with confetti
  return (
    <div className={`${isAuthenicating && "h-screen center_div"}`}>
    
      
      <CartProvider>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#0369a1",
            },
          }}
        >
          {isAuthenicating ? (
            <LogoLoader fullScreen size={80} label="Loading..." />
          ) : (
            <RouterProvider router={router} />
          )}
        </ConfigProvider>
      </CartProvider>
    </div>
  );
};

export default App;