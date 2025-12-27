/* eslint-disable react/prop-types */
import { Rate, Tooltip } from "antd";
import { useEffect, useState, useRef } from "react";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconHelper } from "../../helper/IconHelper";
import ExitementTag from "../Nav/ExitementTag";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DISCOUNT_HELPER, GST_DISCOUNT_HELPER } from "../../helper/form_validation";
import Soldout from "../../assets/logo/soldOut.png";

const GlamorousProductCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuth } = useSelector((state) => state.authSlice);
  const [isFav, setIsFav] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  // Morphing animation values
  const morph = useMotionValue(0);
  const borderRadius = useTransform(morph, [0, 1], [16, 32]);

  // Determine if product is sold out
  const isSoldOut = data.is_soldout === true;

  // Early return if product is not visible
  if (!data.is_visible) {
    return null;
  }

  useEffect(() => {
    setIsFav(user?.wish_list?.includes(data.seo_url) ?? false);
  }, [user, data.seo_url]);

  const handleAddWishList = (e) => {
    e.stopPropagation();
    if (isSoldOut) return; // Don't allow adding to wishlist if sold out
    
    if (isAuth) {
      if (isFav) {
        const filter = user.wish_list.filter(
          (product) => product !== data.seo_url
        );
        const form = { wish_list: filter };
        dispatch({
          type: "UPDATE_USER",
          data: { form, type: "custom", message: "Remove from WishList" },
        });
        setIsFav(false);
      } else {
        const form = { wish_list: [...user.wish_list, data.seo_url] };
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

  const handleCardClick = () => {
    navigate(`/product/${_.get(data, "seo_url", "")}`);
  };

  const handleMouseEnter = () => {
    if (isSoldOut) return;
    setIsHovered(true);
    animate(morph, 1, { duration: 0.4 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    animate(morph, 0, { duration: 0.4 });
  };

  // Price calculation utilities (same as original)
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

  const getRolePriceField = (role) => {
    switch (role) {
      case 'Dealer':
        return 'Deler_product_price';
      case 'Corporate':
        return 'corporate_product_price';
      default:
        return 'customer_product_price';
    }
  };

  const getBasePrice = () => {
    const userRole = user?.role || 'Customer';
    const priceField = getRolePriceField(userRole);
    
    // Check variants_price array first
    if (data.variants_price && data.variants_price.length > 0) {
      return _.get(data, `variants_price[0].${priceField}`, "0");
    }
    // Fallback to direct price field
    return _.get(data, priceField, "0");
  };
  
  const getMrpPrice = () => {
    // Check variants_price array first
    if (data.variants_price && data.variants_price.length > 0) {
      return _.get(data, `variants_price[0].MRP_price`, "0");
    }
    // Fallback to direct MRP field
    return _.get(data, `MRP_price`, "0");
  };

  const calculateDiscountedPrice = () => {
    try {
      const basePrice = Number(getBasePrice());
      const userRole = user?.role || 'Customer';

      if (!data.quantity_discount_splitup || !data.quantity_discount_splitup.length) {
        return basePrice;
      }

      const firstQuantityTier = data.quantity_discount_splitup[0];
      const discountField = getRoleDiscountField(userRole);
      const discountValue = _.get(firstQuantityTier, discountField, 0);
      
      // Use GST_DISCOUNT_HELPER to calculate final price
      const finalPrice = (userRole=="Customer"||userRole=="user")?GST_DISCOUNT_HELPER(discountValue, basePrice, 18):DISCOUNT_HELPER(discountValue, basePrice);
      
      return finalPrice;
    } catch (error) {
      console.error('Error calculating price:', error);
      return Number(getBasePrice()) || 0;
    }
  };

  const formatPrice = (price) => {
    const numericPrice = typeof price === 'number' ? price : Number(price);
    return `₹${Math.round(numericPrice)}`;
  };

  const displayPrice = formatPrice(calculateDiscountedPrice());
  
  return (
    <motion.div
      ref={cardRef}
      className={`relative w-full overflow-hidden cursor-pointer ${
        isSoldOut ? 'bg-gray-200' : 'bg-gradient-to-br from-indigo-50 to-purple-50'
      }`}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: borderRadius,
        boxShadow: `0 10px 30px rgba(0,0,0,0.1)`,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Diagonal split background */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-0 w-full h-full ${
          isSoldOut ? 'bg-gray-300' : 'bg-gradient-to-br from-cyan-200 to-blue-300'
        }`} style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      </div>

      {/* Main card container */}
      <div className="relative h-full w-full flex flex-col p-6">
        {/* Image and content in a flex layout */}
        <div className="flex items-center mb-4">
          {/* Image container */}
          <motion.div 
            className="relative w-24 h-24 mr-4 overflow-hidden rounded-xl shadow-lg"
            animate={{
              rotate: isHovered && !isSoldOut ? [0, 5, -5, 0] : 0,
            }}
            transition={{ duration: 0.6 }}
          >
            {/* Sold Out Overlay */}
            {isSoldOut && (
              <motion.div 
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src={Soldout} 
                  alt="Sold Out" 
                  className="w-12 h-12 object-contain" 
                />
              </motion.div>
            )}
            
            <motion.img
              className={`w-full h-full object-cover ${
                isSoldOut ? 'filter grayscale' : ''
              }`}
              src={_.get(data.images, "[0].path", "") || _.get(data.variants, "[0].options[0].image_names[0].path", "")}
              alt={data.name}
              animate={{
                scale: isHovered && !isSoldOut ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Product info */}
          <div className="flex-1">
            <motion.h3 
              className={`text-lg font-bold mb-1 ${
                isSoldOut ? 'text-gray-600' : 'text-gray-900'
              }`}
              animate={{
                x: isHovered && !isSoldOut ? [0, 3, 0] : 0,
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              {data.name}
            </motion.h3>
            <div className="flex items-center mb-2">
              <Rate
                disabled
                allowHalf
                className={`!text-xs ${
                  isSoldOut ? '!text-gray-400' : '!text-yellow-400'
                }`}
                defaultValue={4.5}
              />
            </div>
          </div>
        </div>

        {/* Price ribbon */}
        <motion.div 
          className={`relative bg-gradient-to-r ${
            isSoldOut ? 'from-gray-400 to-gray-500' : 'from-green-400 to-blue-500'
          } text-white px-4 py-2 rounded-full shadow-lg mb-4`}
          animate={{
            scale: isHovered && !isSoldOut ? 1.05 : 1,
          }}
          transition={{ type: "spring" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{displayPrice}</span>
            <span className="text-sm line-through opacity-75">{formatPrice(getMrpPrice())}</span>
          </div>
          {/* Ribbon tail */}
          <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 ${
            isSoldOut ? 'border-l-gray-400 border-r-gray-400 border-t-gray-500' : 'border-l-green-400 border-r-green-400 border-t-blue-500'
          }`} />
        </motion.div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <motion.button
            className={`px-4 py-2 rounded-lg font-semibold ${
              isSoldOut 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
            }`}
            whileTap={{ scale: isSoldOut ? 1 : 0.95 }}
            whileHover={{ scale: isSoldOut ? 1 : 1.05 }}
            disabled={isSoldOut}
          >
            View Details
          </motion.button>
          
          <motion.button 
            className={`p-3 rounded-full shadow-lg ${
              isSoldOut 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-white text-red-500 hover:bg-red-500 hover:text-white'
            }`}
            onClick={handleAddWishList}
            disabled={isSoldOut}
            whileTap={{ scale: isSoldOut ? 1 : 0.9 }}
            whileHover={{ scale: isSoldOut ? 1 : 1.1 }}
          >
            {isFav ? (
              <IconHelper.HEART_ICON_FILLED className={isSoldOut ? "text-gray-500" : "text-red-500"} />
            ) : (
              <IconHelper.HEART_ICON className={isSoldOut ? "text-gray-500" : "text-red-500"} />
            )}
          </motion.button>
        </div>

        {/* Excitement tag */}
        {!isSoldOut && (
          <motion.div
            className="absolute top-4 right-4 z-30"
            animate={{
              rotate: isHovered ? [0, 15, -15, 0] : 0,
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <ExitementTag product={data} />
          </motion.div>
        )}

        {/* Floating geometric shapes on hover */}
        {isHovered && !isSoldOut && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg pointer-events-none"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  width: Math.random() * 20 + 10,
                  height: Math.random() * 20 + 10,
                  opacity: 0,
                }}
                animate={{
                  opacity: [0, 0.7, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                }}
              />
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default GlamorousProductCard;