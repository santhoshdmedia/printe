import { useEffect, useState } from "react";
import banner from "../../assets/mockup/products.png";
import "./threeStep.css";
import { LuPackageCheck, LuArrowRight } from "react-icons/lu";
import { RiPrinterFill } from "react-icons/ri";
import { FaTruck } from "react-icons/fa";
import fav from "../../assets/mockup/print_bg.png";

const ThreeStep = () => {

  const steps = [
    {
      id: 1,
      title: "Pick Your Product",
      Icon: LuPackageCheck,
      description: "Browse our wide selection of premium print products",
    },
    {
      id: 2,
      title: "Customize Design",
      Icon: RiPrinterFill,
      description: "Upload your artwork or use our online design tools",
    },
    {
      id: 3,
      title: "Receive & Enjoy",
      Icon: FaTruck,
      description: "Fast delivery of your high-quality printed products",
    },
  ];

  return (
    <div className="relative mt-2 ">
      {/* TOP CURVE - Now clearly visible */}
      <div
        className="absolute top-[-130px] left-0 w-full h-64 bg-[#121621] z-0"
        style={{
          clipPath: " ellipse(50% 15% at 50% 50%)",
        }}
      ></div>

      {/* MAIN CONTENT */}
      <div className="relative bg-[#121621] py-2 z-10">
        <div className="relative px-2 md:px-8 lg:px-20 py-4 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:gap-4 lg:gap-12">
            {/* Text Content */}
            <div className="flex flex-col sm:gap-4 lg:gap-8 w-full sm:w-1/2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-wide">
                Make It Simple with Printe <br className="hidden sm:block" />
              </h1>
              <h1 className="text-[#f2c41a] mt-0 text-2xl sm:text-3xl md:text-4.5xl lg:text-5xl font-bold leading-tight tracking-wide">
                Only 3 Easy Steps
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-7 sm:leading-8 md:leading-10">
                From design to delivery, we&apos;ve perfected our 3-step process to
                give you premium quality prints with unmatched simplicity and
                speed. No complications, just professional results.
              </p>
            </div>

            {/* Image with Glow Effect */}
            <div className="w-full sm:w-1/2 relative mt-10 sm:mt-0">
              <div className="absolute  sm:block w-[220px] h-[220px] md:w-[280px] md:h-[280px] lg:w-[380px] lg:h-[380px] xl:w-[450px] xl:h-[450px] rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
                <div className="absolute inset-0 bg-[#ffe97a] h-full w-full rotation_container rounded-full backdrop-blur-sm flex items-center justify-center ">
                  {/* <RotatingTextCircle/> */}
                  <img
                    fetchPriority="high"
                    loading="eager"
                    src={fav}
                    alt="PrintBe Banner Background"
                    className="h-full w-full bg-cover z-10 transition-transform spinning"
                  />
                </div>
                {/* <div className="absolute inset-0 bg-[#f2c41a]/10 rounded-full animate-pulse-slow"></div> */}
                {/* <div className="absolute inset-0 rounded-full shadow-[0_0_30px_10px_rgba(249,193,20,0.3)] animate-glow"></div> */}
              </div>
              <img
                fetchPriority="high"
                loading="eager"
                src={banner}
                alt="PrintBe Banner"
                className="h-auto w-full max-w-[260px] sm:max-w-[290px] md:max-w-[330px] lg:max-w-[460px] xl:max-w-[550px] mx-auto object-contain relative z-10 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
          {/* Steps Indicator */}
          <div className="flex justify-center gap-3 sm:gap-2.5 md:gap-4 lg:gap-8 xl:gap-16 sm:mt-20 md:mt-28 lg:mt-32 mt-6 px-1 sm:px-4">
            {steps.map((step, index) => (
              <div key={step.id} className="relative group flex-1 max-w-sm">
                {/* Step Card */}
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-2 md:gap-3 lg:gap-4 sm:items-center  sm:px-2.5 md:px-4 lg:px-6 py-3 sm:py-3.5 md:py-4 rounded-lg bg-[#121621]/80 transition-all duration-300 h-full">
                  {/* Icon with animation */}
                  <div className="relative flex-shrink-0">
                    {/* <div className="absolute h-20 w-20 bg-[#f2c41a]/10 left-0 rounded-full animate-ping-slow" style={{ animationDelay: `${index * 0.2}s` }} ></div> */}
                    <div className="flex items-center justify-center h-11 w-11 sm:h-11 sm:w-11 md:h-14 md:w-14 lg:h-16 lg:w-16 xl:h-18 xl:w-18 bg-[#f2c41a]/20 rounded-full backdrop-blur-sm border border-[#f2c41a]/30">
                      <step.Icon className="text-xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-[#f2c41a]" />
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="w-full">
                    <h3 className="text-xs sm:text-xs md:text-base lg:text-lg xl:text-xl font-bold text-white mb-0.5 sm:mb-1 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-[10px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base text-white/80 leading-tight">{step.description}</p>
                  </div>

                  {/* Arrow icon - only show between steps (horizontal from sm to max screen width) */}
                  {index < steps.length - 1 && (
                    <div className="absolute -right-2 sm:-right-2 md:-right-3 lg:-right-5.5 xl:-right-10 top-1/2 transform -translate-y-1/2  z-20 pointer-events-none">
                      <LuArrowRight className="text-base sm:text-base md:text-xl lg:text-2xl text-[#f2c41a]/60 group-hover:text-[#f2c41a] transition-colors duration-300" />
                    </div>
                  )}
                </div>

                {/* Mobile arrow (below card, hidden on sm and above) */}
                {/* {index < steps.length - 1 && (
                  <div className="sm:hidden flex justify-center py-4">
                    <LuArrowRight className="text-2xl text-[#f2c41a]/60 rotate-90" />
                  </div>
                )} */}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM CURVE - Now clearly visible */}
      <div
        className="absolute bottom-[-130px] left-0 w-full h-64 bg-[#121621] z-0"
        style={{
          clipPath: " ellipse(50% 15% at 50% 50%)",
        }}
      ></div>
    </div>
  );
};

export default ThreeStep;
// rotating
export const RotatingTextCircle = () => {
  const text = "-   we create   -  you celebrate ";
  const [rotatedLetters, setRotatedLetters] = useState([]);

  useEffect(() => {
    const letters = text.split("").map((char, i) => ({
      char,
      angle: i * 10.3, // angle between letters
    }));
    setRotatedLetters(letters);
  }, [text]);

  return (
    <div className="circle-wrapper">
      <div className="circle">
        <div className="logo" />
        <div className="text">
          {rotatedLetters.map((item, index) => (
            <span
              key={index}
              style={{ transform: `rotate(${item.angle}deg)` }}
            >
              {item.char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};