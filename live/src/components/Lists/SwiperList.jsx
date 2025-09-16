// /* eslint-disable no-unused-vars */
// /* eslint-disable react/prop-types */
// import React, { useRef, useState } from "react";
// import SimpleProductCard from "../Product/SimpleProductCard";
// import ProductCard from "../Product/ProductCard";
// import DividerCards from "../cards/DividerCards";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay, Navigation } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/navigation";
// import ProductCard2 from "../Product/ProductCard2";
// import ProductCard3 from "../Product/ProductCard3";
// import ThreeStep from "../banner/ThreeStep";
// import Banear from "../../assets/mockup/water_bottles.png";
// import Carry_bag from "../../assets/mockup/women_with_bags.png";
// import Big_sale from "../../assets/mockup/big_sale.png";

// const SwiperList = ({
//   data = [],
//   title = "",
//   type = "Category",
//   productCardType = "Modern",
//   subtitle = "",
//   to = "",
//   left = true,
//   product_type,
// }) => {
//   const products = data;
//   const swiperRef = useRef(null);
//   const [isBeginning, setIsBeginning] = useState(true);
//   const [isEnd, setIsEnd] = useState(false);
  

//   const handleSlideChange = (swiper) => {
//     setIsBeginning(swiper.isBeginning);
//     setIsEnd(swiper.isEnd);
//   };

//   const handleSwiperInit = (swiper) => {
//     swiperRef.current = swiper;
//     setIsBeginning(swiper.isBeginning);
//     setIsEnd(swiper.isEnd);
//   };

//   const GET_PRODUCT_DISPLAY_TYPE = ({ data }) => {
//     switch (product_type) {
//       case "1":
//         return (
//           <div className="relative">
//             <div className="">
//               <SimpleProductCard data={data} />
//             </div>
//           </div>
//         );
//       case "2":
//         return (
//           <div className="relative">
//             <SimpleProductCard data={data} />
//           </div>
//         );
//       case "3":
//         return <ProductCard3 data={data} />;

//       default:
//         return <SimpleProductCard data={data} />;
//     }
//   };

//   const PRODUCT_TYPE_CONFIG = {
//     1: {
//       component: SimpleProductCard,
//       slidesPerView: {
//         default: 1,
//         640: 2,
//         768: 3,
//         1024: 4,
//         1440: 5,
//       },
//     },
//     2: {
//       component: ProductCard2,
//       slidesPerView: {
//         default: 1,
//         640: 2,
//         768: 3,
//         1024: 4,
//         1440: 5,
//       },
//     },
//     3: {
//       component: ProductCard3,
//       slidesPerView: {
//         default: 1,
//         640: 1,
//         768: 2,
//         1024: 3,
//         1440: 4,
//       },
//       requiresBanner: true,
//     },
//     default: {
//       component: SimpleProductCard,
//       slidesPerView: {
//         default: 1,
//         640: 2,
//         768: 3,
//         1024: 4,
//         1440: 5,
//       },
//     },
//   };

//   const config =
//     PRODUCT_TYPE_CONFIG[product_type] || PRODUCT_TYPE_CONFIG.default;

//   return (
//     <div>
//       {product_type === "2" && (
//         <div className=" my-10">
//           {" "}
//           <Bannear />
//         </div>
//       )}
//       {product_type === "3" && (
//         <div className="my-20">
//           {" "}
//           <ThreeStep />
//         </div>
//       )}
//       <div className="lg:px-20 px-2 ">
//         {title && (
//           <DividerCards name={title} subtitle={subtitle} to={to} left={left} />
//         )}
//         <div className="relative">
          
