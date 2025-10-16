import React, { useState, useRef, useEffect } from 'react';
import before from "../../assets/beforeAfter/before.jpg"
import after from "../../assets/beforeAfter/after.webp"

const BeforeAfterSlider = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const sliderRef = useRef(null);
  const containerRef = useRef(null);

  const handleSliderChange = (e) => {
    const value = e.target.value;
    setSliderValue(value);
  };

  const handleDoubleClick = () => {
    setSliderValue(50);
  };

  return (
    <div className=" bg-gray-50 py-16 px-24">
      <div className=" mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                See the 
                <span className="block text-amber-600">Transformation</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Witness the remarkable difference in print quality with our premium packaging solutions. 
                Our advanced digital printing technology brings your brand to life with stunning clarity 
                and vibrant colors.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Crystal Clear Details</h4>
                  <p className="text-gray-600">Every detail shines with our high-resolution printing</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Vibrant Colors</h4>
                  <p className="text-gray-600">Rich, lasting colors that make your brand pop</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Professional Finish</h4>
                  <p className="text-gray-600">Matte and glossy options for premium look and feel</p>
                </div>
              </div>
            </div>

        
          </div>

          {/* Right Side - Before After Slider */}
          <div className="relative">
            <div 
              ref={containerRef}
              className="relative flex w-full max-w-2xl mx-auto aspect-[3/2] rounded-2xl overflow-hidden shadow-2xl"
              aria-label="Before and after image slider"
            >
              {/* Before Image */}
              <div className="absolute w-full h-full overflow-hidden">
                <img 
                  src={before} 
                  alt="Before - Standard packaging"
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
                  alt="After - Our premium packaging"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Slider Line */}
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

              {/* Slider Input */}
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
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-semibold z-10">
                BEFORE
              </div>
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-semibold z-10">
                AFTER
              </div>
            </div>

            {/* Instructions */}
            
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 3rem;
          width: 3rem;
          border: 0.25rem solid #fff;
          border-radius: 50%;
          box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.3);
          background-color: #fff;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='%23000'%3E%3Cpath d='M286.15-293.85 100-479.62l185.77-185.76 42.15 41.76-113 113.62h530.16l-113-113.62 42.15-41.76L860-479.62 674.23-293.85l-42.54-41.77 113.39-114H214.54l113.38 114-41.77 41.77Z'/%3E%3C/svg%3E");
          background-size: 1rem;
          background-repeat: no-repeat;
          background-position: center;
          cursor: grab;
        }

        input[type="range"]:active::-webkit-slider-thumb {
          cursor: grabbing;
        }

        input[type="range"]::-moz-range-thumb {
          height: 3rem;
          width: 3rem;
          border: 0.25rem solid #fff;
          border-radius: 50%;
          box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.3);
          background-color: #fff;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='%23000'%3E%3Cpath d='M286.15-293.85 100-479.62l185.77-185.76 42.15 41.76-113 113.62h530.16l-113-113.62 42.15-41.76L860-479.62 674.23-293.85l-42.54-41.77 113.39-114H214.54l113.38 114-41.77 41.77Z'/%3E%3C/svg%3E");
          background-size: 1rem;
          background-repeat: no-repeat;
          background-position: center;
          cursor: grab;
        }

        input[type="range"]:active::-moz-range-thumb {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

export default BeforeAfterSlider;