import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Tooltip, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

// Icons
import {
  LeftOutlined,
  RightOutlined,
  HeartOutlined,
  HeartFilled,
  PictureOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { IoShareSocial } from "react-icons/io5";

// Components
import DividerCards from "../cards/DividerCards";

const ImagesSlider = ({ imageList = [], data = {} }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuth } = useSelector((state) => state.authSlice);

  // State management
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Refs
  const transitionTimeoutRef = useRef(null);
  const autoPlayIntervalRef = useRef(null);

  // Process images and ensure absolute URLs
  const processedImages = useMemo(() => {
    return imageList?.map(img => {
      if (typeof img === "string") {
        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return `${window.location.origin}${img}`;
        return `${window.location.origin}/${img}`;
      }
      const url = img.path || img.url || "";
      if (url.startsWith('http')) return url;
      if (url.startsWith('/')) return `${window.location.origin}${url}`;
      return `${window.location.origin}/${url}`;
    }).filter(Boolean) || [];
  }, [imageList]);

  const currentImage = processedImages[activeIndex] || "";
  const hasMultipleImages = processedImages.length > 1;

  // Get absolute URL for current image
  const getAbsoluteImageUrl = useCallback((imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${window.location.origin}${imageUrl}`;
    return `${window.location.origin}/${imageUrl}`;
  }, []);

  // Get the main product image for SEO
  const getMainProductImage = useCallback(() => {
    const mainImage = processedImages[0] || currentImage;
    if (!mainImage) return '';
    const absoluteUrl = getAbsoluteImageUrl(mainImage);
    return `${absoluteUrl}?v=${Date.now()}`;
  }, [processedImages, currentImage, getAbsoluteImageUrl]);

  // Clean URL - strip www.
  const getCleanUrl = useCallback(() => {
    return window.location.href.replace("www.", "");
  }, []);

  // Get share URL
  const getShareUrl = useCallback(() => {
    return getCleanUrl();
  }, [getCleanUrl]);

  // Get SEO data for meta tags
  const getSeoData = useCallback(() => {
    return {
      title: data?.name || "Amazing Product",
      description: data?.seo_description || data?.short_description || "Check out this amazing product",
      url: getCleanUrl(),
      image: getMainProductImage(),
      keywords: data?.keywords || "product, shopping, ecommerce",
    };
  }, [data, getMainProductImage, getCleanUrl]);

  const seoData = getSeoData();

  // Update meta tags dynamically
  useEffect(() => {
    if (!seoData.image) return;

    const metaTags = [
      { property: 'og:title', content: seoData.title },
      { property: 'og:description', content: seoData.description },
      { property: 'og:image', content: seoData.image },
      { property: 'og:url', content: seoData.url },
      { property: 'og:type', content: 'product' },
      { property: 'og:site_name', content: 'Prine' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:type', content: 'image/jpeg' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: seoData.title },
      { name: 'twitter:description', content: seoData.description },
      { name: 'twitter:image', content: seoData.image },
    ];

    metaTags.forEach(({ property, name, content }) => {
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let metaTag = document.querySelector(selector);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property) metaTag.setAttribute('property', property);
        else metaTag.setAttribute('name', name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    });

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', seoData.url);
  }, [seoData]);

  // Effects
  useEffect(() => {
    setIsFav(user?.wish_list?.includes(data?.seo_url) ?? false);
  }, [user, data?.seo_url]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    };
  }, []);

  // Image navigation
  const handleImageTransition = useCallback((newIndex) => {
    setIsTransitioning(true);
    setActiveIndex(newIndex);
    transitionTimeoutRef.current = setTimeout(() => setIsTransitioning(false), 300);
  }, []);

  const handleNext = useCallback(() => {
    if (!hasMultipleImages) return;
    handleImageTransition((activeIndex + 1) % processedImages.length);
  }, [hasMultipleImages, activeIndex, processedImages.length, handleImageTransition]);

  const handlePrevious = useCallback(() => {
    if (!hasMultipleImages) return;
    handleImageTransition((activeIndex - 1 + processedImages.length) % processedImages.length);
  }, [hasMultipleImages, activeIndex, processedImages.length, handleImageTransition]);

  // Auto-play with proper cleanup
  useEffect(() => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    if (isAutoPlaying && hasMultipleImages) {
      autoPlayIntervalRef.current = setInterval(handleNext, 3000);
    }
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    };
  }, [isAutoPlaying, hasMultipleImages, handleNext]);

  // Share handlers
  const handleShareClick = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      message.success('Link copied! 🔗');
      setShowShareModal(false);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = getShareUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      message.success('Link copied! 🔗');
      setShowShareModal(false);
    }
  }, [getShareUrl]);

  // Wishlist handler
  const handleAddWishList = useCallback(() => {
    if (!data?.seo_url) return;
    if (!isAuth) {
      navigate("/login");
      return;
    }

    const form = isFav
      ? { wish_list: user.wish_list.filter(p => p !== data.seo_url) }
      : { wish_list: [...(user.wish_list || []), data.seo_url] };

    dispatch({
      type: "UPDATE_USER",
      data: { form, type: "custom", message: isFav ? "Remove from WishList" : "Added to WishList" },
    });

    setIsFav(!isFav);
  }, [data?.seo_url, isAuth, isFav, user, dispatch, navigate]);

  const toggleAutoPlay = useCallback(() => setIsAutoPlaying(prev => !prev), []);

  const handleThumbnailClick = useCallback((index) => {
    if (index !== activeIndex) handleImageTransition(index);
  }, [activeIndex, handleImageTransition]);

  // Render main image
  const renderMainImage = () => (
    <div className="absolute inset-0 w-full h-full">
      {currentImage ? (
        <img   fetchpriority="high" loading="eager"
          src={currentImage}
          className={`absolute inset-0 w-full h-full object-cover rounded-xl transition-all duration-300 ${
            isTransitioning ? "opacity-70 scale-105" : "opacity-100 scale-100"
          } hover:scale-105`}
          alt={data?.name || "product"}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="text-center text-gray-400">
            <PictureOutlined style={{ fontSize: "48px" }} className="mx-auto mb-2" />
            <p>No image available</p>
          </div>
        </div>
      )}
    </div>
  );

  // Share Modal
  const renderShareModal = () => (
    showShareModal && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={() => setShowShareModal(false)}
      >
        <div
          className="bg-white rounded-xl p-5 w-72 shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold mb-4 text-center">Share Product</h3>
          <div className="grid grid-cols-3 gap-3">

            {/* WhatsApp */}
            <button
              onClick={() => {
                window.open(`https://wa.me/?text=${encodeURIComponent(getShareUrl())}`, "_blank");
                setShowShareModal(false);
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100"
            >
              <img   fetchpriority="high" loading="eager" src="https://cdn-icons-png.flaticon.com/32/733/733585.png" className="w-8 h-8" alt="WhatsApp" />
              <span className="text-xs">WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, "_blank", "width=600,height=400");
                setShowShareModal(false);
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100"
            >
              <img   fetchpriority="high" loading="eager" src="https://cdn-icons-png.flaticon.com/32/733/733547.png" className="w-8 h-8" alt="Facebook" />
              <span className="text-xs">Facebook</span>
            </button>

            {/* Twitter/X */}
            <button
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl())}`, "_blank", "width=550,height=420");
                setShowShareModal(false);
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100"
            >
              <img   fetchpriority="high" loading="eager" src="https://cdn-icons-png.flaticon.com/32/5968/5968830.png" className="w-8 h-8" alt="Twitter" />
              <span className="text-xs">Twitter</span>
            </button>

            {/* Telegram */}
            <button
              onClick={() => {
                window.open(`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}`, "_blank");
                setShowShareModal(false);
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100"
            >
              <img   fetchpriority="high" loading="eager" src="https://cdn-icons-png.flaticon.com/32/2111/2111646.png" className="w-8 h-8" alt="Telegram" />
              <span className="text-xs">Telegram</span>
            </button>

            {/* Email */}
            <button
              onClick={() => {
                window.location.href = `mailto:?subject=${encodeURIComponent(data?.name || 'Product')}&body=${encodeURIComponent(getShareUrl())}`;
                setShowShareModal(false);
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100"
            >
              <img   fetchpriority="high" loading="eager" src="https://cdn-icons-png.flaticon.com/32/732/732200.png" className="w-8 h-8" alt="Email" />
              <span className="text-xs">Email</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <LinkOutlined />
              </div>
              <span className="text-xs">Copy Link</span>
            </button>

          </div>

          <button
            onClick={() => setShowShareModal(false)}
            className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  );

  return (
    <div className="!sticky !top-24 w-full h-full">

      {/* SEO Meta Tags */}
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={seoData.image} />
        <meta property="og:url" content={seoData.url} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Prine" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        {data?.price && (
          <>
            <meta property="product:price:amount" content={data.price} />
            <meta property="product:price:currency" content="INR" />
          </>
        )}
        <meta property="product:availability" content={(data?.stock_count || 0) > 0 ? "in stock" : "out of stock"} />
        {data?.category && <meta property="product:category" content={data.category} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.image} />
        <meta name="twitter:site" content="@prine" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={seoData.url} />
      </Helmet>

      {/* Share Modal */}
      {renderShareModal()}

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
              aria-label="Previous image"
            >
              <LeftOutlined />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 hover:bg-opacity-90 z-30"
              aria-label="Next image"
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

        {/* Auto Play Toggle */}
        {hasMultipleImages && (
          <Tooltip title={`${isAutoPlaying ? "Pause" : "Play"} slideshow`}>
            <button
              onClick={toggleAutoPlay}
              className={`absolute bottom-4 left-4 w-10 h-10 p-2 flex justify-center items-center text-xl rounded-full z-30 shadow-md hover:shadow-lg transition-all duration-200 ${
                isAutoPlaying
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
              aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isAutoPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            </button>
          </Tooltip>
        )}

        {/* Action Buttons */}
        <div className={`flex flex-col gap-2 absolute top-4 right-4 z-40 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          {/* Wishlist Button */}
          <Tooltip title={`${isFav ? "Remove from" : "Add to"} wishlist`} placement="left">
            <button
              className={`p-2 w-10 h-10 bg-white bg-opacity-90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 z-40 flex items-center justify-center ${
                isFav ? "text-red-500" : "text-gray-600 hover:text-red-500"
              }`}
              onClick={handleAddWishList}
              aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isFav ? <HeartFilled className="!text-red-500" /> : <HeartOutlined />}
            </button>
          </Tooltip>

          {/* Share Button */}
          <Tooltip title="Share this product" placement="left">
            <button
              onClick={handleShareClick}
              className="bg-white bg-opacity-90 hover:bg-[#f2c41a] text-gray-600 hover:text-black p-2 rounded-full shadow-md transition-all duration-300 flex items-center justify-center w-10 h-10"
              aria-label="Share product"
            >
              <IoShareSocial style={{ fontSize: "18px" }} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="flex gap-3 overflow-x-auto py-2 px-1 mt-4 scrollbar-thin">
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
              aria-label={`View image ${index + 1}`}
              aria-selected={activeIndex === index}
            >
              <img   fetchpriority="high" loading="eager"
                src={imageUrl}
                className="w-full h-full object-cover"
                alt={`Thumbnail ${index + 1}`}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ImagesSlider);