/* eslint-disable react/prop-types */
import { Image, Tooltip } from "antd";
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  PictureOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import { IoShareSocial } from "react-icons/io5";
import { FacebookIcon, WhatsappIcon } from "react-share";
import { CustomPopover } from "../Product/ProductDetails";
import { AnimatePresence } from "framer-motion";

// Custom hook for image URL handling
const useImageHandler = (imageList) => {
  const getImageUrl = useCallback((image) => {
    if (!image) return "";
    if (typeof image === "string") return image;
    return image.path || image.url || image.src || "";
  }, []);

  const processedImages = useMemo(
    () => imageList?.map((img) => getImageUrl(img)) || [],
    [imageList, getImageUrl]
  );

  return { getImageUrl, processedImages };
};

// Custom hook for auto-play functionality
const useAutoPlay = (isActive, interval, onNext) => {
  const autoPlayRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      autoPlayRef.current = setInterval(onNext, interval);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isActive, interval, onNext]);

  return autoPlayRef;
};

const ImagesSlider = ({ imageList = [], data = {} }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuth } = useSelector((state) => state.authSlice);

  const { getImageUrl, processedImages } = useImageHandler(imageList);

  // State management
  const [position, setPosition] = useState({ x: 0, y: 0, showZoom: false });
  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");
  const [isFav, setIsFav] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Refs
  const imgRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Derived state
  const currentImage = useMemo(
    () => processedImages[activeIndex] || "",
    [processedImages, activeIndex]
  );

  const hasMultipleImages = processedImages.length > 1;

  // Effects
  useEffect(() => {
    setIsFav(user?.wish_list?.includes(data?.seo_url) ?? false);
  }, [user, data?.seo_url]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Event handlers
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
  }, [
    hasMultipleImages,
    activeIndex,
    processedImages.length,
    handleImageTransition,
  ]);

  const handlePrevious = useCallback(() => {
    if (!hasMultipleImages) return;

    const prevIndex =
      (activeIndex - 1 + processedImages.length) % processedImages.length;
    handleImageTransition(prevIndex);
  }, [
    hasMultipleImages,
    activeIndex,
    processedImages.length,
    handleImageTransition,
  ]);

  const handleThumbnailClick = useCallback(
    (index) => {
      if (index !== activeIndex) {
        handleImageTransition(index);
      }
    },
    [activeIndex, handleImageTransition]
  );

  // Auto-play functionality
  useAutoPlay(isAutoPlaying && hasMultipleImages, 3000, handleNext);

  const handleMouseMove = useCallback((e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;

    setPosition({
      x: e.pageX - left,
      y: e.pageY - top,
      showZoom: true,
    });
    setBackgroundPosition(`${x}% ${y}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPosition((prev) => ({ ...prev, showZoom: false }));
    setIsHovered(false);
    setShowShareMenu(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleAddWishList = useCallback(() => {
    if (!data?.seo_url) {
      console.error("Product seo_url is missing");
      return;
    }

    if (!isAuth) {
      navigate("/login");
      return;
    }

    const updateWishList = () => {
      if (isFav) {
        const filter = user.wish_list.filter(
          (product) => product !== data.seo_url
        );
        return { wish_list: filter };
      } else {
        return {
          wish_list: [...(user.wish_list || []), data.seo_url],
        };
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

  const handleMoveToOverview = useCallback(() => {
    const element = document.getElementById("overview");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev) => !prev);
  }, []);

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

  const shareProduct = (platform) => {
    const url = window.location.href;
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this product: ${url}`)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareMenu(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!hasMultipleImages) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case " ":
          e.preventDefault();
          toggleAutoPlay();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasMultipleImages, handlePrevious, handleNext, toggleAutoPlay]);

  // Image error handler
  const handleImageError = useCallback((imageUrl) => {
    console.error("Failed to load image:", imageUrl);
  }, []);

  // Render helpers
  const renderMainImage = () => (
    <div className="absolute inset-0 w-full h-full">
      {currentImage ? (
        <img
          ref={imgRef}
          src={currentImage}
          className={`absolute inset-0 w-full h-full object-cover rounded-xl transition-all duration-300 ${
            isTransitioning ? "opacity-70 scale-105" : "opacity-100 scale-100"
          } hover:scale-105`}
          alt={data?.name || "product"}
          onError={() => handleImageError(currentImage)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="text-center text-gray-400">
            <PictureOutlined
              style={{ fontSize: "48px" }}
              className="mx-auto mb-2"
            />
            <p>No image available</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderNavigationButtons = () =>
    hasMultipleImages && (
      <>
        <button
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 hover:bg-opacity-90 z-30 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Previous image"
        >
          <LeftOutlined />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 hover:bg-opacity-90 z-30 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Next image"
        >
          <RightOutlined />
        </button>
      </>
    );

  const renderImageCounter = () =>
    hasMultipleImages && (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-30">
        {activeIndex + 1} / {processedImages.length}
      </div>
    );

  const renderAutoPlayToggle = () =>
    hasMultipleImages && (
      <Tooltip title={`${isAutoPlaying ? "Pause" : "Play"} slideshow`}>
        <button
          onClick={toggleAutoPlay}
          className={`absolute bottom-4 left-4 w-10 h-10 p-2 flex justify-center items-center text-xl rounded-full z-30 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white ${
            isAutoPlaying
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        </button>
      </Tooltip>
    );

  const renderActionButtons = () => (
    <div 
      className={`flex flex-col gap-2 absolute top-4 right-4 z-40 transition-all duration-300 ${
        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      {/* Wishlist Button */}
      <Tooltip
        title={`${isFav ? "Remove from" : "Add to"} wishlist`}
        placement="left"
      >
        <button
          className={`p-2 w-10 h-10 !border-none bg-white bg-opacity-90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 z-40 focus:outline-none flex items-center justify-center ${
            isFav ? "text-red-500" : "text-gray-600 hover:text-red-500"
          }`}
          onClick={handleAddWishList}
          aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isFav ? (
            <HeartFilled
              className="!text-red-500"
              style={{ fontSize: "20px" }}
            />
          ) : (
            <HeartOutlined style={{ fontSize: "20px" }} />
          )}
        </button>
      </Tooltip>

      {/* Share Button */}
      <Tooltip title="Share this product" placement="left">
        <button
          onClick={handleNativeShare}
          className="bg-white bg-opacity-90 hover:bg-[#f2c41a] text-gray-600 hover:text-black p-2 rounded-full shadow-md transition-all duration-300 flex items-center justify-center w-10 h-10"
        >
          <IoShareSocial style={{ fontSize: "18px" }} />
        </button>
      </Tooltip>

      {/* Share Menu */}
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
  );

  const renderOverviewButton = () => (
    <Tooltip title="View product details">
      <button
        className={`absolute top-4 left-4 p-2 bg-white bg-opacity-90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 z-40 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleMoveToOverview}
        aria-label="View product details"
      >
        <InfoCircleOutlined style={{ fontSize: "20px" }} />
      </button>
    </Tooltip>
  );

  const renderThumbnails = () =>
    hasMultipleImages && (
      <div
        className="flex gap-3 overflow-x-auto py-2 px-1 mt-4 scrollbar-thin"
        role="tablist"
        aria-label="Image thumbnails"
      >
        {processedImages.map((imageUrl, index) => (
          <button
            key={index}
            className={`flex-shrink-0 bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeIndex === index
                ? "border-blue-500 shadow-md"
                : "border-gray-200 hover:border-gray-400"
            }`}
            onClick={() => handleThumbnailClick(index)}
            style={{ width: "80px", height: "80px" }}
            role="tab"
            aria-selected={activeIndex === index}
            aria-label={`View image ${index + 1}`}
          >
            <img
              src={imageUrl}
              className="w-full h-full object-cover"
              alt={`Thumbnail ${index + 1}`}
              loading="lazy"
              onError={() => handleImageError(imageUrl)}
            />
          </button>
        ))}
      </div>
    );

  const renderNoImages = () =>
    (!processedImages || processedImages.length === 0) && (
      <div className="relative w-full h-0 pb-[100%] bg-gray-100 border rounded-xl overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <PictureOutlined
              style={{ fontSize: "48px" }}
              className="mx-auto mb-2"
            />
            <p>No images available</p>
          </div>
        </div>
      </div>
    );

  return (
    <div
      className="!sticky !top-24 w-full h-full"
      role="region"
      aria-label="Product images"
    >
      <div className="lg:hidden block">
        <DividerCards name={data?.name} />
      </div>

      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-0 pb-[100%] bg-white border rounded-xl overflow-hidden group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {renderMainImage()}
        {renderNavigationButtons()}
        {renderImageCounter()}
        {renderAutoPlayToggle()}
        {renderActionButtons()}
        {/* {renderOverviewButton()} */}
      </div>

      {renderThumbnails()}
      {renderNoImages()}
    </div>
  );
};

export default React.memo(ImagesSlider);