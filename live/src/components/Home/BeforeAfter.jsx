import React, { useState, useRef, useEffect } from 'react';
import before from "../../assets/beforeAfter/before.png"
import after from "../../assets/beforeAfter/after.jpg"



const BeforeAfterSlider = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const sliderRef = useRef(null);
  const containerRef = useRef(null);

  const handleSliderChange = (e) => {
    setSliderValue(e.target.value);
  };

  const handleDoubleClick = () => {
    setSliderValue(50);
  };

  return (
    <div className="bg-gray-50 py-12 px-6 sm:px-10 lg:py-20 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                See the{" "}
                <span className="block text-amber-600">Transformation</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Witness the remarkable difference in print quality with our premium
                packaging solutions. Our advanced digital printing technology brings
                your brand to life with stunning clarity and vibrant colors.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  title: "Crystal Clear Details",
                  desc: "Every detail shines with our high-resolution printing",
                },
                {
                  title: "Vibrant Colors",
                  desc: "Rich, lasting colors that make your brand pop",
                },
                {
                  title: "Professional Finish",
                  desc: "Matte and glossy options for premium look and feel",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Before After Slider */}
          <div className="relative">
            <div
              ref={containerRef}
              className="relative w-full max-w-full aspect-[4/3] sm:aspect-[3/2] mx-auto rounded-2xl overflow-hidden shadow-2xl"
              aria-label="Before and after image slider"
            >
              {/* Before Image */}
              <div className="absolute w-full h-full overflow-hidden">
                <img
                  src={before}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* After Image */}
              <div
                className="absolute w-full h-full overflow-hidden"
                style={{ clipPath: `inset(0px 0px 0px ${sliderValue}%)` }}
              >
                <img
                  src={after}
                  alt="After"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white transform -translate-x-1/2 z-10 shadow-lg"
                style={{ left: `${sliderValue}%` }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                    <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                    <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Range Input */}
              <input
                ref={sliderRef}
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSliderChange}
                onDoubleClick={handleDoubleClick}
                className="absolute w-full h-full opacity-0 cursor-ew-resize z-20"
              />

              {/* Labels */}
              {/* Labels */}
<div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/60 text-white px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium tracking-wide z-10">
  BEFORE
</div>
<div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/60 text-white px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium tracking-wide z-10">
  AFTER
</div>

            </div>
          </div>
        </div>
      </div>

      {/* Custom Slider Thumb */}
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 2rem;
          width: 2rem;
          border: 0.25rem solid #fff;
          border-radius: 50%;
          box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.3);
          background-color: #fff;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='18px' viewBox='0 -960 960 960' width='18px' fill='%23000'%3E%3Cpath d='M286.15-293.85 100-479.62l185.77-185.76 42.15 41.76-113 113.62h530.16l-113-113.62 42.15-41.76L860-479.62 674.23-293.85l-42.54-41.77 113.39-114H214.54l113.38 114-41.77 41.77Z'/%3E%3C/svg%3E");
          background-size: 0.9rem;
          background-repeat: no-repeat;
          background-position: center;
          cursor: grab;
        }

        @media (min-width: 640px) {
          input[type="range"]::-webkit-slider-thumb {
            height: 3rem;
            width: 3rem;
            background-size: 1rem;
          }
        }

        input[type="range"]:active::-webkit-slider-thumb {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

export default BeforeAfterSlider;