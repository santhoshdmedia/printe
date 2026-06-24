import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM (UI/UX Pro Max)
// ─────────────────────────────────────────────────────────────────────────
const DESIGN_SYSTEM = {
  colors: {
    primary: "#0369A1", // Professional sky blue
    accent: "#f2c41a", // Keep existing accent
    dark: "#0F172A", // Near-black for text
    light: "#F8FAFC", // Off-white background
    text: "#020617", // True black for text
    border: "#E2E8F0", // Light gray border
    muted: "#64748B", // Gray for secondary text
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem",
    "2xl": "4rem",
  },
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
    md: "0 2px 4px 0 rgba(15, 23, 42, 0.1)",
    lg: "0 4px 8px 0 rgba(15, 23, 42, 0.15)",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// LOADING SKELETON
// ─────────────────────────────────────────────────────────────────────────
const BannerLoadingSkeleton = () => (
  <div className="lg:w-[85%] mx-auto pt-6 lg:py-2 translate-x-[5%]">
    <div className="px-0 pt-10 flex justify-center">
      <div className="w-full flex flex-col lg:flex-row-reverse items-start gap-0 lg:gap-16 animate-pulse">
        <div
          className="w-full lg:w-1/2 min-h-[500px] lg:min-h-[600px] rounded-xl"
          style={{ backgroundColor: DESIGN_SYSTEM.colors.border }}
        />
        <div className="w-[90%] lg:w-1/2 space-y-6 py-8">
          <div
            className="h-6 w-32 rounded-full"
            style={{ backgroundColor: DESIGN_SYSTEM.colors.border }}
          />
          <div className="space-y-3">
            <div
              className="h-12 w-3/4 rounded-lg"
              style={{ backgroundColor: DESIGN_SYSTEM.colors.border }}
            />
            <div
              className="h-12 w-1/2 rounded-lg"
              style={{ backgroundColor: DESIGN_SYSTEM.colors.border }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-6 rounded"
                style={{ backgroundColor: DESIGN_SYSTEM.colors.border }}
              />
            ))}
          </div>
          <div
            className="h-12 w-36 rounded-full"
            style={{ backgroundColor: DESIGN_SYSTEM.colors.border }}
          />
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// CAROUSEL BANNER COMPONENT
// ─────────────────────────────────────────────────────────────────────────
const CarouselBanner = () => {
  const dispatch = useDispatch();
  const { banners, isGettingBanners } = useSelector((state) => state.publicSlice);
  const { user } = useSelector((state) => state.authSlice);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const swiperRef = useRef(null);

  // ─ Fetch banners ─
  useEffect(() => {
    dispatch({ type: "GET_BANNERS" });
  }, [dispatch]);

  // ─ Filter & sort banners ─
  const visibleBanners = banners
    ? banners
        .filter((banner) => {
          if (banner.is_visible === false) return false;
          if (banner.expiry_date) {
            const expiryDate = new Date(banner.expiry_date);
            if (expiryDate <= new Date()) return false;
          }
          return true;
        })
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
    : [];

  // ─ Early returns ─
  if (isGettingBanners) return <BannerLoadingSkeleton />;
  if (!visibleBanners.length) return null;

  // ─ HANDLERS ─
  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
    setIsTransitioning(false);
  };

  const handleSwiperInit = (swiper) => {
    swiperRef.current = swiper;
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handlePrev = () => {
    if (swiperRef.current && !isTransitioning && !isBeginning) {
      setIsTransitioning(true);
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current && !isTransitioning && !isEnd) {
      setIsTransitioning(true);
      swiperRef.current.slideNext();
    }
  };

  const handleKeyDown = (e) => {
    if (!isFocused) return;
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  // ─ HELPERS ─
  const renderAnimatedTitle = (title) => {
    const displayTitle = title || "Premium Printing Solutions";
    const words = displayTitle.includes("  ")
      ? displayTitle.split("  ")
      : displayTitle.split(" ");

    return words.map((word, i) => (
      <motion.span
        key={i}
        className="inline-block"
        initial={{ y: 20, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          transition: {
            duration: 0.5,
            delay: i * 0.08,
            ease: "easeOut",
          },
        }}
      >
        {word}{" "}
      </motion.span>
    ));
  };

  const getButtonText = (banner) => {
    if (banner.is_reward) return "Claim Reward";
    const tag = banner.tag?.toLowerCase() || "";
    if (tag.includes("exclusive") || tag.includes("launch")) return "Claim Now";
    return "Shop Now";
  };

  const getBannerLink = (banner) => {
    if (banner.is_reward && (!user || !user.name)) return "/login";
    return `/${banner.banner_slug || ""}`;
  };

  // ─ RENDER ─
  return (
    <div
      className="lg:w-[85%] bg-transparent h-[100%] pt-6 lg:py-2 mx-auto relative translate-x-[5%]"
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="region"
      aria-label="Featured products carousel"
      tabIndex={0}
    >
      <div className="px-0 pt-10 flex justify-center">
        <Swiper
          modules={[Autoplay, EffectFade, Keyboard]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 15000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={2000}
          keyboard={{ enabled: true, onlyInViewport: true }}
          className="w-full relative"
          onSlideChange={handleSlideChange}
          onSwiper={handleSwiperInit}
          allowTouchMove={!isTransitioning}
          a11y={{
            enabled: true,
            prevSlideMessage: "Previous slide",
            nextSlideMessage: "Next slide",
            paginationBulletMessage: "Go to slide {{index}}",
          }}
        >
          {visibleBanners.map((banner, index) => (
            <SwiperSlide key={banner._id}>
              <div className="flex flex-col lg:flex-row-reverse items-start gap-0 lg:gap-16 overflow-visible">
                {/* ─ IMAGE SECTION ─ */}
                <div className="w-full lg:w-1/2 relative min-h-[500px] lg:min-h-[600px] flex flex-col justify-center items-center">
                  {/* Decorative circle - simplified */}
                  <motion.div
                    className="absolute h-[300px] w-[300px] md:h-[450px] md:w-[450px] top-[6%] lg:top-10 left-0 -translate-y-1/2 rounded-full"
                    style={{
                      backgroundColor: `${DESIGN_SYSTEM.colors.accent}15`,
                      boxShadow: `inset 0 0 0 1px ${DESIGN_SYSTEM.colors.accent}30`,
                    }}
                    initial={{ scale: 0.9 }}
                    animate={{
                      scale: [1, 1.02, 1],
                      transition: {
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                      },
                    }}
                    aria-hidden="true"
                  />

                  {/* Banner image */}
                  <motion.div
                    initial={{ opacity: 0, x: 40, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: {
                        duration: 0.8,
                        ease: "easeOut",
                      },
                    }}
                    exit={{ opacity: 0, x: -40 }}
                    className="absolute top-[-10px] left-[-10px] h-full z-10"
                  >
                    <Link
                      to={getBannerLink(banner)}
                      className="block h-full w-full group"
                      aria-label={`View ${banner.banner_name || "featured product"}`}
                    >
                      <motion.img
                        src={banner.banner_image}
                        alt={banner.banner_name || "Featured product"}
                        className="w-[90%] h-[90%] object-contain"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          transition: { delay: 0.2, duration: 0.6 },
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileFocus={{ scale: 1.03 }}
                      />
                    </Link>
                  </motion.div>
                </div>

                {/* ─ CONTENT SECTION ─ */}
                <div className="w-[90%] lg:w-1/2 space-y-6 lg:pr-8 py-0">
                  <AnimatePresence mode="wait">
                    {activeIndex === index && (
                      <motion.div
                        key={`content-${index}`}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ staggerChildren: 0.1 }}
                        className="flex flex-col justify-start gap-8"
                      >
                        {/* Tag badge */}
                        {banner.tag && (
                          <motion.div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit font-medium text-sm"
                            style={{
                              backgroundColor: `${DESIGN_SYSTEM.colors.accent}20`,
                              color: DESIGN_SYSTEM.colors.dark,
                              border: `1px solid ${DESIGN_SYSTEM.colors.accent}40`,
                            }}
                            variants={{
                              hidden: { opacity: 0, y: 10 },
                              visible: {
                                opacity: 1,
                                y: 0,
                                transition: {
                                  duration: 0.4,
                                  ease: "easeOut",
                                },
                              },
                            }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <motion.div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: DESIGN_SYSTEM.colors.accent }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 }}
                            />
                            <span>{banner.tag}</span>
                          </motion.div>
                        )}

                        {/* Heading - Swiss Modernism inspired */}
                        <motion.h1
                          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                          style={{ color: DESIGN_SYSTEM.colors.dark }}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              transition: { duration: 0.5 },
                            },
                            exit: { opacity: 0, y: -10 },
                          }}
                        >
                          {renderAnimatedTitle(banner.banner_name)}
                        </motion.h1>

                        {/* Features list */}
                        {Array.isArray(banner.feature) && banner.feature.length > 0 && (
                          <motion.ul
                            className="grid grid-cols-2 gap-4"
                            variants={{
                              hidden: { opacity: 0 },
                              visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.08 },
                              },
                            }}
                          >
                            {banner.feature.map((feature, i) => (
                              <motion.li
                                key={i}
                                className="flex items-start gap-3 text-sm md:text-base"
                                style={{ color: DESIGN_SYSTEM.colors.muted }}
                                variants={{
                                  hidden: { opacity: 0, x: -10 },
                                  visible: {
                                    opacity: 1,
                                    x: 0,
                                    transition: { type: "spring", stiffness: 100 },
                                  },
                                }}
                                whileHover={{ x: 3 }}
                              >
                                <motion.svg
                                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  style={{ color: DESIGN_SYSTEM.colors.accent }}
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ delay: 0.3 + i * 0.08 }}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M5 13l4 4L19 7"
                                  />
                                </motion.svg>
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.35 + i * 0.08 }}
                                >
                                  {feature}
                                </motion.span>
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}

                        {/* Rating */}
                        {banner.rating && (
                          <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                          >
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <motion.svg
                                  key={i}
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  style={{ color: DESIGN_SYSTEM.colors.accent }}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.65 + i * 0.06 }}
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </motion.svg>
                              ))}
                            </div>
                            <motion.span
                              className="text-sm font-medium"
                              style={{ color: DESIGN_SYSTEM.colors.muted }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.9 }}
                            >
                              {banner.rating}
                            </motion.span>
                          </motion.div>
                        )}

                        {/* CTA Button - Improved accessibility and interaction feedback */}
                        <motion.div
                          className="flex flex-col sm:flex-row gap-6 pt-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.0 }}
                        >
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                              to={getBannerLink(banner)}
                              className="relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-base rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                              style={{
                                backgroundColor: DESIGN_SYSTEM.colors.accent,
                                color: DESIGN_SYSTEM.colors.dark,
                                focusRingColor: DESIGN_SYSTEM.colors.accent,
                              }}
                              aria-label={`${getButtonText(banner)} - ${banner.banner_name || "Featured product"}`}
                            >
                              <motion.svg
                                viewBox="0 0 24 24"
                                className="w-5 h-5 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                animate={{
                                  x: [0, 3, 0],
                                  transition: {
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: 1.2,
                                  },
                                }}
                              >
                                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                              </motion.svg>
                              <span>{getButtonText(banner)}</span>
                            </Link>
                          </motion.div>

                          {/* Secondary text */}
                          <motion.span
                            className="flex items-center text-sm font-medium"
                            style={{ color: DESIGN_SYSTEM.colors.dark }}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2 }}
                            animate={{
                              color: [
                                DESIGN_SYSTEM.colors.dark,
                                DESIGN_SYSTEM.colors.accent,
                                DESIGN_SYSTEM.colors.dark,
                              ],
                              transition: {
                                duration: 2,
                                repeat: Infinity,
                                delay: 1.4,
                              },
                            }}
                          >
                            {banner.is_reward ? "🎁 Exclusive Reward!" : "✨ Join Our Family!"}
                          </motion.span>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ─ NAVIGATION BUTTONS (with improved accessibility) ─ */}
        {visibleBanners.length > 1 && (
          <>
            <button
              className="banner-prev hidden lg:flex items-center justify-center absolute left-[-100px] top-1/2 z-10 -translate-y-1/2 p-3 rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:shadow-lg"
              style={{
                backgroundColor: DESIGN_SYSTEM.colors.light,
                boxShadow: DESIGN_SYSTEM.shadows.md,
                focusRingColor: DESIGN_SYSTEM.colors.primary,
              }}
              aria-label="Previous slide"
              title="Previous slide (Arrow Left)"
              disabled={isBeginning || isTransitioning}
              onClick={handlePrev}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: DESIGN_SYSTEM.colors.dark }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              className="banner-next hidden lg:flex items-center justify-center absolute right-4 top-1/2 z-10 -translate-y-1/2 p-3 rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:shadow-lg"
              style={{
                backgroundColor: DESIGN_SYSTEM.colors.light,
                boxShadow: DESIGN_SYSTEM.shadows.md,
                focusRingColor: DESIGN_SYSTEM.colors.primary,
              }}
              aria-label="Next slide"
              title="Next slide (Arrow Right)"
              disabled={isEnd || isTransitioning}
              onClick={handleNext}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: DESIGN_SYSTEM.colors.dark }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CarouselBanner;

