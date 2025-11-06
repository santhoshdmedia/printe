import React, { useState, useEffect } from "react";
import slide_one from "../../assets/mockup/mockup_1.png";
import slide_two from "../../assets/mockup/MOCKUP_2.png";

const ThreeDSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const slides = [
    { 
      id: 1, 
      img_title: "Banner One",
      img_description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro distinctio ab laborum perspiciatis quas itaque deserunt quod officia deleniti sapiente vitae eum, corporis est.",
      image: slide_one
    },
    { 
      id: 2, 
      img_title: "Banner Two",
      img_description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro distinctio ab laborum perspiciatis quas itaque deserunt quod officia deleniti sapiente vitae eum, corporis est.",
      image: slide_two
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        setIsAnimating(false);
      }, 500);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
    }, 300);
  };

  const goToPrevSlide = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      setIsAnimating(false);
    }, 300);
  };

  const goToNextSlide = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="relative w-full bg-gray-50">
      <div className="container mx-auto px-4 py-12 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Floating Image on Left */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative h-64 lg:h-96 xl:h-[500px]">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${
                    index === currentSlide
                      ? "opacity-100 z-10 translate-x-0 rotate-0"
                      : "opacity-0 -translate-x-10 -rotate-6"
                  }`}
                  style={{
                    transform: index === currentSlide ? 
                      'translateX(0) rotate(0)' : 
                      'translateX(-20px) rotate(-6deg)',
                    filter: index === currentSlide ? 
                      'drop-shadow(0 20px 30px rgba(0,0,0,0.2))' : 
                      'drop-shadow(0 10px 15px rgba(0,0,0,0.1))'
                  }}
                >
                  <img
                    src={slide.image}
                    className="w-full h-full object-contain"
                    alt={slide.img_title}
                    loading={index === currentSlide ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Content on Right */}
          <div className="w-full lg:w-1/2 space-y-6">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 translate-y-0"
                    : "absolute opacity-0 -translate-y-5"
                }`}
              >
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
                  <span className="inline-block transition-all duration-500 delay-100">
                    {slide.img_title.split(' ').map((word, i) => (
                      <span 
                        key={i} 
                        className={`inline-block transition-transform duration-500 ${
                          index === currentSlide && !isAnimating ? 
                          'translate-y-0' : 'translate-y-5'
                        }`}
                        style={{ transitionDelay: `${i * 100}ms` }}
                      >
                        {word}{' '}
                      </span>
                    ))}
                  </span>
                </h2>
                <p className="text-lg lg:text-xl text-gray-600 mb-6">
                  {slide.img_description.split('. ').map((sentence, i) => (
                    <span 
                      key={i}
                      className={`block transition-opacity duration-500 ${
                        index === currentSlide && !isAnimating ? 
                        'opacity-100' : 'opacity-0'
                      }`}
                      style={{ transitionDelay: `${300 + (i * 200)}ms` }}
                    >
                      {sentence}.
                    </span>
                  ))}
                </p>
                <button
                  className={`px-8 py-3 bg-[#f2c41a] text-white font-medium rounded-full transition-all duration-500 ${
                    index === currentSlide && !isAnimating ? 
                    'translate-y-0 opacity-100' : 
                    'translate-y-5 opacity-0'
                  }`}
                  style={{ transitionDelay: '700ms' }}
                >
                  Shop Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center mt-8 lg:mt-12 space-x-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-[#f2c41a] w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all z-10"
          aria-label="Previous slide"
        >
          ❮
        </button>
        <button
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all z-10"
          aria-label="Next slide"
        >
          ❯
        </button>
      </div>
    </div>
  );
};

export default ThreeDSlider;




