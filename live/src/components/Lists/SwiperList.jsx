/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useRef, useState, useEffect, useMemo } from "react";
import SimpleProductCard from "../Product/SimpleProductCard";
import ProductCardNew from "../Product/ProductCardNew";
import ProductCard from "../Product/ProductCard";
import DividerCards from "../cards/DividerCards";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard2 from "../Product/ProductCard2";
import ProductCard3 from "../Product/ProductCard3";
import ThreeStep from "../banner/ThreeStep";
import Banear from "../../assets/mockup/water_bottles.png";
import Carry_bag from "../../assets/mockup/women_with_bags.png";
import Big_sale from "../../assets/mockup/big_sale.png";
import { motion } from "motion/react";
import QuickAccess from "../../config/QuickAccess";

const PRODUCT_TYPE_CONFIG = {
  1: {
    component: SimpleProductCard,
    slidesPerView: {
      default: 1,
      640: 2,
      768: 3,
      1024: 4,
      1440: 5,
    },
    gridCols: {
      mobile: "grid-cols-2",
      tablet: "sm:grid-cols-2",
      desktop: "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    },
  },
  2: {
    component: SimpleProductCard,
    slidesPerView: {
      default: 1,
      640: 2,
      768: 3,
      1024: 4,
      1440: 5,
    },
    gridCols: {
      mobile: "grid-cols-2",
      tablet: "sm:grid-cols-2",
      desktop: "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    },
  },
  3: {
    component: SimpleProductCard,
    slidesPerView: {
      default: 1,
      640: 2,
      768: 4,
      1024: 4,
      1440: 4,
    },
    requiresBanner: true,
    gridCols: {
      mobile: "grid-cols-2",
      tablet: "sm:grid-cols-2",
      desktop: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    },
  },
  default: {
    component: SimpleProductCard,
    slidesPerView: {
      default: 1,
      640: 2,
      768: 3,
      1024: 4,
      1440: 5,
    },
    gridCols: {
      mobile: "grid-cols-2",
      tablet: "sm:grid-cols-2",
      desktop: "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    },
  },
};

const SwiperList = ({
  data = [],
  title = "BEST SELLERS",
  type = "Category",
  productCardType = "Modern",
  subtitle = "Most Loved Products",
  to = "",
  left = true,
  product_type,
}) => {
  const products = useMemo(
    () => (data || []).filter((res) => res.is_visible == true),
    [data]
  );

  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handleSwiperInit = (swiper) => {
    swiperRef.current = swiper;
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const config = PRODUCT_TYPE_CONFIG[product_type] || PRODUCT_TYPE_CONFIG.default;

  // Render product swiper directly (no nested component function that causes unmount)
  const renderProductSwiper = () => (
    <Swiper
      onSwiper={handleSwiperInit}
      onSlideChange={handleSlideChange}
      spaceBetween={10}
      slidesPerView={2}
      breakpoints={{
        0: { slidesPerView: 2, spaceBetween: 10 },
        480: { slidesPerView: 2, spaceBetween: 12 },
        640: { slidesPerView: config.slidesPerView[640] || 2, spaceBetween: 14 },
        768: { slidesPerView: config.slidesPerView[768] || 3, spaceBetween: 16 },
        1024: { slidesPerView: config.slidesPerView[1024] || 4, spaceBetween: 18 },
        1440: { slidesPerView: config.slidesPerView[1440] || 5, spaceBetween: 20 },
      }}
      className="w-full"
      modules={[Navigation, Autoplay]}
      navigation={false}
      grabCursor={true}
      loop={products.length > 4}
      autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      speed={600}
      resistance={true}
      resistanceRatio={0.85}
    >
      {products.map((product, index) => (
        <SwiperSlide key={product._id || product.seo_url || index}>
          <ProductCardNew data={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );

  return (
    <div>
      {product_type === "1" && (
        <>
          <div className="lg:px-20 px-2">
            <DividerCards name={title || "BEST SELLERS"} subtitle={subtitle || "Most Loved Products"} to={to} left={left} />
            <div className="relative">
              {renderProductSwiper()}
            </div>
          </div>
          <div className="my-10 sm:my-16 lg:my-20">
            <ThreeStep />
          </div>
        </>
      )}

      {product_type === "2" && (
        <>
          <div className="lg:px-20 px-2">
            <DividerCards name={title || "BEST SELLERS"} subtitle={subtitle || "Most Loved Products"} to={to} left={left} />
            <div className="relative">
              {renderProductSwiper()}
            </div>
          </div>
          <div className="mt-6 sm:mt-10">
            <QuickAccess />
          </div>
        </>
      )}

      {product_type !== "1" && product_type !== "2" && (
        <div className="lg:px-20 px-2">
          <DividerCards name={title || "BEST SELLERS"} subtitle={subtitle || "Most Loved Products"} to={to} left={left} />
          <div className="relative">
            {renderProductSwiper()}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SwiperList);

export const Bannear = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(249, 193, 20, 0.2)",
      transition: {
        duration: 0.3,
        yoyo: Infinity,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <></>
    // <div className="w-full banear__section relative z-0 mb-20 py-2">
    //   <div className="absolute h-full w-full bg-[#1c1c1c94] z-1 top-0"></div>
    //   <div className="max-w-[90%] mx-auto">
    //     <motion.div
    //       className="flex flex-col md:flex-row lg:h-[55vh] items-center justify-between gap-12 p-6 rounded-xl relative"
    //       initial="hidden"
    //       whileInView="visible"
    //       viewport={{ once: true, margin: "-100px" }}
    //       variants={containerVariants}
    //     >
    //       {/* Left Image - Hidden on mobile */}
    //       <motion.div
    //         className="hidden md:block flex-shrink-0"
    //         variants={itemVariants}
    //       >
    //         <motion.img
    //           src={Banear}
    //           alt="Printing business illustration"
    //           className="w-auto h-[300px] lg:h-[500px] object-contain"
    //           whileHover={{ scale: 1.05 }}
    //           transition={{ type: "spring", stiffness: 300 }}
    //         />
    //       </motion.div>

    //       {/* Content Section */}
    //       <motion.div
    //         className="flex-1 text-center md:text-left space-y-4"
    //         variants={containerVariants}
    //       >
    //         <motion.h1
    //           className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#f8f8f8] leading-tight"
    //           variants={itemVariants}
    //         >
    //           Take Your{" "}
    //           <motion.span
    //             className="text-[#f2c41a]"
    //             whileHover={{ scale: 1.05 }}
    //             transition={{ type: "spring", stiffness: 300 }}
    //           >
    //             Printing Business
    //           </motion.span>{" "}
    //           to the Next Level
    //         </motion.h1>

    //         <motion.p
    //           className="text-[#f8f8f8] text-lg"
    //           variants={itemVariants}
    //         >
    //           Premium, high-performance solutions designed for professional
    //           printers seeking to enhance productivity, improve print quality,
    //           and expand their service offerings with cutting-edge technology
    //           and reliable innovation.
    //         </motion.p>

    //         <motion.button
    //           className="mt-4 bg-[#f2c41a] hover:bg-[#e0b010] text-[#1a1a1a] font-semibold py-3 px-8 rounded-lg shadow-md hover:text-white"
    //           whileHover="hover"
    //           whileTap="tap"
    //           variants={buttonVariants}
    //         >
    //           Unlock Growth Now
    //           <motion.span
    //             className="ml-2 inline-block"
    //             animate={{
    //               x: [0, 4, 0],
    //               transition: {
    //                 duration: 1.5,
    //                 repeat: Infinity,
    //                 ease: "easeInOut",
    //               },
    //             }}
    //           >
    //             →
    //           </motion.span>
    //         </motion.button>
    //       </motion.div>

    //       {/* Right Image - Hidden on mobile */}
    //       <motion.div
    //         className="hidden lg:block flex-shrink-0 absolute bottom-[-150px] right-[300px] z-10 single_product"
    //         variants={itemVariants}
    //       >
    //         <motion.img
    //           src={Carry_bag}
    //           alt="Printing business illustration"
    //           className="w-auto h-[300px] object-contain"
    //           whileHover={{ scale: 1.05 }}
    //           transition={{ type: "spring", stiffness: 300 }}
    //         />
    //       </motion.div>
    //       <motion.div
    //         className="hidden lg:block flex-shrink-0 absolute bottom-[-150px] delay-150 right-[100px] z-10 single_product_right"
    //         variants={itemVariants}
    //       >
    //         <motion.img
    //           src={Big_sale}
    //           alt="Printing business illustration"
    //           className="w-auto h-[300px] object-contain"
    //           whileHover={{ scale: 1.05 }}
    //           transition={{ type: "spring", stiffness: 300 }}
    //         />
    //       </motion.div>
    //     </motion.div>
    //   </div>
    // </div>
  );
};