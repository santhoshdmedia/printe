import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─── Loading Skeleton ────────────────────────────────────────────────────────
const BannerLoadingSkeleton = () => (
  <div
    className="relative w-full flex items-center justify-center overflow-hidden"
    style={{
      height: "clamp(320px, 55vw, 500px)",
      background: "#b5a48a",
    }}
  >
    <div className="animate-pulse flex flex-col items-center gap-4 w-full px-8">
      <div className="h-3 w-28 bg-white/20 rounded" />
      <div className="h-10 sm:h-14 w-3/4 bg-white/20 rounded" />
      <div className="h-40 sm:h-56 md:h-72 w-56 sm:w-72 bg-white/20 rounded-xl" />
      <div className="h-3 w-44 bg-white/20 rounded" />
      <div className="h-8 w-28 bg-white/20 rounded-full" />
    </div>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getBannerLink = (banner, user) => {
  if (banner.is_reward && (!user || !user.name)) return "/login";
  return `/${banner.banner_slug || ""}`;
};

const getButtonText = (banner) => {
  if (banner.is_reward) return "Claim Reward";
  const tag = banner.tag?.toLowerCase() || "";
  if (tag.includes("exclusive") || tag.includes("launch")) return "Claim Now";
  return "Discover More";
};

// ─── Dot Nav ──────────────────────────────────────────────────────────────────
const DotNav = ({ count, active, onSelect }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    {Array.from({ length: count }).map((_, i) => (
      <button
        key={i}
        onClick={() => onSelect(i)}
        aria-label={`Slide ${i + 1}`}
        style={{
          width: i === active ? 24 : 6,
          height: 6,
          borderRadius: 9999,
          background: i === active ? "#fff" : "rgba(255,255,255,0.35)",
          border: "none",
          padding: 0,
          cursor: "pointer",
          transition: "width 0.4s ease, background 0.4s ease",
        }}
      />
    ))}
  </div>
);

// ─── Arrow Button ─────────────────────────────────────────────────────────────
const ArrowBtn = ({ direction, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
    style={{
      width: 32,
      height: 32,
      borderRadius: "50%",
      border: "1.5px solid rgba(255,255,255,0.5)",
      background: "rgba(255,255,255,0.12)",
      backdropFilter: "blur(4px)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.3 : 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 0.2s, opacity 0.2s",
      color: "#fff",
      flexShrink: 0,
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.background = "rgba(255,255,255,0.25)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "rgba(255,255,255,0.12)";
    }}
  >
    {direction === "prev" ? (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 19l-7-7 7-7" />
      </svg>
    ) : (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5l7 7-7 7" />
      </svg>
    )}
  </button>
);

// ─── Hook: breakpoint ─────────────────────────────────────────────────────────
const useBreakpoint = () => {
  const [bp, setBp] = useState(() => {
    if (typeof window === "undefined") return "md";
    const w = window.innerWidth;
    if (w < 480) return "xs";
    if (w < 768) return "sm";
    if (w < 1024) return "md";
    return "lg";
  });

  useEffect(() => {
    const handler = () => {
      const w = window.innerWidth;
      if (w < 480) setBp("xs");
      else if (w < 768) setBp("sm");
      else if (w < 1024) setBp("md");
      else setBp("lg");
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return bp;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CarouselBanner = () => {
  const dispatch = useDispatch();
  const { banners, isGettingBanners } = useSelector((state) => state.publicSlice);
  const { user } = useSelector((state) => state.authSlice);

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const autoPlayRef = useRef(null);
  const bp = useBreakpoint();

  // Responsive values
  const isMobile = bp === "xs" || bp === "sm";
  const isTablet = bp === "md";

  const bannerHeight = isMobile
    ? "clamp(580px, 55vw, 460px)"
    : isTablet
    ? "55vh"
    : "83vh";

  const imageHeight = isMobile ? 170 : isTablet ? 220 : 400;
  const peekImageHeight = isMobile ? 100 : isTablet ? 140 : 180;
  const ghostTitleSize = isMobile
    ? "clamp(52px, 10vw, 604px)"
    : isTablet
    ? "clamp(60px, 10vw, 800px)"
    : "clamp(60px, 10vw, 800px)";

  useEffect(() => {
    dispatch({ type: "GET_BANNERS" });
  }, [dispatch]);

  const visibleBanners = banners
    ? banners
        .filter((b) => {
          if (b.is_visible === false) return false;
          if (b.expiry_date && new Date(b.expiry_date) <= new Date()) return false;
          return true;
        })
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
    : [];

  const startAutoPlay = useCallback(() => {
    clearInterval(autoPlayRef.current);
    if (visibleBanners.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % visibleBanners.length);
    }, 6000);
  }, [visibleBanners.length]);

  useEffect(() => {
    startAutoPlay();
    return () => clearInterval(autoPlayRef.current);
  }, [startAutoPlay]);

  // Touch/swipe support
  const startXRef = useRef(null);

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (startXRef.current === null) return;
    const diff = startXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      clearInterval(autoPlayRef.current);
      if (diff > 0) {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % visibleBanners.length);
      } else {
        setDirection(-1);
        setActiveIndex((prev) => (prev === 0 ? visibleBanners.length - 1 : prev - 1));
      }
      startAutoPlay();
    }
    startXRef.current = null;
  };

  const goTo = (index) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    startAutoPlay();
  };

  const goPrev = () => {
    if (activeIndex === 0) return;
    setDirection(-1);
    setActiveIndex((prev) => prev - 1);
    startAutoPlay();
  };

  const goNext = () => {
    if (activeIndex === visibleBanners.length - 1) return;
    setDirection(1);
    setActiveIndex((prev) => prev + 1);
    startAutoPlay();
  };

  if (isGettingBanners) return <BannerLoadingSkeleton />;
  if (!visibleBanners.length) return null;

  const banner = visibleBanners[activeIndex];

  // ── Animation variants ─────────────────────────────────────────────────────
  const titleVariants = {
    enter: (dir) => ({ y: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { y: 0, opacity: 1, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
    exit: (dir) => ({ y: dir > 0 ? -25 : 25, opacity: 0, transition: { duration: 0.3 } }),
  };

  const metaVariants = {
    enter: { opacity: 0, y: 10 },
    center: { opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.1 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
  };

  const imageVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.94 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 } },
    exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0, scale: 0.96, transition: { duration: 0.35 } }),
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: bannerHeight,
        background: "#f2c41a",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      className={`${isMobile ? 'pt-20':'pt-0'}`}
      onMouseEnter={() => clearInterval(autoPlayRef.current)}
      onMouseLeave={() => startAutoPlay()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      }} />

      {/* ── ROW 1: Top tag bar ── */}
      <div style={{
        position: "relative", zIndex: 2, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "10px 16px 4px" : "14px 24px 6px",
        gap: 10,
        fontWeight: 1000,
        color: "rgba(255,255,255,0.8)",
        fontSize: isMobile ? 8 : 20,
        letterSpacing: "0.18em", textTransform: "uppercase",
      }}>
        <div style={{ height: 1, width: isMobile ? 24 : 36, background: "rgba(255,255,255,0.4)" }} />
        <AnimatePresence mode="wait">
          <motion.span key={`tag-${activeIndex}`} variants={metaVariants} initial="enter" animate="center" exit="exit">
            {banner.tag || "Collection"}
          </motion.span>
        </AnimatePresence>
        <div style={{ height: 1, width: isMobile ? 24 : 36, background: "rgba(255,255,255,0.4)" }} />
      </div>

      {/* ── ROW 2: Meta (origin / year) ── */}
      <div style={{
        position: "relative", zIndex: 2, flexShrink: 0,
        maxWidth: 1100, width: "100%", margin: "0 auto",
        padding: isMobile ? "2px 16px" : "4px 32px",
      }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`meta-${activeIndex}`}
            custom={direction}
            variants={metaVariants}
            initial="enter" animate="center" exit="exit"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: isMobile ? 7 : 15,
              letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500,
            }}>
              {banner.origin || "Premium Collection"}
            </span>
            <span style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: isMobile ? 9 : 15,
              letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500,
            }}>
              {banner.year_range || new Date().getFullYear()}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── ROW 3: Ghost title ── */}
      <div style={{
        position: "relative", zIndex: 1, flexShrink: 0,
        maxWidth: 1100, width: "100%", margin: "0 auto",
        padding: isMobile ? "0 12px" : "0 28px",
      }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.h1
            key={`title-${activeIndex}`}
            custom={direction}
            variants={titleVariants}
            initial="enter" animate="center" exit="exit"
            className="bebas-neue-regular text-center relative whitespace-nowrap lg:top-28 top-16"
            style={{
              fontSize: ghostTitleSize,
              fontWeight: 900,
              height: '10px',
              color: "rgb(255,255,255)",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              margin: 0,
              lineHeight: 0.9,
              userSelect: "none",
              whiteSpace: "wrap",
              // textOverflow: "ellipsis",/
            }}
          >
            {banner.banner_name || "Premium Product"}
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* ── ROW 4: Hero image ── */}
      <div style={{
        position: "relative", zIndex: 2, flexShrink: 0,
        height: imageHeight,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "visible",
      }}>
        {/* Side peek — prev (hidden on mobile) */}
        {!isMobile && visibleBanners.length > 1 && activeIndex > 0 && (
          <div style={{
            position: "absolute", left: 0, top: "50%",
            transform: "translateY(-50%)", opacity: 0.3,
            pointerEvents: "none", zIndex: 1,
          }}>
            <img
              src={visibleBanners[activeIndex - 1].banner_image}
              alt=""
              style={{ height: peekImageHeight, width: "auto", objectFit: "contain", filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.2))" }}
            />
          </div>
        )}

        {/* Main image */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`image-${activeIndex}`}
            custom={direction}
            variants={imageVariants}
            initial="enter" animate="center" exit="exit"
            style={{ position: "absolute", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center",top:-10 }}
          >
            <Link to={getBannerLink(banner, user)}>
              <motion.img
                src={banner.banner_image}
                alt={banner.banner_name || "Banner"}
                whileHover={{ scale: 1.04, y: -6 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                  height: imageHeight,
                  width: "auto",
                  maxWidth: isMobile ? "88vw" : "70vw",
                  objectFit: "contain",
                  filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.3))",
                  cursor: "pointer",
                  display: "block",
                }}
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Side peek — next (hidden on mobile) */}
        {!isMobile && visibleBanners.length > 1 && activeIndex < visibleBanners.length - 1 && (
          <div style={{
            position: "absolute", right: 0, top: "50%",
            transform: "translateY(-50%)", opacity: 0.3,
            pointerEvents: "none", zIndex: 1,
          }}>
            <img
              src={visibleBanners[activeIndex + 1].banner_image}
              alt=""
              style={{ height: peekImageHeight, width: "auto", objectFit: "contain", filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.2))" }}
            />
          </div>
        )}
      </div>

      {/* ── ROW 5: Divider + description + features + CTA ── */}
      <div style={{
        position: "relative", zIndex: 2, flex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center",
        gap: isMobile ? 6 : 10,
        padding: isMobile ? "6px 16px 0" : "8px 24px 0",
        textAlign: "center",
        overflow: "hidden",
      }}>
        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", maxWidth: isMobile ? 280 : 460 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.22)" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(255,255,255,0.7)" }} />
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.22)" }} />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`desc-${activeIndex}`}
            custom={direction}
            variants={metaVariants}
            initial="enter" animate="center" exit="exit"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: isMobile ? 4 : 8 }}
          >
            {!isMobile && banner.description && (
              <p style={{
                color: "rgba(255,255,255)",
                fontSize: isMobile ? "clamp(8px, 2.2vw, 10px)" : "clamp(19px, 1.2vw, 11px)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                lineHeight: 1.7,
                maxWidth: isMobile ? 300 : 1000,
                margin: 0,
                fontWeight: 700,
                display: "-webkit-box",
                WebkitLineClamp: isMobile ? 3 : 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {banner.description}
              </p>
            )}

            {/* Features — hidden on xs to save space */}
            { Array.isArray(banner.feature) && banner.feature.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 14px" }}>
                {banner.feature.map((f, i) => (
                  <span key={i} style={{
                    color: "rgba(255,255,255)",
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",}}>
                    ✦ {f}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <Link
          to={getBannerLink(banner, user)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: isMobile ? "7px 20px" : "9px 28px",
            border: "1px solid rgba(255,255,255,0.55)",
            borderRadius: 9999,
            color: "rgba(255,255,255,0.88)",
            fontSize: isMobile ? 9 : 15,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
             fontWeight: 600,
            textDecoration: "none",
            background: "rgba(0,0,0,0.8)",
            transition: "background 0.25s, border-color 0.25s, color 0.25s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.2)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.88)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.8)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)";
            e.currentTarget.style.color = "rgba(255,255,255,0.88)";
          }}
        >
          {getButtonText(banner)}
        </Link>
      </div>
  

      {/* ── ROW 6: Nav bar ── */}
      {visibleBanners.length > 1 && (
        <div style={{
          position: "relative", zIndex: 2, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 14,
          padding: isMobile ? "8px 16px 12px" : "10px 24px 16px",
        }}>
          <ArrowBtn direction="prev" onClick={goPrev} disabled={activeIndex === 0} />
          <DotNav count={visibleBanners.length} active={activeIndex} onSelect={goTo} />
          <ArrowBtn direction="next" onClick={goNext} disabled={activeIndex === visibleBanners.length - 1} />
        </div>
      )}
    </div>
  );
};

export default CarouselBanner;


// ─── SubCategoryBannerCarousel ────────────────────────────────────────────────
import { useNavigate } from "react-router-dom";
import { getsubcat } from "../../helper/api_helper";
import _ from "lodash";

export const SubCategoryBannerCarousel = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const autoPlayRef = useRef(null);
  const startXRef = useRef(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (subCategories.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % subCategories.length);
    }, 4000);
    return () => clearInterval(autoPlayRef.current);
  }, [subCategories.length]);

  const goToSlide = (index) => {
    clearInterval(autoPlayRef.current);
    setActiveIndex(index);
  };

  const handleBannerClick = (item) => {
    if (!isDragging) {
      navigate(`/category/${item.main_category_details[0].slug}/${item.slug}`);
    }
  };

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(false);
  };

  const handleTouchEnd = (e) => {
    if (startXRef.current === null) return;
    const diff = startXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      setIsDragging(true);
      clearInterval(autoPlayRef.current);
      if (diff > 0) {
        setActiveIndex((prev) => (prev + 1) % subCategories.length);
      } else {
        setActiveIndex((prev) => (prev === 0 ? subCategories.length - 1 : prev - 1));
      }
    }
    startXRef.current = null;
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div
          className="w-full animate-pulse rounded-2xl mx-auto"
          style={{
            height: "clamp(160px, 30vw, 288px)",
            background: "#b5a48a33",
          }}
        />
        <div className="flex justify-center gap-2 mt-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#b5a48a66" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!subCategories.length) return null;

  return (
    <div className="w-full overflow-hidden">
      <div
        className="relative w-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
            onClick={() => handleBannerClick(subCategories[activeIndex])}
          >
            <div className="relative w-full overflow-hidden shadow-md cursor-pointer rounded-xl">
              <img
                fetchpriority="high"
                loading="eager"
                src={subCategories[activeIndex].sub_category_banner_image}
                alt={subCategories[activeIndex].sub_category_name}
                style={{ width: "100%", height: "clamp(160px, 30vw, 288px)", objectFit: "cover" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <span className="text-white font-semibold text-sm sm:text-base drop-shadow">
                  {subCategories[activeIndex].sub_category_name}
                </span>
                <motion.span
                  className="text-xs text-white rounded-full px-3 py-1 font-medium"
                  style={{ background: "#b5a48a" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore →
                </motion.span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {subCategories.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-3">
          {subCategories.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                borderRadius: 9999, border: "none", padding: 0, cursor: "pointer",
                transition: "all 0.3s",
                width: i === activeIndex ? 20 : 8,
                height: 7,
                background: i === activeIndex ? "#b5a48a" : "#d1d5db",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};