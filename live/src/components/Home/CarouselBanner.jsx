import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import BannerLoadingSkeleton from "../LoadingSkeletons/BannerLoadingSkeleton";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import slideOne from "../../assets/mockup/slides/slide_1.png";
import slideTwo from "../../assets/mockup/slides/slide_2.png";
import slideThree from "../../assets/mockup/slides/slide_3.png";
import slideFour from "../../assets/mockup/slides/slide_4.png";
import Test from "../../assets/mockup/testimonial.png";

const CarouselBanner = () => {
  const dispatch = useDispatch();
  const { banners, isGettingBanners } = useSelector(
    (state) => state.publicSlice
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const swiperRef = useRef(null);
  const slideImages = [slideOne, slideTwo, slideThree, slideFour];

  useEffect(() => {
    dispatch({ type: "GET_BANNERS" });
    
  }, [dispatch]);

  if (isGettingBanners) {
    return <BannerLoadingSkeleton />;
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handleSwiperInit = (swiper) => {
    swiperRef.current = swiper;
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const renderAnimatedTitle = (title) => {
    const defaultTitle = "Premium Printing Solutions";
    return (title || defaultTitle).split("  ").map((word, i) => (
      <motion.span
        key={i}
        className="inline-block"
        initial={{ y: 50, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          transition: {
            duration: 0.6,
            delay: i * 0.1,
            ease: [0.16, 1, 0.3, 1],
          },
        }}
      >
        {word}{" "}
      </motion.span>
    ));
  };

  return (
    <div className="lg:w-[85%]  bg-transparent h-[100%] pt-6 lg:py-2  mx-auto relative translate-x-[5%]">
      <div className="px-0 pt-10 flex justify-center">
        <Swiper
          modules={[Autoplay, EffectFade, Navigation]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          navigation={{
            prevEl: ".banner-prev",
            nextEl: ".banner-next",
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            pauseOnHover: true
          }}
          speed={2000}
          className="w-full  relative"
          onSlideChange={handleSlideChange}
          onSwiper={handleSwiperInit}
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={banner._id}>
              <div className="flex flex-col lg:flex-row-reverse items-start gap-0 lg:gap-16 overflow-visible">
                {/* Image Section */}
                <div className="w-full lg:w-1/2 relative min-h-[500px] lg:min-h-[600px] flex flex-col justify-center items-center">
                  <motion.div
                    className="absolute h-[300px] w-[300px] md:h-[500px] md:w-[500px] top-[6%] lg:top-14 left-[8%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f2c41a]/10"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: 1,
                      transition: {
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: 0.3,
                      },
                    }}
                  >
                    <div className="absolute inset-0 rounded-full border border-[#f2c41a]/20 carousal_overlay"></div>
                  </motion.div>

                  <motion.div
                    initial={{
                      opacity: 0,
                      x: 80,
                      y: 20,
                      rotate: 8,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      y: 0,
                      rotate: 0,
                      scale: [1, 1.03, 1],
                      transition: {
                        duration: 1,
                        ease: [0.16, 1, 0.3, 1],
                        delay: 0.5,
                      },
                    }}
                    exit={{ opacity: 0, x: -80, y: -20, rotate: -8 }}
                    whileHover={{ y: -10 }}
                    className="absolute top-[-10px] left-[-10px] h-full z-10"
                  >
                    <Link
                      to={`/banner-product/${banner._id}`}
                      className="block h-full w-full group"
                    >
                      <motion.img
                        src={banner.banner_image || slideImages[index % slideImages.length]}
                        alt={banner.banner_name || "Banner image"}
                        className="w-[100%] h-[100%] object-contain"
                        loading="lazy"
                        initial={{ opacity: 0, scale: 0.95, y: -100 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: { delay: 0.8, duration: 0.8 },
                        }}
                        whileHover={{ scale: 1.05 }}
                      />
                    </Link>
                  </motion.div>
                </div>

                {/* Content Section */}
                <div className="w-[90%] lg:w-1/2 space-y-6 lg:pr-8 py-0 pt-[-100px]">
                  <AnimatePresence mode="wait">
                    {activeIndex === index && (
                      <motion.div
                        key={`content-${index}`}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ staggerChildren: 0.15 }}
                        className="flex flex-col justify-start gap-10 md:gap-8"
                      >
                        {/* Badge/tag with enhanced animation */}
                        <motion.div
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#f2c41a]/20 rounded-full w-fit"
                          variants={{
                            hidden: { opacity: 0, y: 20, scale: 0.8 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              transition: {
                                duration: 0.6,
                                ease: [0.16, 1, 0.3, 1],
                                delay: 0.2,
                              },
                            },
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <motion.span
                            className="h-2 w-2 rounded-full bg-[#f2c41a]"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                          />
                          <span className="text-sm font-medium text-[#f2c41a]">
                            {banner.tag || "Limited Time Offer"}
                          </span>
                        </motion.div>

                        {/* Typing-like animation for heading */}
                        <motion.h1
                          className="text-4xl md:text-5xl lg:text-6xl text-gray-900 font-bold"
                          variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              transition: {
                                duration: 0.6,
                                ease: [0.16, 1, 0.3, 1],
                              },
                            },
                            exit: { opacity: 0, y: -20 },
                          }}
                        >
                          {renderAnimatedTitle(banner.banner_name)}
                        </motion.h1>

                        {/* Features list with enhanced animations */}
                        <motion.ul
                          className="grid grid-cols-2 gap-3"
                          variants={{
                            hidden: { opacity: 0 },
                            visible: {
                              opacity: 1,
                              transition: {
                                staggerChildren: 0.1,
                                delayChildren: 0.6,
                              },
                            },
                          }}
                        >
                          {banner.feature?.map((feature, i) => (
                            <motion.li
                              key={i}
                              className="flex items-center gap-2 text-gray-700"
                              variants={{
                                hidden: { opacity: 0, x: -10 },
                                visible: {
                                  opacity: 1,
                                  x: 0,
                                  transition: {
                                    type: "spring",
                                    stiffness: 100,
                                  },
                                },
                              }}
                              whileHover={{ x: 5 }}
                            >
                              <motion.svg
                                className="w-5 h-5 text-[#f2c41a]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </motion.svg>
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 + i * 0.1 }}
                              >
                                {feature}
                              </motion.span>
                            </motion.li>
                          ))}
                        </motion.ul>

                        {/* Rating/trust indicators with enhanced animations */}
                        <motion.div
                          className="flex flex-wrap items-center gap-4 mt-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                        >
                          <motion.div
                            className="flex items-center"
                            whileHover={{ scale: 1.05 }}
                          >
                            {[...Array(5)].map((_, i) => (
                              <motion.svg
                                key={i}
                                className="w-5 h-5 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1.3 + i * 0.1 }}
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </motion.svg>
                            ))}
                            <motion.span
                              className="ml-2 text-sm font-medium text-gray-700"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.8 }}
                            >
                              4.9/5
                            </motion.span>
                          </motion.div>

                          <motion.div
                            className="flex items-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.9 }}
                          >
                            <motion.svg
                              className="w-5 h-5 text-gray-700"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              animate={{
                                rotate: [0, 10, -10, 0],
                                transition: {
                                  delay: 2,
                                  duration: 0.5,
                                },
                              }}
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </motion.svg>
                            <span className="text-sm font-medium text-gray-700">
                              24/7 Support
                            </span>
                          </motion.div>
                        </motion.div>

                        {/* Buttons with enhanced animations */}
                        <motion.div
                          className="flex flex-col sm:flex-row gap-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 2.1 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link
                              to={`/banner-product/${banner._id}`}
                              className="relative flex items-center gap-1 px-5 py-3 text-[#f2c41a] font-semibold text-base rounded-full bg-transparent border-4 border-transparent shadow-[0_0_0_2px_#f2c41a] cursor-pointer overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group hover:shadow-[0_0_0_12px_transparent] hover:text-black hover:rounded-3xl active:scale-95 active:shadow-[0_0_0_4px_#f2c41a] w-fit ml-2"
                            >
                              <motion.svg
                                viewBox="0 0 24 24"
                                className="absolute w-6 fill-[#000000] left-[-25%] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:left-0 group-hover:fill-black"
                                xmlns="http://www.w3.org/2000/svg"
                                animate={{
                                  x: [0, 5, 0],
                                  transition: {
                                    delay: 2.3,
                                    duration: 1.5,
                                    repeat: Infinity,
                                  },
                                }}
                              >
                                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                              </motion.svg>

                              <motion.span
                                className="relative z-10 transition-all duration-700 text-lg ease-[cubic-bezier(0.23,1,0.32,1)] translate-x-[-12px] group-hover:translate-x-3"
                                animate={{
                                  x: [-12, 3],
                                  transition: { delay: 2.2 },
                                }}
                              >
                                Shop Now
                              </motion.span>

                              <motion.span
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-[#f2c41a] rounded-full opacity-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100"
                                animate={{
                                  opacity: [0, 0.2, 0],
                                  scale: [1, 30, 1],
                                  transition: {
                                    delay: 2.4,
                                    duration: 1.5,
                                    repeat: Infinity,
                                  },
                                }}
                              />
                            </Link>
                          </motion.div>

                          {/* Happy customer with animation */}
                          <motion.div
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 2.5 }}
                          >
                            <motion.img
                              src={Test}
                              alt="testimonial"
                              className="w-auto h-15 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                delay: 2.5,
                              }}
                            />
                            <motion.span
                              className="text-black"
                              animate={{
                                color: ["#000000", "#f2c41a", "#000000"],
                                transition: {
                                  delay: 2.7,
                                  duration: 2,
                                  repeat: Infinity,
                                },
                              }}
                            >
                              10K+ Happy Customer
                            </motion.span>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </SwiperSlide>
          ))}          
        </Swiper>
       
        {/* Navigation Buttons */}
        {!isBeginning && (
          <button
            className="banner-prev hidden lg:block absolute left-[-100px] top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
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
            className="banner-next hidden lg:block absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
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
  );
};

export default CarouselBanner;