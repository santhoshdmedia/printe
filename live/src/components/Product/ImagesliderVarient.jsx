/* eslint-disable react/prop-types */
import { Image, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { useRef } from "react";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DividerCards from "../cards/DividerCards";
import { 
  LeftOutlined, 
  RightOutlined, 
  HeartOutlined, 
  HeartFilled,
  PictureOutlined
} from "@ant-design/icons";

import { IoShareSocial } from "react-icons/io5";
import { FacebookIcon, WhatsappIcon } from "react-share";
import { CustomPopover } from "../Product/ProductDetails";
import { AnimatePresence } from "framer-motion";

const ImagesliderVarient = ({ 
  imageList = [], 
  data = {},
  selectedVariants = {},
  onVariantChange,
  variantImages = {}
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuth } = useSelector((state) => state.authSlice);
  const [isFav, setIsFav] = useState(false);
  const [imageSelected, setImageSelected] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    setIsFav(user?.wish_list?.includes(data?.seo_url) ?? false);
  }, [user, data?.seo_url]);

  // Helper function to get image URL from different data structures
  const getImageUrl = (image) => {
    if (!image) return "";
    if (typeof image === 'string') return image;
    return image.path || image.url || image.src || "";
  };

  // Update images when selected variants or imageList changes
  useEffect(() => {
    let imagesToShow = imageList || [];
    
    console.log("Variant Images:", variantImages);
    console.log("Selected Variants:", selectedVariants);

    // Check if we have variant-specific images
    if (Object.keys(selectedVariants).length > 0 && Object.keys(variantImages).length > 0) {
      const variantKey = Object.values(selectedVariants).join('_');
      console.log("Selected Variant Key:", variantKey);
      
      if (variantImages[variantKey]) {
        imagesToShow = variantImages[variantKey];
      } else {
        // Fallback: try to find images for individual variant values
        for (const variantValue of Object.values(selectedVariants)) {
          if (variantImages[variantValue]) {
            imagesToShow = variantImages[variantValue];
            break;
          }
        }
      }
    }

    console.log("Images to show:", imagesToShow);

    if (imagesToShow && imagesToShow.length > 0) {
      setCurrentImages(imagesToShow);
      const firstImage = getImageUrl(imagesToShow[0]);
      setImageSelected(firstImage);
      setActiveIndex(0);
    } else if (imageList && imageList.length > 0) {
      // Fallback to main image list
      setCurrentImages(imageList);
      const firstImage = getImageUrl(imageList[0]);
      setImageSelected(firstImage);
      setActiveIndex(0);
    }
  }, [imageList, selectedVariants, variantImages]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && currentImages.length > 1) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, 3000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, currentImages.length]);

  const handleNext = () => {
    if (currentImages.length > 0) {
      const nextIndex = (activeIndex + 1) % currentImages.length;
      setActiveIndex(nextIndex);
      const nextImage = getImageUrl(currentImages[nextIndex]);
      setImageSelected(nextImage);
    }
  };

  const handlePrevious = () => {
    if (currentImages.length > 0) {
      const prevIndex = (activeIndex - 1 + currentImages.length) % currentImages.length;
      setActiveIndex(prevIndex);
      const prevImage = getImageUrl(currentImages[prevIndex]);
      setImageSelected(prevImage);
    }
  };

  const imageOnClickHandler = (index) => {
    if (currentImages[index] && index !== activeIndex) {
      setActiveIndex(index);
      const newImage = getImageUrl(currentImages[index]);
      setImageSelected(newImage);
    }
  };

  const handleAddWishList = () => {
    if (!data?.seo_url) {
      console.error("Product seo_url is missing");
      return;
    }

    if (isAuth) {
      if (isFav) {
        const filter = user.wish_list.filter((product) => product !== data.seo_url);
        const form = { wish_list: filter };
        dispatch({
          type: "UPDATE_USER",
          data: { form, type: "custom", message: "Remove from WishList" },
        });
        setIsFav(false);
      } else {
        const form = { wish_list: [...(user.wish_list || []), data.seo_url] };
        dispatch({
          type: "UPDATE_USER",
          data: { form, type: "custom", message: "Added to WishList" },
        });
        setIsFav(true);
      }
    } else {
      navigate("/login");
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentImages, activeIndex]);

   const [showShareMenu, setShowShareMenu] = useState(false);
    const handleNativeShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: data.name,
            text: "Check out this amazing product!",
            url: window.location.href,
          });
        } catch (err) {
          console.log("Error sharing:", err);
        }
      } else {
        setShowShareMenu(!showShareMenu);
      }
    };

  return (
    <div className="!sticky !top-24 w-full h-full">
      <div className="lg:hidden block">
        <DividerCards name={data?.name} />
      </div>
      
      {/* Main Image Container */}
      <div className="relative w-full h-0 pb-[100%] bg-white border rounded-xl overflow-hidden group">
        {/* Main Image */}
        <div className="absolute inset-0 w-full h-full">
          {imageSelected ? (
            <img
              src={imageSelected}
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
              alt={data?.name || "product"}
              onError={(e) => {
                console.error('Failed to load image:', imageSelected);
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
              <div className="text-center text-gray-400">
                <PictureOutlined style={{ fontSize: '48px' }} className="mx-auto mb-2" />
                <p>No image available</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 hover:bg-opacity-90 z-30"
              >
                <LeftOutlined />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 hover:bg-opacity-90 z-30"
              >
                <RightOutlined />
              </button>
            </>
          )}

          {/* Image Counter */}
          {currentImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-30">
              {activeIndex + 1} / {currentImages.length}
            </div>
          )}

          {/* Auto-play Toggle */}
          {currentImages.length > 1 && (
            <Tooltip title={`${isAutoPlaying ? 'Stop' : 'Start'} Auto-play`}>
              <button
                onClick={toggleAutoPlay}
                className={`absolute bottom-4 left-4 w-10 h-10 p-2 rounded-full z-30 ${
                  isAutoPlaying 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-gray-600'
                } shadow-md hover:shadow-lg transition-all duration-200`}
              >
                {isAutoPlaying ? '❚❚' : '▶'}
              </button>
            </Tooltip>
          )}
          
          {/* Wishlist Button */}
          <Tooltip
            title={`${isFav ? "Remove From" : "Add To"} Wish List`}
            placement="left"
          >
            <div className="flex  gap-2">
                   <div className="flex flex-col  gap-2 absolute top-4 right-4 z-40 ">
                     <button
                      className={` p-2 w-10 h-10 !border-none bg-transparent rounded-full shadow-md hover:shadow-lg transition-all duration-200 z-40 focus:outline-none ${
                        isFav ? "text-red-500" : "text-gray-600"
                      }`}
                      onClick={handleAddWishList}
                      aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      {isFav ? (
                        <HeartFilled
                          className="!text-[#f2c41a]"
                          style={{ fontSize: "24px" }}
                        />
                      ) : (
                        <HeartOutlined style={{ fontSize: "24px" }} />
                      )}
                    </button>
                    <button
                      onClick={handleNativeShare}
                      className="bg-[#f2c41a] hover:bg-[#f2c41a] text-black p-3 rounded-full shadow-md transition-all duration-300 hidden md:block"
                    >
                      <IoShareSocial />
                    </button>
            
                    <AnimatePresence>
                      {showShareMenu && (
                        <CustomPopover
                          open={showShareMenu}
                          onClose={() => setShowShareMenu(false)}
                          className="w-48 bg-white rounded-lg shadow-xl z-50 p-2 border border-gray-200"
                        >
                          <p className="text-xs text-gray-500 font-semibold p-2">
                            Share via
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => shareProduct("facebook")}
                              className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 transition-all"
                            >
                              <FacebookIcon size={35} round />
                              <span className="text-xs mt-1">Facebook</span>
                            </button>
                            <button
                              onClick={() => shareProduct("whatsapp")}
                              className="flex flex-col items-center justify-center p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-500 transition-all"
                            >
                              <WhatsappIcon size={35} round />
                              <span className="text-xs mt-1">WhatsApp</span>
                            </button>
                          </div>
                        </CustomPopover>
                      )}
                    </AnimatePresence>
                   </div>
                  </div>
          </Tooltip>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {currentImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-2 px-1 mt-4 scrollbar-thin">
          {currentImages.map((image, index) => {
            const imageUrl = getImageUrl(image);
            return (
              <div
                className={`flex-shrink-0 bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                  activeIndex === index 
                    ? "border-blue-500 shadow-md" 
                    : "border-gray-200 hover:border-gray-400"
                }`}
                key={index}
                onClick={() => imageOnClickHandler(index)}
                style={{ width: '80px', height: '80px' }}
              >
                <img
                  src={imageUrl}
                  className="w-full h-full object-cover"
                  alt={`Thumbnail ${index + 1}`}
                  loading="lazy"
                  onError={(e) => {
                    console.error('Failed to load thumbnail:', imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* No Images Fallback */}
      {currentImages.length === 0 && (
        <div className="relative w-full h-0 pb-[100%] bg-gray-100 border rounded-xl overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <PictureOutlined style={{ fontSize: '48px' }} className="mx-auto mb-2" />
              <p>No images available</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesliderVarient;