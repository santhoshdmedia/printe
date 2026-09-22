/* eslint-disable react/prop-types */
import { Rate } from "antd";
import { useEffect, useState, useCallback, useRef } from "react";
import _ from "lodash";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import ExitementTag from "../Nav/ExitementTag";
import { motion, AnimatePresence } from "motion/react";
import { DISCOUNT_HELPER, GST_DISCOUNT_HELPER } from "../../helper/form_validation";
import toast from "react-hot-toast";
import { addToShoppingCart } from "../../helper/api_helper";
import { ADD_TO_CART } from "../../redux/slices/cart.slice";

const ProductCardNew = ({ data }) => {
  const dispatch = useDispatch();
  const { user, isAuth } = useSelector((state) => state.authSlice);
  const [isFav, setIsFav] = useState(false);

  // Cart button states: "idle" → "spinning" → "success" → "idle"
  const [cartState, setCartState] = useState("idle");
  const timerRef = useRef(null);

  const isSoldOut = data.is_soldout === true;

  if (!data.is_visible) return null;

  useEffect(() => {
    setIsFav(user?.wish_list?.includes(data.seo_url) ?? false);
  }, [user, data.seo_url]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ── Wishlist toggle (no navigation) ──
  const handleAddWishList = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;

    if (isAuth) {
      if (isFav) {
        const filter = (user?.wish_list || []).filter(
          (product) => product !== data.seo_url
        );
        dispatch({
          type: "UPDATE_USER",
          data: { form: { wish_list: filter }, type: "custom", message: "Remove from WishList" },
        });
        setIsFav(false);
      } else {
        dispatch({
          type: "UPDATE_USER",
          data: { form: { wish_list: [...(user?.wish_list || []), data.seo_url] }, type: "custom", message: "Added to WishList" },
        });
        setIsFav(true);
      }
    } else {
      toast.error("Please login to save to wishlist");
    }
  };

  // ── Price helpers (same as SimpleProductCard) ──
  const getRoleDiscountField = (role) => {
    switch (role) {
      case "Dealer": return "Dealer_discount";
      case "Corporate": return "Corporate_discount";
      default: return "Customer_discount";
    }
  };

  const getRolePriceField = (role) => {
    switch (role) {
      case "Dealer": return "Deler_product_price";
      case "Corporate": return "corporate_product_price";
      default: return "customer_product_price";
    }
  };

  const getBasePrice = () => {
    const userRole = user?.role || "Customer";
    const priceField = getRolePriceField(userRole);

    if (userRole === "bni_user") {
      const delField = getRolePriceField("Dealer");
      const cusField = getRolePriceField("user");
      if (data.variants_price && data.variants_price.length > 0) {
        const delPrice = _.get(data, `variants_price[0].${delField}`, "0");
        const cusPrice = _.get(data, `variants_price[0].${cusField}`, "0");
        return cusPrice - Math.abs((cusPrice - delPrice) / 2);
      }
      if (data.variants_price?.length === 0) {
        const delPrice = _.get(data, `${delField}`, "0");
        const cusPrice = _.get(data, `${cusField}`, "0");
        return cusPrice - Math.abs((cusPrice - delPrice) / 2);
      }
    }

    if (data.variants_price && data.variants_price.length > 0) {
      return _.get(data, `variants_price[0].${priceField}`, "0");
    }
    return _.get(data, priceField, "0");
  };

  const getMrpPrice = () => {
    if (data.variants_price && data.variants_price.length > 0) {
      return _.get(data, "variants_price[0].MRP_price", "0");
    }
    return _.get(data, "MRP_price", "0");
  };

  const calculateDiscountedPrice = () => {
    try {
      const basePrice = Number(getBasePrice());
      const userRole = user?.role || "Customer";
      if (!data.quantity_discount_splitup || !data.quantity_discount_splitup.length) {
        return basePrice;
      }
      const firstTier = data.quantity_discount_splitup[0];
      const discountField = getRoleDiscountField(userRole);
      const discountValue = _.get(firstTier, discountField, 0);
      return (userRole === "Customer" || userRole === "user")
        ? GST_DISCOUNT_HELPER(discountValue, basePrice, 18)
        : DISCOUNT_HELPER(discountValue, basePrice);
    } catch {
      return Number(getBasePrice()) || 0;
    }
  };

  const formatPrice = (price) => `₹${Math.round(Number(price))}`;

  const discountedPrice = calculateDiscountedPrice();
  const mrpPrice = Number(getMrpPrice());
  const hasDiscount = mrpPrice > discountedPrice;

  const productImage =
    _.get(data, "images[0].path", "") ||
    _.get(data, "variants[0].options[0].image_names[0].path", "");

  // ── Add to cart with 2s spinner animation & real backend dispatch (no navigation) ──
  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut || cartState !== "idle") return;

    setCartState("spinning");

    try {
      const payload = {
        product_id: data._id,
        product_name: data.name,
        product_quantity: 1,
        product_image: productImage,
        product_price: Number(discountedPrice),
        final_total: Number(discountedPrice),
        final_total_withoutGst: Number(discountedPrice),
        MRP_price: Number(mrpPrice),
      };

      const result = await addToShoppingCart(payload);
      dispatch(ADD_TO_CART(_.get(result, "data.data.data", payload)));
    } catch (err) {
      console.warn("Cart API notice:", err);
      // Ensure state updates in redux even if guest session or offline
      dispatch(ADD_TO_CART({ product_id: data._id, name: data.name, quantity: 1, price: discountedPrice }));
    }

    timerRef.current = setTimeout(() => {
      setCartState("success");

      timerRef.current = setTimeout(() => {
        setCartState("idle");
      }, 2000);
    }, 2000);
  }, [isSoldOut, cartState, data, productImage, discountedPrice, mrpPrice, dispatch]);

  // ── Cart button content based on state ──
  const renderCartButton = () => {
    if (isSoldOut) return "Out of Stock";

    return (
      <AnimatePresence mode="wait">
        {cartState === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-1.5"
          >
            Add to Cart
          </motion.span>
        )}
        {cartState === "spinning" && (
          <motion.span
            key="spinning"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </motion.span>
        )}
        {cartState === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            className="flex items-center justify-center gap-1.5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </svg>
            Added!
          </motion.span>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="block py-2">
      <div
        className={`relative w-full rounded-2xl overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow duration-300 font-primary ${isSoldOut ? "opacity-75" : ""}`}
      >
        {/* ══════ TOP: Image ══════ */}
        <div className="relative overflow-hidden">
          {/* Excitement Tag (New / Popular / Recommended) */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <ExitementTag product={data} />
          </div>

          {/* Wishlist icon — top right */}
          <motion.button
            type="button"
            className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-white/40 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-md hover:bg-white transition-all duration-300 ${isSoldOut ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
            onClick={handleAddWishList}
            whileTap={!isSoldOut ? { scale: 0.85 } : {}}
            disabled={isSoldOut}
            aria-label="Wishlist"
          >
            {isFav ? (
              <IoHeart className="text-xl text-red-500" />
            ) : (
              <IoHeartOutline className="text-xl text-gray-600 hover:text-red-500 transition-colors" />
            )}
          </motion.button>

          {/* Sold out badge */}
          {isSoldOut && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full pointer-events-none">
              SOLD OUT
            </div>
          )}

          {/* Product Image with smooth hover scale */}
          <Link
            to={`/product/${_.get(data, "seo_url", "")}`}
            className="flex items-center justify-center aspect-square overflow-hidden cursor-pointer group/img"
          >
            <img
              src={productImage}
              alt={data.name}
              className={`w-full h-full object-contain drop-shadow-md transition-transform duration-500 ease-out will-change-transform ${isSoldOut ? "grayscale contrast-50" : "group-hover/img:scale-105 hover:scale-105"
                }`}
              loading="lazy"
            />
          </Link>
        </div>

        {/* ══════ BOTTOM: Product Info ══════ */}
        <div className="p-3 sm:p-4 flex flex-col gap-2">
          {/* Product Name */}
          <Link to={`/product/${_.get(data, "seo_url", "")}`}>
            <h3
              className={`text-sm sm:text-base font-semibold truncate transition-colors ${isSoldOut ? "text-gray-500" : "text-gray-900"
                }`}
            >
              {data.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Rate
              disabled
              allowHalf
              className={`!text-[10px] sm:!text-xs ${isSoldOut ? "!text-gray-400" : "!text-yellow-400"}`}
              defaultValue={4.5}
            />
            <span className="text-[10px] sm:text-xs text-gray-400">(4.5)</span>
          </div>

          {/* Price row */}
          <div className="flex items-center gap-2">
            <span
              className={`text-base sm:text-lg font-bold ${isSoldOut ? "text-gray-500" : "text-gray-900"}`}
            >
              {formatPrice(discountedPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                {formatPrice(mrpPrice)}
              </span>
            )}
            {hasDiscount && !isSoldOut && (
              <span className="text-[10px] sm:text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded line-clamp-1">
                {Math.round(((mrpPrice - discountedPrice) / mrpPrice) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Add to Cart button with animated states */}
          <button
            type="button"
            className={`w-full mt-1 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 h-10 ${isSoldOut
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : cartState === "success"
                ? "bg-green-500 text-white"
                : "bg-[#f2c41a] text-black active:scale-98"
              }`}
            disabled={isSoldOut || cartState !== "idle"}
            onClick={handleAddToCart}
          >
            {renderCartButton()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardNew;
