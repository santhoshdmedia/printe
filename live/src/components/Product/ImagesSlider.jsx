import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Image, Tooltip, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
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

  // Get SEO data for meta tags
  const getSeoData = useCallback(() => {
    const productName = data?.name || "Amazing Product";
    const productDescription = data?.seo_description || data?.short_description || "Check out this amazing product";
    const productUrl = window.location.href;
    const productImage = getMainProductImage();

    return {
      title: productName,
      description: productDescription,
      url: productUrl,
      image: productImage,
      keywords: data?.keywords || "product, shopping, ecommerce",
    };
  }, [data, getMainProductImage]);

  const seoData = getSeoData();

  // Update meta tags dynamically
  useEffect(() => {
    const updateMetaTags = () => {
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
          if (property) {
            metaTag.setAttribute('property', property);
          } else {
            metaTag.setAttribute('name', name);
          }
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
    };

    updateMetaTags();
  }, [seoData]);

  // Get product details for sharing
  const getProductShareDetails = useCallback(() => {
    const productName = data?.name || "Amazing Product";
    const productDescription = data?.seo_description || data?.short_description || "Check out this product";
    const productPrice = data?.price || data?.customer_product_price || "";
    const productUrl = window.location.href;
    const productImage = getAbsoluteImageUrl(currentImage);
    
    const formattedPrice = productPrice ? `₹${productPrice}` : "";
    
    const formattedMessage = `❖ **${productName}** ❖\n\n${productDescription}\n\n❖ Price: ${formattedPrice}\n\n❖ ${productUrl}`;
    
    return {
      productName,
      productDescription,
      productPrice: formattedPrice,
      productUrl,
      productImage,
      formattedMessage
    };
  }, [data, currentImage, getAbsoluteImageUrl]);

  // Effects
  useEffect(() => {
    setIsFav(user?.wish_list?.includes(data?.seo_url) ?? false);
  }, [user, data?.seo_url]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
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

  // Auto-play with proper cleanup
  useEffect(() => {
    // Clear any existing interval
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

  // Enhanced Native Share Functionality
  const handleNativeShare = useCallback(async () => {
    const {
      productName,
      productDescription,
      productPrice,
      productUrl,
      productImage
    } = getProductShareDetails();

    // Pause auto-play when sharing starts
    const wasAutoPlaying = isAutoPlaying;
    if (wasAutoPlaying) {
      setIsAutoPlaying(false);
    }

    try {
      // Check if Web Share API is available
      if (navigator.share) {
        const shareData = {
          title: productName,
          text: `${productDescription}${productPrice ? ` | ${productPrice}` : ''}`,
          url: productUrl,
        };

        // Add image to share data if available
        if (productImage) {
          try {
            // Convert image to blob for sharing
            const response = await fetch(productImage);
            const blob = await response.blob();
            const file = new File([blob], 'product-image.jpg', { type: blob.type });
            shareData.files = [file];
          } catch (error) {
            console.warn('Could not attach image to share:', error);
            // Continue without image attachment
          }
        }

        await navigator.share(shareData);
        
        message.success('Product shared successfully! 🚀');
      } else {
        // Fallback: Copy to clipboard with enhanced message
        const shareText = `${productName}\n\n${productDescription}\n${productPrice ? `Price: ${productPrice}\n` : ''}${productUrl}`;
        
        try {
          await navigator.clipboard.writeText(shareText);
          message.success('Product details copied to clipboard! 📋\nPaste it anywhere to share.');
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          message.success('Product details copied to clipboard! 📋\nPaste it anywhere to share.');
        }
      }
    } catch (error) {
      // User cancelled share or error occurred
      if (error.name !== 'AbortError') {
        console.error('Sharing failed:', error);
        message.info('Share cancelled or not supported');
      }
    } finally {
      // Resume auto-play if it was playing before share
      if (wasAutoPlaying) {
        setIsAutoPlaying(true);
      }
    }
  }, [getProductShareDetails, isAutoPlaying]);

  // Alternative share methods for specific platforms
  const handlePlatformShare = useCallback((platform) => {
    const {
      productName,
      productDescription,
      productPrice,
      productUrl,
      formattedMessage
    } = getProductShareDetails();

    // Pause auto-play when sharing starts
    const wasAutoPlaying = isAutoPlaying;
    if (wasAutoPlaying) {
      setIsAutoPlaying(false);
    }

    try {
      switch (platform) {
        case "whatsapp":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(formattedMessage)}`,
            "_blank"
          );
          break;

        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(productName)}`,
            "_blank",
            "width=600,height=400"
          );
          break;

        case "twitter":
          const twitterMessage = `Check out: ${productName} - ${productDescription}${productPrice ? ` | ${productPrice}` : ''}`;
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage)}&url=${encodeURIComponent(productUrl)}`,
            "_blank",
            "width=550,height=420"
          );
          break;

        case "email":
          const emailSubject = `Check out: ${productName}`;
          const emailBody = formattedMessage;
          window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
          break;

        case "copy-link":
          navigator.clipboard.writeText(productUrl);
          message.success('Product link copied to clipboard! 🔗');
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Sharing failed:", error);
      message.error('Failed to share product');
    } finally {
      // Resume auto-play if it was playing before share
      if (wasAutoPlaying) {
        setTimeout(() => setIsAutoPlaying(true), 1000);
      }
    }
  }, [getProductShareDetails, isAutoPlaying]);

  // Main share handler - tries native first, then falls back to platform-specific
  const handleShareClick = useCallback(async () => {
    // Always try native share first
    await handleNativeShare();
  }, [handleNativeShare]);

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
    const successMessage = isFav ? "Remove from WishList" : "Added to WishList";

    dispatch({
      type: "UPDATE_USER",
      data: { form, type: "custom", message: successMessage },
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
            console.error('Failed to load image:', currentImage);
            e.target.style.display = 'none';
          }}
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

  return (
    <div className="!sticky !top-24 w-full h-full">
      {/* Dynamic Meta Tags for Social Sharing */}
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={seoData.image} />
        <meta property="og:url" content={seoData.url} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Prine" />
        
        {/* Additional OG Tags for Better Sharing */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
                     
        {/* Product Specific OG Tags */}
        {data?.price && (
          <>
            <meta property="product:price:amount" content={data.price} />
            <meta property="product:price:currency" content="INR" />
          </>
        )}
        <meta property="product:availability" content={(data?.stock_count || 0) > 0 ? "in stock" : "out of stock"} />
        {data?.category && (
          <meta property="product:category" content={data.category} />
        )}
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.image} />
        <meta name="twitter:site" content="@prine" />
        
        {/* Additional Meta Tags */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={seoData.url} />
      </Helmet>

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

          {/* Share Button - Uses Native Share API */}
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
            </button>
          ))}
        </div>
      )}

      {/* Fallback Share Options - Only shown if needed */}
      {!navigator.share && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Quick share:</p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePlatformShare("whatsapp")}
              className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 transition-colors"
            >
              WhatsApp
            </button>
            <button
              onClick={() => handlePlatformShare("copy-link")}
              className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ImagesSlider);