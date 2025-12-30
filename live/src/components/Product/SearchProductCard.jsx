/* eslint-disable react/prop-types */
import React, { useMemo, useState } from "react";
import { IconHelper } from "../../helper/IconHelper";
import { Link } from "react-router-dom";
import { get } from "lodash";
import { GST_DISCOUNT_HELPER, DISCOUNT_HELPER } from "../../helper/form_validation";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const SearchProductCard = ({ data, className = "", onClick, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Early return if product is not visible
  if (data?.is_visible === false) {
    return null;
  }

  const { user } = useSelector((state) => state.authSlice);
  
  const { 
    images = [], 
    name, 
    _id, 
    seo_url, 
    MRP_price, 
    product_description_tittle, 
    Point_one,
    product_code,
    variants = [],
    variants_price = [],
    quantity_discount_splitup = []
  } = data;

  // Memoize all calculations
  const {
    productImage,
    productUrl,
    productName,
    finalPrice,
    mrpPrice,
    discount,
    isBNIUser,
    saveAmount,
    productDescription
  } = useMemo(() => {
    // Role configuration
    const userRole = user?.role || 'Customer';
    const isBNI = userRole === "bni_user";
    
    const getRolePriceField = (role) => {
      switch (role) {
        case 'Dealer':
          return 'Deler_product_price';
        case 'Corporate':
          return 'corporate_product_price';
        case 'Customer':
        default:
          return 'customer_product_price';
      }
    };

    const getRoleDiscountField = (role) => {
      switch (role) {
        case 'Dealer':
          return 'Dealer_discount';
        case 'Corporate':
          return 'Corporate_discount';
        default:
          return 'Customer_discount';
      }
    };

    // Calculate base price
    const calculateBasePrice = () => {
      const dealerField = getRolePriceField("Dealer");
      const customerField = getRolePriceField("Customer");
      
      let dealerPrice = 0;
      let customerPrice = 0;
      
      if (isBNI) {
        if (variants_price.length > 0) {
          dealerPrice = parseFloat(get(variants_price[0], dealerField, "0")) || 0;
          customerPrice = parseFloat(get(variants_price[0], customerField, "0")) || 0;
        } else {
          dealerPrice = parseFloat(get(data, dealerField, "0")) || 0;
          customerPrice = parseFloat(get(data, customerField, "0")) || 0;
        }
        
        // BNI pricing: midpoint between customer and dealer price
        return customerPrice - Math.abs((customerPrice - dealerPrice) / 2);
      }

      const priceField = getRolePriceField(userRole);
      if (variants_price.length > 0) {
        return parseFloat(get(variants_price[0], priceField, "0")) || 0;
      }
      return parseFloat(get(data, priceField, "0")) || 0;
    };

    const calculateDiscountedPrice = (basePrice) => {
      try {
        if (!quantity_discount_splitup.length) {
          return basePrice;
        }

        const firstQuantityTier = quantity_discount_splitup[0];
        const discountField = getRoleDiscountField(userRole);
        const discountValue = get(firstQuantityTier, discountField, 0) || 0;

        const finalPrice = (userRole === "Customer" || userRole === "user") 
          ? GST_DISCOUNT_HELPER(discountValue, basePrice, 18) 
          : DISCOUNT_HELPER(discountValue, basePrice);

        return Math.round(finalPrice) || 0;
      } catch (error) {
        console.error('Error calculating price:', error);
        return basePrice;
      }
    };

    // Get product image
    const getProductImage = () => {
      if (images.length > 0 && images[0]?.url) {
        return images[0].url;
      }
      if (images.length > 0 && images[0]?.path) {
        return images[0].path;
      }
      if (variants.length > 0) {
        const firstVariant = variants[0];
        if (firstVariant.images?.length > 0 && firstVariant.images[0]?.url) {
          return firstVariant.images[0].url;
        }
        if (firstVariant.images?.length > 0 && firstVariant.images[0]?.path) {
          return firstVariant.images[0].path;
        }
        if (firstVariant.options?.length > 0) {
          const firstOption = firstVariant.options[0];
          if (firstOption.image_names?.length > 0 && firstOption.image_names[0]?.url) {
            return firstOption.image_names[0].url;
          }
          if (firstOption.image_names?.length > 0 && firstOption.image_names[0]?.path) {
            return firstOption.image_names[0].path;
          }
        }
      }
      return null;
    };

    // Calculate prices
    const basePrice = calculateBasePrice();
    const discountedPrice = calculateDiscountedPrice(basePrice);
    const mrp = parseFloat(MRP_price || "0") || 0;
    const calculatedDiscount = mrp > discountedPrice && mrp > 0
      ? Math.round(((mrp - discountedPrice) / mrp) * 100) 
      : 0;
    const saveAmount = mrp > discountedPrice ? mrp - discountedPrice : 0;

    return {
      productImage: getProductImage(),
      productUrl: seo_url || _id,
      productName: name || "Unnamed Product",
      productDescription: product_description_tittle || Point_one || "",
      finalPrice: discountedPrice,
      mrpPrice: mrp,
      discount: calculatedDiscount,
      isBNIUser: isBNI,
      saveAmount
    };
  }, [data, user, images, variants, variants_price, quantity_discount_splitup]);

  // Safe icon fallbacks
  const ArrowIcon = IconHelper?.SIDEARROW_ICON || IconHelper?.CHEVRON_RIGHT || (() => <span>→</span>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <Link
        to={`/product/${productUrl}`}
        onClick={onClick}
        className={`block group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg 
                  hover:shadow-2xl transition-all duration-500 border border-gray-200/50 
                  hover:border-primary/50 overflow-hidden backdrop-blur-sm ${className}`}
      >
        <div className="relative p-5">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, #667eea 0%, transparent 50%),
                               radial-gradient(circle at 80% 20%, #764ba2 0%, transparent 50%)`,
            }} />
          </div>

          <div className="relative flex items-start gap-4">
            {/* Product Image Container */}
            <div className="flex-shrink-0 relative">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl 
                           transition-all duration-500 bg-gradient-to-br from-gray-100 to-gray-200">
                {!imageError && productImage ? (
                  <>
                    {/* Loading Skeleton */}
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                    )}
                    
                    <img
                      src={productImage}
                      alt={productName}
                      className={`w-full h-full object-cover transition-transform duration-700 
                                ${imageLoaded ? 'opacity-100' : 'opacity-0'} 
                                group-hover:scale-110`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl text-gray-400">📦</span>
                  </div>
                )}
                
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 
                             group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Discount Badge */}
              {discount > 0 && (
                <motion.div 
                  className="absolute -top-2 -right-2 z-10"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    delay: index * 0.1 + 0.3 
                  }}
                >
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold 
                             px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1"
                    aria-label={`${discount}% off`}
                  >
                    <span className="text-white text-xs">🔥</span>
                    <span>{discount}% OFF</span>
                  </div>
                </motion.div>
              )}

             
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              {/* Product Name */}
              <div className="mb-2">
                <h3 
                  className="font-bold text-gray-900 text-base leading-tight group-hover:text-primary 
                           transition-colors line-clamp-2 mb-1"
                  title={productName}
                >
                  {productName}
                </h3>
                
                {/* Product Description */}
                {productDescription && (
                  <p 
                    className="text-gray-600 text-sm line-clamp-1 opacity-75 group-hover:opacity-100 
                             transition-opacity duration-300"
                    title={productDescription}
                  >
                    {productDescription}
                  </p>
                )}
              </div>

              {/* Rating */}
              

              {/* Price Section */}
              <div className="mb-3 !flex flex-row">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl font-bold text-gray-900">
                    ₹{finalPrice.toLocaleString('en-IN')}
                  </span>
                  {mrpPrice > finalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{mrpPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                
                {/* Save Amount */}
                {saveAmount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Save ₹{saveAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

            
            </div>

            {/* Arrow Icon */}
            <motion.div 
              className="flex-shrink-0 text-gray-300 group-hover:text-primary self-center"
              aria-hidden="true"
              whileHover={{ 
                scale: 1.3,
                rotate: 360,
                transition: { duration: 0.5 }
              }}
              animate={{
                x: [0, 5, 0],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.1
                }
              }}
            >
              <ArrowIcon className="text-2xl" />
            </motion.div>
          </div>

          {/* Bottom Gradient Line */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      </Link>
    </motion.div>
  );
};

export default React.memo(SearchProductCard);