import { useState, useEffect, useRef } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./config/Router.jsx";
import { useDispatch, useSelector } from "react-redux";
import { ConfigProvider, Spin, Button } from "antd";
import { CartProvider } from "./helper/Carthelper.jsx";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { DomeGallery } from "./components/Demo.jsx";

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

  // Fixed target date: 9th December 2025 at 1:45 AM
  const FIXED_TARGET_DATE = new Date(2025, 11, 11, 11, 12, 0); // Month is 0-indexed (11 = December)

  // Function to check and clear localStorage if current date has passed fixed target
  const checkAndClearExpiredCountdown = () => {
    const now = new Date();
    
    // If current date is AFTER the fixed target date
    if (now > FIXED_TARGET_DATE) {
      console.log("🔄 Current date has passed fixed target date. Clearing localStorage...");
      localStorage.removeItem('countdownHasExpired');
      localStorage.removeItem('countdownTargetDate');
      return true; // Indicates we cleared localStorage
    }
    return false; // Didn't clear
  };

  // Debug function to reset everything
  const resetCountdown = () => {
    console.log("RESETTING COUNTDOWN");
    localStorage.removeItem('countdownHasExpired');
    localStorage.removeItem('countdownTargetDate');
    window.location.reload();
  };

  // Confetti animation code - simplified and fixed
  const initConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const COLORS = [
      [235, 90, 70],
      [97, 189, 79],
      [242, 214, 0],
      [0, 121, 191],
      [195, 119, 224]
    ];
    
    const context = canvas.getContext("2d");
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let confettiParticles = [];
    const NUM_CONFETTI = 50;
    let animationId = null;
    
    // Create confetti particles
    class ConfettiParticle {
      constructor() {
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.diameter = Math.random() * 10 + 5;
        this.tilt = Math.random() * 10 - 10;
        this.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
        this.tiltAngle = 0;
        this.speed = Math.random() * 3 + 2;
        this.waveAngle = Math.random() * Math.PI * 2;
        this.waveSpeed = Math.random() * 0.05 + 0.02;
      }
      
      update() {
        this.waveAngle += this.waveSpeed;
        this.tiltAngle += this.tiltAngleIncrement;
        this.tilt = Math.sin(this.tiltAngle) * 15;
        this.y += (Math.cos(this.waveAngle) + this.speed) * 0.5;
        this.x += Math.sin(this.waveAngle);
        
        // Reset particle if it falls off screen
        if (this.y > canvas.height) {
          this.y = -10;
          this.x = Math.random() * canvas.width;
        }
      }
      
      draw() {
        context.beginPath();
        context.lineWidth = this.diameter;
        context.strokeStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
        context.moveTo(this.x + this.tilt, this.y);
        context.lineTo(this.x, this.y + this.diameter);
        context.stroke();
      }
    }
    
    // Initialize particles
    for (let i = 0; i < NUM_CONFETTI; i++) {
      confettiParticles.push(new ConfettiParticle());
    }
    
    // Animation loop
    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < confettiParticles.length; i++) {
        confettiParticles[i].update();
        confettiParticles[i].draw();
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Store animation ID for cleanup
    animationRef.current = animationId;
    
    // Stop animation after 5 seconds
    confettiIntervalRef.current = setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setShowConfetti(false);
    }, 10000);
  };

  // Cleanup confetti animation
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (confettiIntervalRef.current) {
        clearTimeout(confettiIntervalRef.current);
      }
    };
  }, []);

  // Start confetti when countdown expires
  useEffect(() => {
    if (!showCountdown && timeRemaining.expired) {
      console.log("Countdown expired - showing confetti animation");
      setShowConfetti(true);
    }
  }, [showCountdown, timeRemaining.expired]);

  // Initialize confetti when showConfetti becomes true
  useEffect(() => {
    if (showConfetti) {
      // Wait for canvas to be rendered
      setTimeout(() => {
        initConfetti();
      }, 50);
    }
  }, [showConfetti]);

  // Initialize target date - MAIN LOGIC
  useEffect(() => {
    const now = new Date();
    console.log("====================================");
    console.log("DEBUG INFO:");
    console.log("Current time:", now.toLocaleString());
    console.log("Current time (24h):", now.getHours() + ":" + now.getMinutes());
    console.log("Fixed target time:", FIXED_TARGET_DATE.toLocaleString());
    console.log("Fixed target (24h):", FIXED_TARGET_DATE.getHours() + ":" + FIXED_TARGET_DATE.getMinutes());
    console.log("Is target > now?", FIXED_TARGET_DATE > now);
    
    // FIRST: Check if current date has passed the fixed target date
    // This ensures localStorage is cleared if user visits after the target date
    const shouldClearStorage = checkAndClearExpiredCountdown();
    
    if (shouldClearStorage) {
      console.log("🗑️  Cleared localStorage because current date passed target date");
    }
    
    // Check localStorage
    const hasCountdownExpired = localStorage.getItem('countdownHasExpired');
    const storedTargetDate = localStorage.getItem('countdownTargetDate');
    
    console.log("localStorage countdownHasExpired:", hasCountdownExpired);
    console.log("localStorage countdownTargetDate:", storedTargetDate);
    
    // Check if fixed target date is in the future
    if (FIXED_TARGET_DATE > now) {
      console.log("✅ Fixed countdown target is in the FUTURE - showing countdown");
      
      // Only show countdown if it hasn't been marked as expired
      if (hasCountdownExpired !== 'true') {
        setTargetDate(FIXED_TARGET_DATE);
        setShowCountdown(true);
        
        // Store the fixed target date for persistence
        localStorage.setItem('countdownTargetDate', FIXED_TARGET_DATE.getTime().toString());
        localStorage.removeItem('countdownHasExpired'); // Ensure not marked as expired
      } else {
        console.log("⚠️  Countdown was previously marked as expired, but target is in future. Showing website.");
        setShowCountdown(false);
      }
    } else {
      // Countdown has expired - mark it as permanently expired
      console.log("❌ Fixed countdown target has EXPIRED - showing website permanently");
      localStorage.setItem('countdownHasExpired', 'true');
      localStorage.removeItem('countdownTargetDate');
      setShowCountdown(false);
    }
    
    setIsLoading(false);
  }, []);

  function calculateTimeRemaining() {
    if (!targetDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
    }

    const now = new Date();
    const target = targetDate;
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) {
      // Mark countdown as permanently expired
      localStorage.setItem('countdownHasExpired', 'true');
      localStorage.removeItem('countdownTargetDate');
      
      console.log("Countdown EXPIRED PERMANENTLY! Showing main website forever...");
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    // Calculate remaining time
    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      days,
      hours,
      minutes,
      seconds,
      expired: false,
    };
  }

  // Initialize countdown when targetDate is set
  useEffect(() => {
    if (targetDate) {
      const initialTime = calculateTimeRemaining();
      setTimeRemaining(initialTime);
      setShowCountdown(!initialTime.expired);
      console.log("Initial countdown time:", initialTime);
    }
  }, [targetDate]);

  // Countdown timer effect
  useEffect(() => {
    if (!targetDate || !showCountdown) return;
    
    console.log("Starting countdown timer for fixed target...");
    
    const interval = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining();
      setTimeRemaining(newTimeRemaining);
      
      if (newTimeRemaining.expired) {
        console.log("Countdown finished PERMANENTLY. Showing main app forever.");
        setShowCountdown(false);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, showCountdown]);

  // Set up a daily check to automatically clear localStorage when date passes
  useEffect(() => {
    // Check once on mount
    checkAndClearExpiredCountdown();
    
    // Set up interval to check daily (every 24 hours)
    const dailyCheckInterval = setInterval(() => {
      console.log("🔄 Running daily check for countdown expiration...");
      checkAndClearExpiredCountdown();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    // Also check when user comes back to tab (visibility change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("🔍 Tab became visible, checking countdown...");
        checkAndClearExpiredCountdown();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(dailyCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Authentication check effect
  useEffect(() => {
    const result = dispatch({ type: "CHECK_LOGIN" });
  }, []);

  // AOS animation effect - only initialize after countdown
  useEffect(() => {
    if (!showCountdown) {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
      });
    }
  }, [showCountdown]);

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      if (showConfetti && canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showConfetti]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If countdown is active and not expired, show countdown screen
  if (showCountdown && !timeRemaining.expired) {
    console.log("Rendering countdown screen");
    return (
      <div className='w-screen h-screen bg-black'>
        <DomeGallery countdown={timeRemaining} />
      </div>
    );
  }

  // If countdown has expired, show the main application with confetti
  return (
    <div className={`${isAuthenicating && "h-screen center_div"}`}>
      {/* Debug reset button - only in development */}
      {/* {process.env.NODE_ENV === 'development' && (
        <Button 
          onClick={resetCountdown}
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 10000,
            backgroundColor: '#ff4d4f',
            color: 'white',
            border: 'none',
          }}
        >
          Reset Countdown
        </Button>
      )} */}
      
      {/* Confetti Canvas - only show when countdown just expired */}
      {showConfetti && (
        <canvas
          ref={canvasRef}
          id="confeti"
          className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
          style={{ position: 'fixed' }}
        />
      )}
      
      <CartProvider>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#0369a1",
            },
          }}
        >
          <Spin spinning={isAuthenicating}>
            {!isAuthenicating && <RouterProvider router={router} />}
          </Spin>
        </ConfigProvider>
      </CartProvider>
    </div>
  );
};

export default App;