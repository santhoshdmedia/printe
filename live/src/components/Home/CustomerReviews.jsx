import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Rate } from "antd";

const REVIEWS_DATA = [
  // Set 1
  {
    id: 1,
    name: "Arun R.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "The quality is amazing and the customization was spot on! My girlfriend loved it.",
  },
  {
    id: 2,
    name: "Priya S.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Super fast delivery and great customer service. Will definitely order again!",
  },
  {
    id: 3,
    name: "Karthik V.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Such a wonderful experience. The gift was exactly how I imagined it. Thank you!",
  },
  // Set 2
  {
    id: 4,
    name: "Sneha M.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Ordered a customized frame for our anniversary. The print clarity and wooden finish are top notch!",
  },
  {
    id: 5,
    name: "Rahul D.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "The magic mug was a huge hit for my brother's birthday! Color quality exceeded expectations.",
  },
  {
    id: 6,
    name: "Ananya K.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "PrintE never disappoints! Premium packaging and delivered right on time. 10/10 recommended.",
  },
  // Set 3
  {
    id: 7,
    name: "Vikram B.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Got corporate gifts printed for my whole team. Everyone was genuinely impressed with the quality!",
  },
  {
    id: 8,
    name: "Deepa N.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "The personalized photo lamp looks mesmerizing at night. Truly a one-of-a-kind gift.",
  },
  {
    id: 9,
    name: "Rohit J.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Customer support helped me adjust my design before printing. Beautiful craftsmanship!",
  },
];

const CustomerReviews = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Track screen width to show 1 in a row below md (< 768px) and 3 in a row on md and above
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const itemsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(REVIEWS_DATA.length / itemsPerPage);

  // Keep currentPage within valid range if totalPages changes
  useEffect(() => {
    setCurrentPage((prev) => (prev >= totalPages ? 0 : prev));
  }, [totalPages]);

  // Auto-scroll every 5 seconds (paused when user hovers over carousel)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000);

    return () => clearInterval(timer);
  }, [totalPages, isHovered]);

  const currentReviews = REVIEWS_DATA.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  // Carousel Pagination Dots
  const CarouselButtons = () => (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5">
      {Array.from({ length: totalPages }).map((_, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => setCurrentPage(idx)}
          className="border-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none active:border-none active:ring-0 bg-transparent transition-all duration-300 flex items-center justify-center p-1 cursor-pointer select-none"
          style={{
            outline: "none",
            border: "none",
            boxShadow: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          aria-label={`Go to reviews set ${idx + 1}`}
        >
          {currentPage === idx ? (
            <span className="w-5 sm:w-7 h-2 bg-[#f2c41a] rounded-full transition-all duration-300 shadow-sm" />
          ) : (
            <span className="w-2 h-2 bg-black/25 hover:bg-black/50 rounded-full transition-all duration-300" />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full bg-[#fcf2d4ff] py-6 md:py-8 lg:py-12 px-4 sm:px-6 lg:px-10 xl:px-16 font-primary relative overflow-hidden shadow-md">
      {/* Import cursive Google Font Caveat */}
      <link
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap"
        rel="stylesheet"
      />

      <div className="relative z-10">
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
          {/* ══════ LEFT: Cursive Text ══════ */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 select-none">
            <span
              className="text-4xl md:text-4xl lg:text-5xl xl:text-6xl text-black font-yesteryear leading-none transform -rotate-3"
            >
              Real People
            </span>
            <span
              className="text-4xl md:text-4xl lg:text-5xl xl:text-6xl text-black font-yesteryear leading-tight transform -rotate-1 mt-1"
            >
              Real Moments
            </span>
          </div>

          {/* ══════ MIDDLE: Reviews Carousel (Inside review card container) ══════ */}
          <div
            className="w-full flex-1 flex flex-col justify-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="w-full overflow-hidden min-h-[140px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${isMobile ? "m" : "d"}-${currentPage}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                  className={`grid ${
                    isMobile
                      ? "grid-cols-1 max-w-xl mx-auto"
                      : "grid-cols-1 md:grid-cols-3"
                  } gap-4 md:gap-5 lg:gap-6 w-full`}
                >
                  {currentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex flex-row md:flex-col 2xl:flex-row items-start gap-3.5 sm:gap-4 bg-[#FCF8ED] rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-sm"
                    >
                      {/* Person Avatar */}
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 ring-3 ring-[#f2c41a] shadow-sm"
                        loading="lazy"
                      />

                      {/* Review content */}
                      <div className="flex-1 min-w-0">
                        {/* Rating stars */}
                        <div className="flex items-center gap-1 mb-1.5">
                          <Rate
                            disabled
                            defaultValue={review.rating}
                            className="!text-xs sm:!text-sm !text-yellow-400"
                          />
                        </div>

                        {/* Review text */}
                        <p className="text-xs sm:text-sm text-gray-800 font-medium leading-snug line-clamp-5 italic mb-2">
                          &ldquo;{review.text}&rdquo;
                        </p>

                        {/* Reviewer Name */}
                        <span className="text-xs sm:text-sm font-extrabold text-black block truncate">
                          — {review.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ══════ Carousel Button appears inside review card container on base to lg (0 to 1024px) ══════ */}
            <div className="lg:hidden mt-4 sm:mt-5 w-full flex justify-center">
              <CarouselButtons />
            </div>
          </div>

          {/* ══════ RIGHT: 1000+ Happy Customers ══════ */}
          <div className="flex flex-col items-center justify-center text-center shrink-0 select-none rounded-2xl sm:px-2 sm:py-2 min-w-[150px]">
            <div className="flex items-center gap-1 text-[#d4a005] text-sm   mb-0.5">
              <span>✦</span>
              <span
                className="text-xl sm:text-3xl text-gray-800 font-yesteryear"
              >
                Over
              </span>
              <span>✦</span>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bowlby text-black tracking-tight leading-none my-0.5">
              1000+
            </div>
            <div
              className="text-2xl sm:text-3xl text-gray-800 font-yesteryear leading-tight mb-4 sm:mb-0"
            >
              Happy Customers
            </div>
            {/* <span className="text-xl mt-1.5" role="img" aria-label="love">
              💛
            </span> */}
          </div>
        </div>

        {/* ══════ Carousel Button at bottom for lg screen and above (> 1024px) ══════ */}
        <div className="hidden lg:flex items-center justify-center mt-6 sm:mt-8">
          <CarouselButtons />
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