import { useNavigate } from "react-router-dom";
import { getsubcat } from "../../helper/api_helper";
import _ from "lodash";

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM
// ─────────────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════════════════════
// LOADING SKELETON
// ─────────────────────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div
    className="w-full"
    role="status"
    aria-label="Loading carousel"
  >
    <div
      className="w-full animate-pulse rounded-2xl mx-auto"
      style={{
        height: "clamp(160px, 30vw, 288px)",
        background: `${DESIGN_SYSTEM.colors.primary}33`,
      }}
    />
    <div className="flex justify-center gap-2 mt-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ background: `${DESIGN_SYSTEM.colors.primary}66` }}
        />
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// SUB CATEGORY CAROUSEL (MOBILE)
// ─────────────────────────────────────────────────────────────────────────
export const SubCategoryBannerCarousel = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [touchDelta, setTouchDelta] = useState(0);

  const autoPlayRef = useRef(null);
  const startXRef = useRef(null);
  const navigate = useNavigate();

  // ─ Fetch subcategories ─
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setIsLoading(true);
        const response = await getsubcat();
        const subcategorie = _.get(response, "data.data", []);
        const filtered = (subcategorie?.data || subcategorie || []).filter(
          (item) => item.show && item.sub_category_banner_image
        );
        setSubCategories(filtered);
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubCategories();
  }, []);

  // ─ Auto-play ─
  useEffect(() => {
    if (subCategories.length <= 1 || isDragging) return;

    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % subCategories.length);
    }, 4000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [subCategories.length, isDragging]);

  // ─ Navigation ─
  const goToSlide = (index) => {
    setActiveIndex(index);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  // ─ Banner click handler ─
  const handleBannerClick = (item) => {
    if (!isDragging && item.main_category_details?.[0]?.slug && item.slug) {
      navigate(`/category/${item.main_category_details[0].slug}/${item.slug}`);
    }
  };

  // ─ TOUCH HANDLERS ─
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(false);
    setTouchDelta(0);
  };

  const handleTouchMove = (e) => {
    if (startXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const delta = startXRef.current - currentX;
    setTouchDelta(delta);

    // Visual feedback at 10px
    if (Math.abs(delta) > 10) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = (e) => {
    if (startXRef.current === null) return;

    const finalDelta = startXRef.current - e.changedTouches[0].clientX;
    const threshold = 50; // Improved from 40

    if (Math.abs(finalDelta) > threshold) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }

      if (finalDelta > 0) {
        // Dragged left → next
        setActiveIndex((prev) => (prev + 1) % subCategories.length);
      } else {
        // Dragged right → previous
        setActiveIndex((prev) =>
          prev === 0 ? subCategories.length - 1 : prev - 1
        );
      }
    }

    // Reset
    startXRef.current = null;
    setIsDragging(false);
    setTouchDelta(0);
  };

  // ─ Render ─
  if (isLoading) return <LoadingSkeleton />;
  if (!subCategories.length) return null;

  const currentCategory = subCategories[activeIndex];

  return (
    <div
      className="w-full overflow-hidden"
      role="region"
      aria-label="Featured subcategories carousel"
      aria-live="polite"
      aria-current={`${activeIndex + 1} of ${subCategories.length}`}
    >
      {/* Carousel container */}
      <div
        className="relative w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{
              duration: DESIGN_SYSTEM.animation.normal / 1000,
              ease: "easeOut",
            }}
            className="w-full"
            onClick={() => handleBannerClick(currentCategory)}
            draggable={false}
          >
            {/* Banner image container */}
            <div
              className="relative w-full overflow-hidden shadow-md group rounded-xl"
              style={{
                height: "clamp(160px, 30vw, 288px)",
              }}
            >
              {/* Image */}
              <motion.img
                fetchPriority="high"
                loading="eager"
                src={currentCategory.sub_category_banner_image}
                alt={currentCategory.sub_category_name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: DESIGN_SYSTEM.animation.fast / 1000 }}
              />

              {/* Overlay gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${DESIGN_SYSTEM.colors.overlay}, ${DESIGN_SYSTEM.colors.overlay}66, transparent)`,
                }}
                aria-hidden="true"
              />

              {/* Content */}
              <motion.div
                className="absolute inset-0 flex flex-col justify-between p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: DESIGN_SYSTEM.animation.fast / 1000,
                }}
              >
                {/* Spacer */}
                <div />

                {/* Bottom content */}
                <div className="flex items-end justify-between gap-3">
                  {/* Category name */}
                  <motion.h3
                    className="text-base sm:text-base font-semibold text-white line-clamp-2"
                    style={{
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: (DESIGN_SYSTEM.animation.fast * 1.2) / 1000,
                    }}
                  >
                    {currentCategory.sub_category_name}
                  </motion.h3>

                  {/* Explore badge */}
                  <motion.button
                    className="px-3 py-1 rounded-full text-xs font-medium text-black whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: DESIGN_SYSTEM.colors.accent,
                      focusRingColor: DESIGN_SYSTEM.colors.primary,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: (DESIGN_SYSTEM.animation.fast * 1.5) / 1000,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Explore ${currentCategory.sub_category_name}`}
                  >
                    Explore →
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      {subCategories.length > 1 && (
        <>
          <div
            className="flex justify-center items-center gap-2 mt-6"
            role="tablist"
            aria-label="Carousel pagination"
          >
            {subCategories.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                role="tab"
                aria-current={index === activeIndex}
                aria-label={`Go to slide ${index + 1}`}
                className="rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor:
                    index === activeIndex
                      ? DESIGN_SYSTEM.colors.accent
                      : "#d1d5db",
                  width: index === activeIndex ? "20px" : "8px",
                  height: "7px",
                  focusRingColor: DESIGN_SYSTEM.colors.primary,
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          {/* Slide counter */}
          <motion.div
            className="text-center mt-4 text-xs font-medium"
            style={{ color: DESIGN_SYSTEM.colors.primary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {activeIndex + 1} of {subCategories.length}
          </motion.div>
        </>
      )}
    </div>
  );
};



