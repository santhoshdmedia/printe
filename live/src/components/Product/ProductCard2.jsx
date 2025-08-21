/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconHelper } from "../../helper/IconHelper";
import ExitementTag from "../Nav/ExitementTag";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "antd";

const ProductCard2 = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuth } = useSelector((state) => state.authSlice);
  const [isFav, setIsFav] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);

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

  let items = _.get(data, "variants_price", []).map((res) => {
    return Number(res.price);
  });

  let lowest_price_index = items.indexOf(Math.min(...items));

  const price =
    _.get(data, `variants_price[${lowest_price_index}].price`, "") ||
    _.get(data, "single_product_price", "");

  // Animation variants
  const cardVariants = {
    initial: { y: 0, scale: 1 },
    hover: { y: -5, scale: 1.01 }
  };

  const imageVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 }
  };

  const buttonVariants = {
    initial: { y: 0, opacity: 0 },
    hover: { y: -10, opacity: 1 }
  };

  const colorDotVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2 },
    selected: { scale: 1.3, outline: "2px solid #000" }
  };

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300"
      initial="initial"
      whileHover="hover"
      variants={cardVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${_.get(data, "seo_url", "")}`)}
      layout
    >
      {/* Image container */}
      <div className="relative h-72 w-full overflow-hidden">
        <motion.img
          className="h-full w-full object-cover"
          src={_.get(data.images, "[0].path", "")}
          alt={data.name}
          variants={imageVariants}
          transition={{ duration: 0.5 }}
        />

        {/* Floating wishlist button with animation */}
        <motion.div
          className="absolute top-3 right-3 z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0.7, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.3 }}
        >
          <Tooltip title={isFav ? "Remove from wishlist" : "Add to wishlist"}>
            <button
              onClick={handleAddWishList}
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-white p-2 shadow-md transition-all ${isFav ? 'text-red-500' : 'text-gray-600'}`}
            >
              {isFav ? (
                <IconHelper.HEART_ICON_FILLED size={20} />
              ) : (
                <IconHelper.HEART_ICON size={20} />
              )}
            </button>
          </Tooltip>
        </motion.div>

        {/* Tag with animation */}
        <motion.div
          className="absolute left-3 top-3 z-10"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ExitementTag product={data} />
        </motion.div>

        {/* Quick view overlay with animation */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.span
                className="rounded-full bg-white px-6 py-2 font-medium text-black shadow-lg"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                Quick View
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product info */}
      <div className="p-5">
        <motion.h3 
          className="mb-2 text-lg font-semibold text-gray-900 line-clamp-1"
          whileHover={{ color: "#3b82f6" }}
          transition={{ duration: 0.2 }}
        >
          {data.name}
        </motion.h3>

        <div className="mb-3 flex items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.svg
                key={star}
                className="h-4 w-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                whileHover={{ scale: 1.3 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </motion.svg>
            ))}
          </motion.div>
          <span className="ml-2 text-xs text-gray-500">(24 reviews)</span>
        </div>

        {/* Color options with spring animation */}
        {data.color_options && (
          <motion.div className="mb-4 flex space-x-2">
            {data.color_options.slice(0, 5).map((color, index) => (
              <motion.button
                key={index}
                className={`h-6 w-6 rounded-full border-2 border-white shadow-md ${selectedColor === index ? 'ring-2 ring-black' : ''}`}
                style={{ backgroundColor: color.hex }}
                variants={colorDotVariants}
                whileHover="hover"
                animate={selectedColor === index ? "selected" : "initial"}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(index);
                }}
                transition={{ type: "spring", stiffness: 500 }}
              />
            ))}
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-xl font-bold text-gray-900">${price}</span>
            {data.original_price && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ₹ 
              </span>
            )}
          </motion.div>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              // Add to cart logic here
            }}
            className="relative overflow-hidden rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Add to Cart</span>
            <motion.span
              className="absolute inset-0 bg-gray-800 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </div>
      </div>

      {/* 3D hover effect layer */}
      <motion.div
        className="absolute inset-0 -z-10 bg-gray-100 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isHovered ? 0.3 : 0,
          y: isHovered ? 10 : 20
        }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
};

export default ProductCard2;