//           <Swiper
//             spaceBetween={20}
//             breakpoints={{
//               0: {
//                 slidesPerView: config.slidesPerView.default,
//               },
//               640: {
//                 slidesPerView: config.slidesPerView[640],
//               },
//               768: {
//                 slidesPerView: config.slidesPerView[768],
//               },
//               1024: {
//                 slidesPerView: config.slidesPerView[1024],
//               },
//               1440: {
//                 slidesPerView: config.slidesPerView[1440],
//               },
//             }}
//             className="w-full lg:!py-5 !rounded-lg overflow-visible"
//             modules={[Autoplay, Navigation]}
//             autoplay={{
//               delay: 5000,
//               disableOnInteraction: true,
//               pauseOnMouseEnter: true,
//             }}
//             speed={2000}
//             navigation={{
//               prevEl: ".banner-prev",
//               nextEl: ".banner-next",
//             }}
//             onSlideChange={handleSlideChange}
//             onSwiper={handleSwiperInit}
//           >
//             {products.map((product, index) => {
//               return (
//                 <SwiperSlide key={index} className="">
//                   <GET_PRODUCT_DISPLAY_TYPE data={product} />
//                 </SwiperSlide>
//               );
//             })}
//           </Swiper>

//           {/* Navigation Buttons */}
//           {!isBeginning && (
//             <button
//               className="banner-prev hidden lg:block absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
//               aria-label="Previous slide"
//               onClick={() => swiperRef.current?.slidePrev()}
//             >
//               <svg
//                 className="w-6 h-6 text-gray-800"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M15 19l-7-7 7-7"
//                 />
//               </svg>
//             </button>
//           )}
          
//           {!isEnd && (
//             <button
//               className="banner-next hidden lg:block absolute right-[-10px] top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
//               aria-label="Next slide"
//               onClick={() => swiperRef.current?.slideNext()}
//             >
//               <svg
//                 className="w-6 h-6 text-gray-800"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M9 5l7 7-7 7"
//                 />
//               </svg>
//             </button>
//           )}
//         </div>
//       </div>
      
//     </div>
//   );
// };

// export default SwiperList;

// import { motion } from "framer-motion";

// export const Bannear = () => {
//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.2,
//         delayChildren: 0.3,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         duration: 0.6,
//         ease: "easeOut",
//       },
//     },
//   };

//   const buttonVariants = {
//     hover: {
//       scale: 1.05,
//       boxShadow: "0 10px 20px rgba(249, 193, 20, 0.2)",
//       transition: {
//         duration: 0.3,
//         yoyo: Infinity,
//         ease: "easeInOut",
//       },
//     },
//     tap: {
//       scale: 0.98,
//     },
//   };

//   return (
//     <div className="w-full  banear__section relative z-0  mb-20 py-2">
//       <div className="absolute h-full w-full bg-[#1c1c1c94] z-1 top-0"></div>
//       <div className="max-w-[90%] mx-auto">
//         <motion.div
//           className="flex flex-col md:flex-row h-[70vh] items-center justify-between gap-12 p-6 rounded-xl  relative"
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, margin: "-100px" }}
//           variants={containerVariants}
//         >
//           {/* Left Image - Hidden on mobile */}
//           <motion.div
//             className="hidden md:block flex-shrink-0"
//             variants={itemVariants}
//           >
//             <motion.img
//               src={Banear}
//               alt="Printing business illustration"
//               className="w-auto h-[500px] object-contain"
//               whileHover={{ scale: 1.05 }}
//               transition={{ type: "spring", stiffness: 300 }}
//             />
//           </motion.div>

//           {/* Content Section */}
//           <motion.div
//             className="flex-1 text-center md:text-left space-y-4 "
//             variants={containerVariants}
//           >
//             <motion.h1
//               className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#f8f8f8] leading-tight"
//               variants={itemVariants}
//             >
//               Take Your{" "}
//               <motion.span
//                 className="text-[#f2c41a]"
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 Printing Business
//               </motion.span>{" "}
//               to the Next Level
//             </motion.h1>

