import React,{useRef,useEffect,useState} from "react";
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
    <div className="relative ">
      {/* TOP CURVE - Now clearly visible */}
      <div
        className="absolute top-[-130px] left-0 w-full h-64 bg-[#121621] z-0"
        style={{
          clipPath: " ellipse(50% 15% at 50% 50%)",
        }}
      ></div>

      {/* MAIN CONTENT */}
      <div className="relative bg-[#121621] pt-5 pb-5 z-10">
        <div className="relative px-4 sm:px-20 py-12 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
            {/* Text Content */}
            <div className="flex flex-col gap-8 w-full lg:w-1/2">
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-wide">
                Make It Simple with Printe <br className="hidden sm:block" />
              </h1>
              <h1 className="text-[#f9c114] mt-0 text-4xl sm:text-5xl font-bold leading-tight tracking-wide">
                Only 3 Easy Steps
              </h1>
              <p className="text-xl text-white/90 leading-10">
                From design to delivery, we've perfected our 3-step process to
                give you premium quality prints with unmatched simplicity and
                speed. No complications, just professional results.
              </p>
            </div>

            {/* Image with Glow Effect */}
            <div className="w-full lg:w-1/2 relative mt-10 lg:mt-0">
              <div className="absolute hidden lg:block h-[450px] w-[450px] rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
                <div className="absolute inset-0 bg-[#ffe97a] h-full w-full rotation_container rounded-full backdrop-blur-sm flex items-center justify-center ">
          {/* <RotatingTextCircle/> */}
                  <img
                src={fav}
                alt="PrintBe Banner"
                className="  h-full w-full bg-cover z-10 transition-transform spinning "
              />
                </div>
                {/* <div className="absolute inset-0 bg-[#f9c114]/10 rounded-full animate-pulse-slow"></div> */}
                {/* <div className="absolute inset-0 rounded-full shadow-[0_0_30px_10px_rgba(249,193,20,0.3)] animate-glow"></div> */}
              </div>
              <img
                src={banner}
                alt="PrintBe Banner"
                className="h-auto w-full max-w-[550px] mx-auto object-contain relative z-10 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
          {/* Steps Indicator */}
          <div className="flex flex-col lg:flex-row justify-center gap-6 lg:gap-8 mt-32 px-4 cursor-pointer">
            {steps.map((step, index) => (
              <div key={step.id} className="relative group">
                {/* Step Card */}
                <div className="flex gap-4 items-center px-6 py-4 rounded-lg bg-[#121621]/80  transition-all duration-300">
                  {/* Icon with animation */}
                  <div className="relative flex-shrink-0">
                    {/* <div className="absolute h-20 w-20 bg-[#f9c114]/10 left-0 rounded-full animate-ping-slow" style={{ animationDelay: `${index * 0.2}s` }} ></div> */}
                    <div className="flex items-center justify-center h-16 w-16 bg-[#f9c114]/20 rounded-full backdrop-blur-sm border border-[#f9c114]/30">
                      <step.Icon className="text-3xl text-[#f9c114]" />
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="w-full">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-white/80">{step.description}</p>
                  </div>

                  {/* Arrow icon - only show between steps */}
                  {index < steps.length - 1 && (
                    <div className="absolute -right-7 top-1/2 transform -translate-y-1/2 hidden lg:block">
                      <LuArrowRight className="text-2xl text-[#f9c114]/60 group-hover:text-[#f9c114] transition-colors duration-300" />
                    </div>
                  )}
                </div>

                {/* Mobile arrow (below card) */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center py-4">
                    <LuArrowRight className="text-2xl text-[#f9c114]/60 rotate-90" />
                  </div>
                )}
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