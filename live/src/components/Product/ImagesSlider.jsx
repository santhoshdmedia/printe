import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Image, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";

// Icons
import {
  LeftOutlined,
  RightOutlined,
  HeartOutlined,
  HeartFilled,
  PictureOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { IoShareSocial } from "react-icons/io5";
import { FacebookIcon, WhatsappIcon, TwitterIcon, LinkedinIcon } from "react-share";

// Components
import DividerCards from "../cards/DividerCards";
import { CustomPopover } from "../Product/ProductDetails";
import { AnimatePresence } from "framer-motion";

const ImagesSlider = ({ imageList = [], data = {} }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuth } = useSelector((state) => state.authSlice);

  // State management
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isFav, setIsFav] = useState(false);

  // Refs
  const transitionTimeoutRef = useRef(null);

  // Process images
  const processedImages = useMemo(() => {
    return imageList?.map(img => {
      if (typeof img === "string") return img;
      return img.path || img.url || "";
    }).filter(Boolean) || [];
  }, [imageList]);

  const currentImage = processedImages[activeIndex] || "";
  const hasMultipleImages = processedImages.length > 1;

  // Effects
  useEffect(() => {
    setIsFav(user?.wish_list?.includes(data?.seo_url) ?? false);
  }, [user, data?.seo_url]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Image navigation
  const handleImageTransition = useCallback((newIndex) => {
    setIsTransitioning(true);
    setActiveIndex(newIndex);

    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, []);

  const handleNext = useCallback(() => {
    if (!hasMultipleImages) return;
    const nextIndex = (activeIndex + 1) % processedImages.length;
    handleImageTransition(nextIndex);
  }, [hasMultipleImages, activeIndex, processedImages.length, handleImageTransition]);

  const handlePrevious = useCallback(() => {
    if (!hasMultipleImages) return;
    const prevIndex = (activeIndex - 1 + processedImages.length) % processedImages.length;
    handleImageTransition(prevIndex);
  }, [hasMultipleImages, activeIndex, processedImages.length, handleImageTransition]);

  // Auto-play
  useEffect(() => {
    let interval;
    if (isAutoPlaying && hasMultipleImages) {
      interval = setInterval(handleNext, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, hasMultipleImages, handleNext]);

  // Enhanced Share Functionality
  const shareProduct = useCallback(async (platform) => {
    const productName = data?.name || "Check out this product";
    const productDescription = data?.product_description_tittle || "Amazing product from our store";
    const productUrl = window.location.href;
    const productImage = currentImage;

    try {
      switch (platform) {
        case "native":
          if (navigator.share) {
            const shareData = {
              title: productName,
              text: productDescription,
              url: productUrl,
            };

            // Try to include image in share
            if (productImage && navigator.canShare && navigator.canShare({ files: true })) {
              try {
                const response = await fetch(productImage);
                const blob = await response.blob();
                const file = new File([blob], 'product-image.jpg', { type: blob.type });
                
                if (navigator.canShare({ files: [file] })) {
                  shareData.files = [file];
                }
              } catch (error) {
                console.log('Image sharing failed, sharing without image');
              }
            }

            await navigator.share(shareData);
          } else {
            setShowShareMenu(true);
          }
          break;

        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
            "_blank",
            "width=600,height=400"
          );
          break;

        case "whatsapp":
          const whatsappMessage = `${productName} - ${productDescription}\n${productUrl}`;
          window.open(
            `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`,
            "_blank"
          );
          break;

        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(productName)}&url=${encodeURIComponent(productUrl)}`,
            "_blank",
            "width=550,height=420"
          );
          break;

        case "linkedin":
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`,
            "_blank"
          );
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Sharing failed:", error);
    }

    setShowShareMenu(false);
  }, [data, currentImage]);

  const handleNativeShare = useCallback(() => {
    shareProduct("native");
  }, [shareProduct]);

  // Other event handlers
  const handleAddWishList = useCallback(() => {
    if (!data?.seo_url) return;

    if (!isAuth) {
      navigate("/login");
      return;
    }

    const updateWishList = () => {
      if (isFav) {
        return { wish_list: user.wish_list.filter(product => product !== data.seo_url) };
      } else {
        return { wish_list: [...(user.wish_list || []), data.seo_url] };
      }
    };

    const form = updateWishList();
    const message = isFav ? "Remove from WishList" : "Added to WishList";

    dispatch({
      type: "UPDATE_USER",
      data: { form, type: "custom", message },
    });

    setIsFav(!isFav);
  }, [data?.seo_url, isAuth, isFav, user, dispatch, navigate]);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev);
  }, []);

  const handleThumbnailClick = useCallback((index) => {
    if (index !== activeIndex) {
      handleImageTransition(index);
    }
  }, [activeIndex, handleImageTransition]);

  // Render methods
  const renderMainImage = () => (
    <div className="absolute inset-0 w-full h-full">
      {currentImage ? (
        <img
          src={currentImage}
          className={`absolute inset-0 w-full h-full object-cover rounded-xl transition-all duration-300 ${
            isTransitioning ? "opacity-70 scale-105" : "opacity-100 scale-100"
          } hover:scale-105`}
          alt={data?.name || "product"}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
      ) : null}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl hidden">
        <div className="text-center text-gray-400">
          <PictureOutlined style={{ fontSize: "48px" }} className="mx-auto mb-2" />
          <p>No image available</p>
        </div>
      </div>
    </div>
  );

  const renderShareMenu = () => (
    <AnimatePresence>
      {showShareMenu && (
        <CustomPopover
          open={showShareMenu}
          onClose={() => setShowShareMenu(false)}
          className="w-64 bg-white rounded-xl shadow-2xl z-50 p-4 border border-gray-200"
        >
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Share Product</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => shareProduct("whatsapp")}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 transition-all hover:scale-105"
            >
              <WhatsappIcon size={40} round />
              <span className="text-xs mt-2 font-medium">WhatsApp</span>
            </button>

            <button
              onClick={() => shareProduct("facebook")}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all hover:scale-105"
            >
              <FacebookIcon size={40} round />
              <span className="text-xs mt-2 font-medium">Facebook</span>
            </button>

            <button
              onClick={() => shareProduct("twitter")}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-500 transition-all hover:scale-105"
            >
              <TwitterIcon size={40} round />
              <span className="text-xs mt-2 font-medium">Twitter</span>
            </button>

            <button
              onClick={() => shareProduct("linkedin")}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all hover:scale-105"
            >
              <LinkedinIcon size={40} round />
              <span className="text-xs mt-2 font-medium">LinkedIn</span>
            </button>
          </div>
        </CustomPopover>
      )}
    </AnimatePresence>
  );

  return (
    <div className="!sticky !top-24 w-full h-full">
      <div className="lg:hidden block">
        <DividerCards name={data?.name} />
      </div>

      {/* Main Image Container */}
      <div
        className="relative w-full h-0 pb-[100%] bg-white border rounded-xl overflow-hidden group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {renderMainImage()}

        {/* Navigation Buttons */}
        {hasMultipleImages && (
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
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-30">
            {activeIndex + 1} / {processedImages.length}
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex flex-col gap-2 absolute top-4 right-4 z-40 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          {/* Wishlist Button */}
          <Tooltip title={`${isFav ? "Remove from" : "Add to"} wishlist`}>
            <button
              className={`p-2 w-10 h-10 bg-white bg-opacity-90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 z-40 flex items-center justify-center ${
                isFav ? "text-red-500" : "text-gray-600 hover:text-red-500"
              }`}
              onClick={handleAddWishList}
            >
              {isFav ? <HeartFilled className="!text-red-500" /> : <HeartOutlined />}
            </button>
          </Tooltip>

          {/* Share Button */}
          <Tooltip title="Share this product">
            <button
              onClick={handleNativeShare}
              className="bg-white bg-opacity-90 hover:bg-[#f2c41a] text-gray-600 hover:text-black p-2 rounded-full shadow-md transition-all duration-300 flex items-center justify-center w-10 h-10"
            >
              <IoShareSocial />
            </button>
          </Tooltip>
        </div>

        {renderShareMenu()}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="flex gap-3 overflow-x-auto py-2 px-1 mt-4">
          {processedImages.map((imageUrl, index) => (
            <button
              key={index}
              className={`flex-shrink-0 bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                activeIndex === index
                  ? "border-blue-500 shadow-md"
                  : "border-gray-200 hover:border-gray-400"
              }`}
              onClick={() => handleThumbnailClick(index)}
              style={{ width: "80px", height: "80px" }}
            >
              <img
                src={imageUrl}
                className="w-full h-full object-cover"
                alt={`Thumbnail ${index + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ImagesSlider);