//             <motion.p
//               className="text-[#f8f8f8] text-lg"
//               variants={itemVariants}
//             >
//               Premium, high-performance solutions designed for professional
//               printers seeking to enhance productivity, improve print quality,
//               and expand their service offerings with cutting-edge technology
//               and reliable innovation.
//             </motion.p>

//             <motion.button
//               className="mt-4 bg-[#f2c41a] hover:bg-[#e0b010] text-[#1a1a1a] font-semibold py-3 px-8 rounded-lg shadow-md hover:text-white"
//               // variants={itemVariants}
//               whileHover="hover"
//               whileTap="tap"
//               variants={buttonVariants}
//             >
//               Unlock Growth Now
//               <motion.span
//                 className="ml-2 inline-block"
//                 animate={{
//                   x: [0, 4, 0],
//                   transition: {
//                     duration: 1.5,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                   },
//                 }}
//               >
//                 →
//               </motion.span>
//             </motion.button>
//           </motion.div>

//           {/* Right Image - Hidden on mobile */}
//           <motion.div
//             className="hidden md:block flex-shrink-0 absolute bottom-[-150px] right-[300px] z-10 single_product "
//             variants={itemVariants}
//           >
//             <motion.img
//               src={Carry_bag}
//               alt="Printing business illustration"
//               className="w-auto h-[350px] object-contain "
//               whileHover={{ scale: 1.05 }}
//               transition={{ type: "spring", stiffness: 300 }}
//             />
//           </motion.div>
//           <motion.div
//             className="hidden md:block flex-shrink-0 absolute bottom-[-150px] delay-150 right-[100px] z-10 single_product_right "
//             variants={itemVariants}
//           >
//             <motion.img
//               src={Big_sale}
//               alt="Printing business illustration"
//               className="w-auto h-[350px] object-contain "
//               whileHover={{ scale: 1.05 }}
//               transition={{ type: "spring", stiffness: 300 }}
//             />
//           </motion.div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useRef, useState } from "react";
import SimpleProductCard from "../Product/SimpleProductCard";
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

const SwiperList = ({
  data = [],
  title = "",
  type = "Category",
  productCardType = "Modern",
  subtitle = "",
  to = "",
  left = true,
  product_type,
}) => {
  const products = data;
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handleSwiperInit = (swiper) => {
    swiperRef.current = swiper;
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const GET_PRODUCT_DISPLAY_TYPE = ({ data }) => {
    switch (product_type) {
      case "1":
        return (
          <div className="relative">
            <div className="">
              <SimpleProductCard data={data} />
            </div>
          </div>
        );
      case "2":
        return (
          <div className="relative">
            <SimpleProductCard data={data} />
          </div>
        );
      case "3":
        return <ProductCard3 data={data} />;

      default:
        return <SimpleProductCard data={data} />;
    }
  };

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
    },
    2: {
      component: ProductCard2,
      slidesPerView: {
        default: 1,
        640: 2,
        768: 3,
        1024: 4,
        1440: 5,
      },
    },
    3: {
      component: ProductCard3,
      slidesPerView: {
        default: 1,
        640: 1,
        768: 2,
        1024: 3,
        1440: 4,
      },
      requiresBanner: true,
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
    },
  };

  const config =
    PRODUCT_TYPE_CONFIG[product_type] || PRODUCT_TYPE_CONFIG.default;

  return (
    <div>
      {product_type === "2" && (
        <div className=" my-10">
          <Bannear />
        </div>
      )}
      {product_type === "3" && (
        <div className="my-20">
          <ThreeStep />
        </div>
      )}
      <div className="lg:px-20 px-4"> {/* Changed from px-1 to px-4 for better mobile padding */}
        {title && (
          <DividerCards name={title} subtitle={subtitle} to={to} left={left} />
        )}
        <div className="relative">
          
          <Swiper
            spaceBetween={10} 
            breakpoints={{
              0: {
                slidesPerView: config.slidesPerView.default,
                spaceBetween: 15, // Increased spaceBetween for mobile
              },
              640: {
                slidesPerView: config.slidesPerView[640],
                spaceBetween: 15,
              },
              768: {
                slidesPerView: config.slidesPerView[768],
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: config.slidesPerView[1024],
                spaceBetween: 20,
              },
              1440: {
                slidesPerView: config.slidesPerView[1440],
                spaceBetween: 20,
              },
            }}
            className="w-full lg:!py-5 !rounded-lg overflow-visible"
            modules={[Autoplay, Navigation]}
            autoplay={{
              delay: 5000,
              disableOnInteraction: true,
              pauseOnMouseEnter: true,
            }}
            speed={2000}
            navigation={{
              prevEl: ".banner-prev",
              nextEl: ".banner-next",
            }}
            onSlideChange={handleSlideChange}
            onSwiper={handleSwiperInit}
          >
            {products.map((product, index) => {
              return (
                <SwiperSlide key={index} className="px-1.5"> {/* Increased padding for mobile */}
                  <GET_PRODUCT_DISPLAY_TYPE data={product} />
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Navigation Buttons */}
          {!isBeginning && (
            <button
              className="banner-prev hidden lg:block absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
              aria-label="Previous slide"
              onClick={() => swiperRef.current?.slidePrev()}
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          
          {!isEnd && (
            <button
              className="banner-next hidden lg:block absolute right-[-10px] top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
              aria-label="Next slide"
              onClick={() => swiperRef.current?.slideNext()}
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default SwiperList;

import { motion } from "framer-motion";

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
    <div className="w-full  banear__section relative z-0  mb-20 py-2">
      <div className="absolute h-full w-full bg-[#1c1c1c94] z-1 top-0"></div>
      <div className="max-w-[90%] mx-auto">
        <motion.div
          className="flex flex-col md:flex-row lg:h-[55vh] items-center justify-between gap-12 p-6 rounded-xl  relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Left Image - Hidden on mobile */}
          <motion.div
            className="hidden md:block flex-shrink-0"
            variants={itemVariants}
          >
            <motion.img
              src={Banear}
              alt="Printing business illustration"
              className="w-auto h-[300px] lg:h-[500px] object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          {/* Content Section */}
          <motion.div
            className="flex-1 text-center md:text-left space-y-4 "
            variants={containerVariants}
          >
            <motion.h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#f8f8f8] leading-tight"
              variants={itemVariants}
            >
              Take Your{" "}
              <motion.span
                className="text-[#f2c41a]"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Printing Business
              </motion.span>{" "}
              to the Next Level
            </motion.h1>

            <motion.p
              className="text-[#f8f8f8] text-lg"
              variants={itemVariants}
            >
              Premium, high-performance solutions designed for professional
              printers seeking to enhance productivity, improve print quality,
              and expand their service offerings with cutting-edge technology
              and reliable innovation.
            </motion.p>

            <motion.button
              className="mt-4 bg-[#f2c41a] hover:bg-[#e0b010] text-[#1a1a1a] font-semibold py-3 px-8 rounded-lg shadow-md hover:text-white"
              // variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              Unlock Growth Now
              <motion.span
                className="ml-2 inline-block"
                animate={{
                  x: [0, 4, 0],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                →
              </motion.span>
            </motion.button>
          </motion.div>

          {/* Right Image - Hidden on mobile */}
          <motion.div
            className="hidden lg:block flex-shrink-0 absolute bottom-[-150px] right-[300px] z-10 single_product "
            variants={itemVariants}
          >
            <motion.img
              src={Carry_bag}
              alt="Printing business illustration"
              className="w-auto h-[300px] object-contain "
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>
          <motion.div
            className="hidden lg:block flex-shrink-0 absolute bottom-[-150px] delay-150 right-[100px] z-10 single_product_right "
            variants={itemVariants}
          >
            <motion.img
              src={Big_sale}
              alt="Printing business illustration"
              className="w-auto h-[300px] object-contain "
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
