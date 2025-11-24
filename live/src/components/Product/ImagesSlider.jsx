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
  InfoCircleOutlined,
} from "@ant-design/icons";
import { IoShareSocial } from "react-icons/io5";
import { FacebookIcon, WhatsappIcon, TwitterIcon, LinkedinIcon, EmailIcon } from "react-share";

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

  // Process images and ensure absolute URLs
  const processedImages = useMemo(() => {
    return imageList?.map(img => {
      if (typeof img === "string") {
        // Convert relative URLs to absolute
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

  // Get absolute URL for current image (for sharing)
  const getAbsoluteImageUrl = useCallback((imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${window.location.origin}${imageUrl}`;
    return `${window.location.origin}/${imageUrl}`;
  }, []);

  // Get the main product image for SEO (first image or current image)
  const getMainProductImage = useCallback(() => {
    const mainImage = processedImages[0] || currentImage;
    if (!mainImage) return '';
    
    const absoluteUrl = getAbsoluteImageUrl(mainImage);
    // Add cache busting parameter
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

  // Update meta tags dynamically when component mounts and when data changes
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

      // Also update link[rel="canonical"]
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
    
    // Format price if available
    const formattedPrice = productPrice ? `₹${productPrice}` : "";
    
    // Create beautiful formatted message
    const formattedMessage = `❖ **${productName}** ❖\n\n${productDescription}\n\n❖ Price: ${formattedPrice}\n\n❖ ${productUrl}\n${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✅`;
    
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 500px;">
        <h2 style="color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 8px;">${productName}</h2>
        <p style="color: #666; line-height: 1.5; margin: 12px 0;">${productDescription}</p>
        ${formattedPrice ? `<p style="color: #52c41a; font-size: 18px; font-weight: bold; margin: 12px 0;">${formattedPrice}</p>` : ''}
        <p style="margin: 16px 0;">
          <a href="${productUrl}" style="color: #1890ff; text-decoration: none; font-weight: bold;">View Product →</a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          Shared via OurStore • ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    return {
      productName,
      productDescription,
      productPrice: formattedPrice,
      productUrl,
      productImage,
      formattedMessage,
      htmlMessage
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
    const {
      productName,
      productDescription,
      productPrice,
      productUrl,
      productImage,
      formattedMessage,
      htmlMessage
    } = getProductShareDetails();

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
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
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

        case "linkedin":
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`,
            "_blank"
          );
          break;

        case "pinterest":
          if (productImage) {
            window.open(
              `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&media=${encodeURIComponent(productImage)}&description=${encodeURIComponent(`${productName} - ${productDescription}`)}`,
              "_blank"
            );
          } else {
            message.warning('Image required for Pinterest sharing');
          }
          break;

        case "email":
          const emailSubject = `Check out: ${productName}`;
          const emailBody = formattedMessage;
          window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
          break;

        case "copy-link":
          try {
            await navigator.clipboard.writeText(formattedMessage);
            message.success('Product details copied to clipboard! 📋');
          } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = formattedMessage;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            message.success('Product details copied to clipboard! 📋');
          }
          break;

        case "copy-image-url":
          if (productImage) {
            try {
              await navigator.clipboard.writeText(productImage);
              message.success('Image URL copied to clipboard! 🖼️');
            } catch (err) {
              const textArea = document.createElement('textarea');
              textArea.value = productImage;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              message.success('Image URL copied to clipboard! 🖼️');
            }
          } else {
            message.warning('No image available to copy');
          }
          break;

        case "download-image":
          if (productImage) {
            try {
              const link = document.createElement('a');
              link.href = productImage;
              link.download = `${productName.replace(/\s+/g, '-')}.jpg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              message.success('Product image downloaded! 💾');
            } catch (error) {
              console.error('Error downloading image:', error);
              message.error('Failed to download image');
            }
          } else {
            message.warning('No image available to download');
          }
          break;

        case "share-with-image":
          if (navigator.share) {
            try {
              await navigator.share({
                title: productName,
                text: `${productDescription}${productPrice ? ` | ${productPrice}` : ''}`,
                url: productUrl,
              });
            } catch (shareError) {
              console.log('Sharing cancelled or failed');
            }
          } else {
            message.info('Native sharing not supported in your browser');
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Sharing failed:", error);
      message.error('Failed to share product');
    }

    setShowShareMenu(false);
  }, [getProductShareDetails]);

  // Always show custom share menu when share button is clicked
  const handleShareClick = useCallback(() => {
    setShowShareMenu(true);
  }, []);

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

  const renderShareMenu = () => {
    const { productName, productDescription, productPrice, formattedMessage } = getProductShareDetails();
    
    return (
      <AnimatePresence>
        {showShareMenu && (
          <CustomPopover
            open={showShareMenu}
            onClose={() => setShowShareMenu(false)}
            className="w-80 bg-white rounded-xl shadow-2xl z-50 p-4 border border-gray-200"
          >
            
            {/* Product Preview in Share Menu */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <img
                  src={currentImage}
                  className="w-12 h-12 object-cover rounded border"
                  alt="Product"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">
                    {productName}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {productDescription}
                  </p>
                  {productPrice && (
                    <p className="text-sm font-bold text-green-600 mt-1">
                      {productPrice}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Share Product</h3>
              <p className="text-sm text-gray-600 mt-1">Share product image and details</p>
            </div>

            {/* Share Platform Grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <button
                onClick={() => shareProduct("whatsapp")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 transition-all hover:scale-105"
              >
                <WhatsappIcon size={32} round />
                <span className="text-xs mt-2 font-medium">WhatsApp</span>
              </button>

              <button
                onClick={() => shareProduct("facebook")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all hover:scale-105"
              >
                <FacebookIcon size={32} round />
                <span className="text-xs mt-2 font-medium">Facebook</span>
              </button>

              <button
                onClick={() => shareProduct("twitter")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-500 transition-all hover:scale-105"
              >
                <TwitterIcon size={32} round />
                <span className="text-xs mt-2 font-medium">Twitter</span>
              </button>

              <button
                onClick={() => shareProduct("pinterest")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all hover:scale-105"
                disabled={!currentImage}
              >
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">P</span>
                </div>
                <span className="text-xs mt-2 font-medium">Pinterest</span>
              </button>

              <button
                onClick={() => shareProduct("email")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all hover:scale-105"
              >
                <EmailIcon size={32} round />
                <span className="text-xs mt-2 font-medium">Email</span>
              </button>

              <button
                onClick={() => shareProduct("download-image")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 transition-all hover:scale-105"
                disabled={!currentImage}
              >
                <PictureOutlined className="text-lg" />
                <span className="text-xs mt-2 font-medium">Save Image</span>
              </button>

              <button
                onClick={() => shareProduct("copy-image-url")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-all hover:scale-105"
                disabled={!currentImage}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-xs mt-2 font-medium">Copy Image</span>
              </button>

              {navigator.share && (
                <button
                  onClick={() => shareProduct("share-with-image")}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 transition-all hover:scale-105"
                >
                  <IoShareSocial className="text-lg" />
                  <span className="text-xs mt-2 font-medium">Native Share</span>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => shareProduct("copy-link")}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Product Details
              </button>
              
              <button
                onClick={() => setShowShareMenu(false)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>

            {/* Info Text */}
            <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-700 text-center">
                <InfoCircleOutlined className="mr-1" />
                For image previews in shares, clear cache using Facebook Debugger
              </p>
            </div>

            {/* Preview of what will be shared */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-600 mb-2 font-medium">Preview:</p>
              <p className="text-xs text-gray-500 whitespace-pre-wrap bg-white p-2 rounded border">
                {formattedMessage.substring(0, 150)}...
              </p>
            </div>
          </CustomPopover>
        )}
      </AnimatePresence>
    );
  };

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

          {/* Share Button - Always opens custom share menu */}
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

        {renderShareMenu()}
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
    </div>
  );
};

export default React.memo(ImagesSlider);