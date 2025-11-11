/* eslint-disable react/prop-types */
import { Rate, Tooltip } from "antd";
import { useEffect, useState, useRef } from "react";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconHelper } from "../../helper/IconHelper";
import ExitementTag from "../Nav/ExitementTag";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

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

  // Early return if product is not visible
  if (!data.is_visible) {
    return null;
  }

  useEffect(() => {
    setIsFav(user?.wish_list?.includes(data.seo_url) ?? false);
  }, [user]);

  const handleAddWishList = (e) => {
    e.stopPropagation();
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

  const items = _.get(data, "variants_price", []).map((res) => Number(res.price));
  const price =
    _.get(data, `variants_price[0].customer_product_price`, "") ||
    _.get(data, "single_product_price", null) ||_.get(data, "customer_product_price", null);
  
  return (
    <motion.div
      ref={cardRef}
      className="relative w-full overflow-hidden cursor-pointer rounded-2xl shadow-md"
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Floating background elements */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-blue-100/20 rounded-2xl"
        animate={{
          scale: isHovered ? 1.05 : 1,
          opacity: isHovered ? 1 : 0.7,
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Main card container */}
      <div className="relative h-full w-full flex flex-col bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Image container with floating effect */}
        <motion.div 
          className="relative lg:h-3/4 w-full overflow-hidden"
          animate={{
            y: isHovered ? -10 : 0,
          }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 10,
          }}
        >
          <motion.img
            className="w-full h-full object-cover"
            src={_.get(data.images, "[0].path", "")||_.get(data.variants, "[0].options[0].image_names[0].path", "")}
            alt={data.name}
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Floating bubbles effect */}
          {[1, 2, 3].map((i) => (
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
        <div className="relative h-1/4 p-4 flex flex-col justify-between bg-white z-10">
          {/* Product info */}
          <div className="overflow-hidden">
            <motion.h3 
              className="text-sm lg:text-lg font-bold text-gray-900 truncate"
              animate={{
                x: isHovered ? [0, 5, 0] : 0,
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
                className="!text-xs !text-yellow-400"
                defaultValue={4.5}
              />
              <span className="text-xs text-gray-500 ml-2">(24)</span>
            </div>
          </div>

          {/* Price and action section */}
          <div className="flex items-center justify-between mt-2">
            <motion.div
              animate={{
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ type: "spring" }}
            >
              <span className="text-sm lg:text-xl font-bold text-primary">Rs. {price}</span>
            </motion.div>
            
            <motion.div
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <button 
                className="p-2 rounded-full bg-primary text-white shadow-md text-xs lg:text-xl"
                onClick={handleAddWishList}
              >
                {isFav ? (
                  <IconHelper.HEART_ICON_FILLED className="text-white"  />
                ) : (
                  <IconHelper.HEART_ICON className="text-white"  />
                )}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Excitement tag with special animation */}
        <motion.div
          className="absolute top-4 left-4 z-20"
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

        {/* Hover overlay effect */}
        <motion.div 
          className="absolute inset-0 bg-black/10 pointer-events-none"
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Floating particles on hover */}
      {isHovered && (
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