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

const SimpleProductCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuth } = useSelector((state) => state.authSlice);
  const [isFav, setIsFav] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  // 3D tilt animation values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

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

  const handleMouseMove = (e) => {
    if (isSoldOut) return; // Disable tilt effect if sold out
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = mouseX - width / 2;
    const centerY = mouseY - height / 2;
    
    x.set(centerX);
    y.set(centerY);
  };

  const handleMouseLeave = () => {
    animate(x, 0, { duration: 0.5 });
    animate(y, 0, { duration: 0.5 });
    setIsHovered(false);
  };

  // Price calculation utilities
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
      const finalPrice = GST_DISCOUNT_HELPER(discountValue, basePrice, 18);
      
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
      className={`relative w-full overflow-hidden rounded-2xl shadow-md cursor-pointer ${
        isSoldOut ? 'opacity-80' : ''
      }`}
      onClick={handleCardClick}
      onMouseMove={!isSoldOut ? handleMouseMove : undefined}
      onMouseEnter={() => !isSoldOut && setIsHovered(true)}
      onMouseLeave={!isSoldOut ? handleMouseLeave : undefined}
      style={{
        rotateX: isSoldOut ? 0 : rotateX,
        rotateY: isSoldOut ? 0 : rotateY,
        transformPerspective: 1000,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Floating background elements */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br from-purple-100/20 to-blue-100/20 rounded-2xl ${
          isSoldOut ? 'from-gray-100/10 to-gray-100/10' : ''
        }`}
        animate={{
          scale: isHovered && !isSoldOut ? 1.05 : 1,
          opacity: isHovered && !isSoldOut ? 1 : 0.7,
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Main card container */}
      <div className={`relative h-full w-full flex flex-col bg-white shadow-2xl rounded-2xl ${
        isSoldOut ? 'bg-gray-50' : ''
      }`}>
        {/* Image container with floating effect */}
        <motion.div 
          className="relative lg:h-3/4 w-full overflow-hidden"
          animate={{
            y: isHovered && !isSoldOut ? -10 : 0,
          }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 10,
          }}
        >
          {/* Sold Out Overlay */}
          {/* {isSoldOut && (
            <motion.div 
              className="absolute inset-0 z-20 flex items-start justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={Soldout} 
                alt="Sold Out" 
                className="w-3/4 object-cover absolute top-0 h-20 overflow-visible" 
              />
            </motion.div>
          )} */}
          
          <motion.img
            className={`w-full h-full object-cover ${
              isSoldOut ? 'filter grayscale contrast-50' : ''
            }`}
            src={_.get(data.images, "[0].path", "") || _.get(data.variants, "[0].options[0].image_names[0].path", "")}
            alt={data.name}
            animate={{
              scale: isHovered && !isSoldOut ? 1.1 : 1,
            }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Floating bubbles effect - only show if not sold out */}
          {!isSoldOut && [1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute bg-white/30 rounded-full"
              style={{
                width: Math.random() * 40 + 20,
                height: Math.random() * 40 + 20,
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
              }}
              animate={{
                y: isHovered ? [0, -20, 0] : 0,
                opacity: isHovered ? [0.3, 0.8, 0.3] : 0.3,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </motion.div>

        {/* Content area */}
        <div className={`relative h-1/4 p-4 flex flex-col justify-between bg-white z-10 ${
          isSoldOut ? 'bg-gray-50' : ''
        }`}>
          {/* Product info */}
          <div className="overflow-hidden">
            <motion.h3 
              className={`text-sm lg:text-lg font-bold truncate ${
                isSoldOut ? 'text-gray-600' : 'text-gray-900'
              }`}
              animate={{
                x: isHovered && !isSoldOut ? [0, 5, 0] : 0,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              {data.name}
            </motion.h3>
            <div className="flex items-center mt-1">
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

          {/* Price and action section */}
          <div className="flex items-center justify-between mt-2">
            <motion.div
              animate={{
                scale: isHovered && !isSoldOut ? 1.1 : 1,
              }}
              transition={{ type: "spring" }}
            >
              <span className={`text-sm lg:text-xl font-bold ${
                isSoldOut ? 'text-gray-600' : 'text-primary'
              }`}>
                {displayPrice}
              </span>
              <span className={`text-sm lg:text-lg line-through ml-2 ${
                isSoldOut ? 'text-gray-500' : 'text-primary'
              }`}>
                {formatPrice(getMrpPrice())}
              </span>
            </motion.div>
            
            <motion.div
              whileTap={{ scale: isSoldOut ? 1 : 0.9 }}
              whileHover={{ scale: isSoldOut ? 1 : 1.1 }}
            >
              <button 
                className={`p-2 rounded-full shadow-md text-xs lg:text-xl ${
                  isSoldOut 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
                onClick={handleAddWishList}
                disabled={isSoldOut}
              >
                {isFav ? (
                  <IconHelper.HEART_ICON_FILLED className={isSoldOut ? "text-gray-500" : "text-white"} />
                ) : (
                  <IconHelper.HEART_ICON className={isSoldOut ? "text-gray-500" : "text-white"} />
                )}
              </button>
            </motion.div>
          </div>
          {isSoldOut&&<div className="absolute top-11 right-4 bg-red-600 px-4 rounded-lg PY-2 text-white font-bold">SOLD OUT</div>}
        </div>

        {/* Excitement tag with special animation - only show if not sold out */}
        {!isSoldOut && (
          <motion.div
            className="absolute top-4 left-4 z-30"
            animate={{
              y: isHovered ? [0, -5, 0] : 0,
              rotate: isHovered ? [0, 10, -10, 0] : 0,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <ExitementTag product={data} />
          </motion.div>
        )}

        {/* Hover overlay effect - only show if not sold out */}
        {!isSoldOut && (
          <motion.div 
            className="absolute inset-0 bg-black/10 pointer-events-none"
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>

      {/* Floating particles on hover - only show if not sold out */}
      {isHovered && !isSoldOut && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-primary/20 rounded-full pointer-events-none"
              initial={{
                x: Math.random() * 100,
                y: Math.random() * 100,
                width: Math.random() * 10 + 5,
                height: Math.random() * 10 + 5,
                opacity: 0,
              }}
              animate={{
                y: [0, -100],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

export default SimpleProductCard;