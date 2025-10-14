/* eslint-disable no-empty */
/* eslint-disable react/prop-types */
import {
  Checkbox,
  Divider,
  Input,
  InputNumber,
  Select,
  Spin,
  Tag,
  Tooltip,
  Switch,
  Button,
  Card,
  Typography,
  Space,
  Alert,
  Rate,
  Image,
  Row,
  Col,
  List,
  Form,
  message,
  Drawer,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import UploadFileButton from "../UploadFileButton";
import { Link, useNavigate } from "react-router-dom";
import { IconHelper } from "../../helper/IconHelper";
import {
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { IoShareSocial } from "react-icons/io5";
import { MdOutlineMailOutline } from "react-icons/md";
import {
  addToShoppingCart,
  getVariantPrice,
  PUBLIC_URL,
} from "../../helper/api_helper";
import Swal from "sweetalert2";
import {
  CUSTOM_ERROR_NOTIFICATION,
  CUSTOM_SUCCESS_SWALFIRE_NOTIFICATION,
  ERROR_NOTIFICATION,
} from "../../helper/notification_helper";
import { ADD_TO_CART } from "../../redux/slices/cart.slice";
import {
  DISCOUNT_HELPER,
  GST_DISCOUNT_HELPER,
} from "../../helper/form_validation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartOutlined,
  PlusOutlined,
  MinusOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { CiFaceSmile } from "react-icons/ci";
import { CgSmileSad } from "react-icons/cg";
import toast from "react-hot-toast";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import {
  bulkOrder,
  sendOtp,
  verifyOtp,
  resendOtp,
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
  resendWhatsAppOtp,
} from "../../helper/api_helper";

export const CustomModal = ({
  open,
  onClose,
  title,
  children,
  footer,
  width = 520,
  className = "",
  closable = true,
  topPosition = "top-0",
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 !z-50 flex items-start justify-center p-2 ${topPosition}  ${
        isMobile ? "items-end" : "items-center"
      }`}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0  bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: isMobile ? 100 : 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: isMobile ? 100 : 20 }}
        className={`relative bg-white rounded-lg shadow-xl ${
          isMobile ? "w-full h-full rounded-b-none" : "max-h-[90vh]"
        } overflow-hidden flex flex-col ${className}`}
        style={isMobile ? {} : { width }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {closable && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <CloseOutlined className="text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`flex-1 overflow-auto ${isMobile ? "p-4" : "p-6"}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-start gap-3 p-6 border-t border-gray-200">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const { Title, Text, Paragraph } = Typography;

import { FaTruckFast } from "react-icons/fa6";

// Custom Popover Component for smaller overlays
export const CustomPopover = ({
  open,
  onClose,
  children,
  placement = "bottom-right",
  className = "",
}) => {
  if (!open) return null;

  const placementClasses = {
    "bottom-right": "top-full right-0 mt-2",
    "bottom-left": "top-full left-0 mt-2",
    "top-right": "bottom-full right-0 mb-2",
    "top-left": "bottom-full left-0 mb-2",
  };

  return (
    <div className="relative">
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 z-40 md:hidden" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className={`fixed md:absolute z-50 ${placementClasses[placement]} ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Helper function to get product images - FIXED FOR STANDALONE PRODUCTS
const getProductImages = (data) => {
  const images = _.get(data, "images", []);
  
  if (!images || images.length === 0) return [];
  
  // Handle both formats: array of objects with path property AND array of strings
  return images.map(image => {
    if (typeof image === 'string') {
      return image; // Direct URL string
    } else if (image && image.path) {
      return image.path; // Object with path property
    }
    return ''; // Fallback for invalid items
  }).filter(Boolean); // Remove any empty strings
};

// Helper function to get first product image - FIXED FOR STANDALONE PRODUCTS
const getFirstProductImage = (data) => {
  const images = getProductImages(data);
  return images.length > 0 ? images[0] : "";
};

const ProductDetails = ({
  data = {
    _id: "",
    name: "",
    desc: "",
    images: [{ key: 1, path: "" }],
    variants: [{ name: "", options: [{ value: "", price: 0 }] }],
    label: [],
  },
}) => {
  const { user } = useSelector((state) => state.authSlice);
  const [form] = Form.useForm();

  const product_type = _.get(data, "type", "Stand Alone Product");
  let price = "";

  if (user.role === "Dealer") {
    price =
      product_type === "Stand Alone Product"
        ? _.get(data, "Deler_product_price", 0) ||
          _.get(data, "single_product_price", 0)
        : _.get(data, "variants_price[0].Deler_product_price", "");
  } else if (user.role === "Corporate") {
    price =
      product_type === "Stand Alone Product"
        ? _.get(data, "single_product_price", 0) ||
          _.get(data, "corporate_product_price", 0)
        : _.get(data, "variants_price[0].corporate_product_price", "");
  } else {
    price =
      product_type === "Stand Alone Product"
        ? _.get(data, "single_product_price", 0) ||
          _.get(data, "customer_product_price", 0)
        : _.get(data, "variants_price[0].customer_product_price", "");
  }

  const [totalPrice, setTotalPrice] = useState(price);
  const [quantity, setQuantity] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState({
    uuid: "",
    percentage: 0,
  });
  const [variant, setVariant] = useState([]);
  const [currentPriceSplitup, setCurrentPriceSplitup] = useState([]);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [maximum_quantity, setMaimumQuantity] = useState();
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [checkOutState, setCheckOutState] = useState({
    product_image: getFirstProductImage(data),
    product_design_file: "",
    product_name: _.get(data, "name", ""),
    category_name: _.get(data, "category_details.main_category_name", ""),
    subcategory_name: _.get(data, "sub_category_details.sub_category_name", ""),
    product_price: price,
    product_variants: {},
    product_quantity: 0,
    product_seo_url: _.get(data, "seo_url", ""),
    product_id: _.get(data, "_id", ""),
    MRP_savings: 0,
    TotalSavings: 0,
    FreeDelivery: false,
  });
  const [needDesignUpload, setNeedDesignUpload] = useState(true);
  const [reviewData, setReviewData] = useState([]);
  const [review, setReview] = useState([]);
  const [rate, setRate] = useState([]);
  const [loading, setLoading] = useState(false);
  const [averageRatingCount, setAverageRatingCount] = useState(0);
  const [stock, setStockCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [designPreviewVisible, setDesignPreviewVisible] = useState(false);
  const [individualBox, setIndividualBox] = useState(false);
  const [quantityDropdownVisible, setQuantityDropdownVisible] = useState(false);
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isPincodeValid, setIsPincodeValid] = useState(null);
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState(0);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [lazy, setLazy] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [showBulkOrderForm, setShowBulkOrderForm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isGettingVariantPrice, product, productRateAndReview } = useSelector(
    (state) => state.publicSlice
  );

  // Get quantity discounts from backend
  const quantityDiscounts = _.get(data, "quantity_discount_splitup", []);
  const dropdownGap = _.get(data, "dropdown_gap", 100);
  const quantityType = _.get(data, "quantity_type", "dropdown");
  const maxQuantity = _.get(data, "max_quantity", 10000);
  const unit = _.get(data, "unit", "");
  const productionTime = _.get(data, "Production_time", "");
  const ArrangeTime = _.get(data, "Stock_Arrangement_time", "");
  const processing_item = Number(productionTime) + Number(ArrangeTime);

  useEffect(() => {
    if (quantityType !== "textbox" && quantityDiscounts.length > 0) {
      const initialQuantity = Number(
        _.get(quantityDiscounts, "[0].quantity", 500)
      );

      let initialDiscount = 0;
      if (user.role === "Dealer") {
        initialDiscount =
          _.get(quantityDiscounts, "[0].Dealer_discount", 0) ||
          _.get(quantityDiscounts, "[0].discount", 0);
      } else if (user.role === "Corporate") {
        initialDiscount =
          _.get(quantityDiscounts, "[0].Corporate_discount", 0) ||
          _.get(quantityDiscounts, "[0].discount", 0);
      } else {
        initialDiscount =
          _.get(quantityDiscounts, "[0].Customer_discount", 0) ||
          _.get(quantityDiscounts, "[0].discount", 0);
      }

      const initialFreeDelivery = _.get(
        quantityDiscounts,
        "[0].Free_Deliverey",
        false
      );

      setQuantity(initialQuantity);
      setDiscountPercentage({
        uuid: _.get(quantityDiscounts, "[0].uniqe_id", ""),
        percentage: initialDiscount,
      });
      setFreeDelivery(initialFreeDelivery);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: initialQuantity,
      }));
    } else {
      setDiscountPercentage({ uuid: "", percentage: 0 });
      setFreeDelivery(false);
      setMaimumQuantity(maxQuantity);
      setQuantity(null);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: 0,
      }));
    }
  }, [quantityDiscounts, quantityType, maxQuantity]);

  useEffect(() => {
    const ratingSum = rate.reduce(
      (totalSum, num) => totalSum + Math.round(num.rating),
      0
    );
    const averageRating = ratingSum === 0 ? 0 : ratingSum / rate.length;
    setAverageRatingCount(parseFloat(averageRating.toFixed(1)));
  }, [rate]);

  useEffect(() => {
    if (productRateAndReview.data.length > 0)
      setReviewData(productRateAndReview?.data || []);
  }, [productRateAndReview]);

  useEffect(() => {
    if (reviewData.length > 0) {
      setReview(reviewData?.filter((data) => data.review.length > 0) || []);
      setRate(reviewData?.filter((data) => data.rating > 0) || []);
    }
  }, [reviewData]);

  useEffect(() => {
    if (product_type === "Stand Alone Product") {
      setCheckOutState((prevState) => ({
        ...prevState,
        product_price: price,
      }));
      setStockCount(_.get(data, "stock_count", 0));
    } else if (_.isEmpty(currentPriceSplitup)) {
      let items = _.get(product, "variants_price", []).map((res) => {
        return Number(res.price);
      });
      let itemKeys = _.get(product, "variants_price", []).map((res) => {
        return res.key;
      });
      let lowest_price_index = items.indexOf(Math.min(...items));
      setVariant(String(itemKeys[lowest_price_index]).split("-"));
      setCurrentPriceSplitup(
        _.get(product, `variants_price[${lowest_price_index}]`, {})
      );
      let stock_count = _.get(
        product,
        `variants_price[${lowest_price_index}].stock`,
        {}
      );
      let product_price = _.get(
        product,
        `variants_price[${lowest_price_index}].price`,
        {}
      );

      setCheckOutState((prevState) => ({
        ...prevState,
        product_price: product_price,
        product_variants: _.get(
          product,
          `variants_price[${lowest_price_index}]`,
          {}
        ),
      }));
      setStockCount(stock_count);
    }
  }, [product, product_type, price, data]);

  const handleOnChangeSelectOption = async (selectedValue, index) => {
    try {
      const updatedVariant = [...variant];
      updatedVariant[index] = selectedValue;

      setVariant((prev) => updatedVariant);
      const key = updatedVariant.join("-");
      const result = await getVariantPrice(data._id, { key: key });
      setCurrentPriceSplitup(_.get(result, "data.data", {}));
      setCheckOutState((prevState) => ({
        ...prevState,
        product_price: _.get(result, "data.data.price", {}),
        product_variants: _.get(result, "data.data", {}),
      }));
      setStockCount(_.get(result, "data.data.stock", {}));
    } catch (err) {
      console.log(err);
    }
  };

  const scrollToproductDetails = useCallback(() => {
    const targetId = "overview";
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 180;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  const handleUploadImage = (fileString) => {
    setCheckOutState((prev) => ({ ...prev, product_design_file: fileString }));
  };

  const goToShoppingCart = () => {
    navigate("/shopping-cart");
  };

  const handlebuy = async () => {
    try {
      setLoading(true);

      if (!quantity) {
        toast.error("Please select quantity first");
        return;
      }

      if (needDesignUpload && !checkOutState.product_design_file) {
        toast.error("Please upload your design file first");
        return;
      }

      if (needDesignUpload && !checked) {
        toast.error("Please Confirm Your Designs");
        return;
      }

      if (_.isEmpty(user)) {
        localStorage.setItem("redirect_url", _.get(data, "seo_url", ""));
        toast.error("Please Login");
        return navigate("/login");
      }

      setError("");
      checkOutState.sgst = Number(_.get(data, "GST", 0) / 2);
      checkOutState.cgst = Number(_.get(data, "GST", 0) / 2);
      checkOutState.MRP_savings = calculateMRPSavings();
      checkOutState.TotalSavings = calculateSavings();
      checkOutState.FreeDelivery = freeDelivery;
      checkOutState.final_total = Number(
        checkOutState?.product_price * checkOutState.product_quantity
      );

      const result = await addToShoppingCart(checkOutState);
      console.log(result);

      Swal.fire({
        title: "Product Added To Cart",
        text: "Choose an option: Go to the shopping cart page or stay here.",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Go to Shopping Cart",
        cancelButtonText: "Stay Here",
      }).then((result) => {
        if (result.isConfirmed) {
          goToShoppingCart();
        }
      });

      dispatch(ADD_TO_CART(_.get(result, "data.data.data", "")));
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.setItem("redirect_url", _.get(data, "seo_url", ""));
        toast.error("Login to place order");
        navigate("/sign-up");
      } else {
        toast.error(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryDate = (days) => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(
      today.getDate() + (Number(days) + Number(processing_item))
    );

    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const generateLabel = (label) => {
    switch (label) {
      case "new":
        return <Tag color="green">New</Tag>;
      case "popular":
        return <Tag color="purple">Popular</Tag>;
      case "only-for-today":
        return <Tag color="red">Only For Today</Tag>;
      default:
        return <></>;
    }
  };

  const handleQuantityDetails = (stock, quantity) => {
    try {
      return _.get(data, "stocks_status", "") === "Don't Track Stocks"
        ? true
        : Number(stock) > Number(quantity);
    } catch (err) {}
  };

  // Format price functions
  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  const formatMRPPrice = (price) => {
    return `MRP ₹${parseFloat(price).toFixed(2)}`;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!quantity) return 0;
    const unitPrice = DISCOUNT_HELPER(
      discountPercentage.percentage,
      Number(_.get(checkOutState, "product_price", 0))
    );
    return Number(unitPrice * quantity).toFixed(2);
  };

  const calculateMRPTotalPrice = () => {
    if (!quantity) return 0;
    const unitPrice = Number(_.get(checkOutState, "product_price", 0));
    return Number(unitPrice * quantity).toFixed(2);
  };

  // Calculate savings
  const calculateSavings = () => {
    if (!quantity) return 0;
    const original = calculateMRPTotalPrice();
    const discounted = calculateTotalPrice();
    return (original - discounted).toFixed(2);
  };

  const calculateMRPSavings = () => {
    const mrpPrice = Number(_.get(data, "MRP_price", 0));
    const currentPrice = Number(_.get(checkOutState, "product_price", 0));
    const savings = mrpPrice - currentPrice;
    const allSavings = savings * quantity;
    return allSavings.toFixed(2);
  };

  const calculateTotalSavings = () => {
    const totalSavings = calculateSavings();
    const mrpSavings = calculateMRPSavings();
    return (Number(totalSavings) + Number(mrpSavings)).toFixed(2);
  };

  // Generate quantity options
  const generateQuantityOptions = () => {
    if (quantityType === "textbox") {
      const options = [];
      for (let i = dropdownGap; i <= maxQuantity; i += dropdownGap) {
        options.push({ value: i, label: i.toString() });
      }
      return options;
    } else {
      return quantityDiscounts.map((item) => ({
        value: Number(item.quantity),
        label: `${item.quantity}`,
        Free_Delivery: item.Free_Deliverey,
        discount: Number(item.Customer_discount),
        uuid: item.uniqe_id,
        stats: item.recommended_stats,
      }));
    }
  };

  const quantityOptions = generateQuantityOptions();

  const handleQuantitySelect = (selectedQuantity) => {
    if (quantityType === "textbox") {
      const selectedDiscount = quantityDiscounts
        .filter((item) => Number(item.quantity) <= selectedQuantity)
        .sort((a, b) => Number(b.quantity) - Number(a.Customer_discount))[0];

      setQuantity(selectedQuantity);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: selectedQuantity,
      }));

      if (selectedDiscount) {
        setDiscountPercentage({
          uuid: selectedDiscount.uniqe_id,
          percentage: Number(selectedDiscount.Customer_discount),
        });
        setFreeDelivery(selectedDiscount.Free_Deliverey || false);
      } else {
        setDiscountPercentage({ uuid: "", percentage: 0 });
        setFreeDelivery(false);
      }
    } else {
      const selectedDiscount = quantityDiscounts.find(
        (item) => Number(item.quantity) === selectedQuantity
      );

      setQuantity(selectedQuantity);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: selectedQuantity,
      }));

      if (selectedDiscount) {
        setDiscountPercentage({
          uuid: selectedDiscount.uniqe_id,
          percentage: Number(selectedDiscount.Customer_discount),
        });
        setFreeDelivery(selectedDiscount.Free_Deliverey || false);
      }
    }
    setQuantityDropdownVisible(false);
  };

  const handleBulkOrder = () => {
    setShowBulkOrderForm(true);
    setQuantityDropdownVisible(false);
  }

  // Custom dropdown renderer for quantity selection
  const quantityDropdownRender = (menu) => (
    <div
      className="p-2 rounded-lg shadow-xl bg-white"
      onMouseLeave={() => setQuantityDropdownVisible(false)}
    >
      <div className="overflow-y-auto max-h-80 space-y-3">
        {quantityOptions.map((item) => {
          const unitPrice = DISCOUNT_HELPER(
            quantityType === "dropdown"
              ? item.discount
              : discountPercentage.percentage,
            Number(_.get(checkOutState, "product_price", 0))
          );
          const totalPrice = unitPrice * item.value;
          const isSelected = quantity === item.value;

          return (
            <div
              key={item.value}
              className={`flex justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-100 hover:border-blue-300 hover:bg-blue-50"
              }`}
              onClick={() => handleQuantitySelect(item.value)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-base font-medium ${
                      isSelected ? "text-blue-700" : "text-gray-800"
                    }`}
                  >
                    {item.value} {unit}
                  </span>
                  {item.stats && item.stats !== "No comments" && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                      {item.stats}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {quantityType === "dropdown" && item.discount > 0 && (
                    <span className="text-green-600 text-sm font-medium inline-flex items-center mt-1">
                      <CheckCircleOutlined className="mr-1" />
                      {item.discount}% discount
                    </span>
                  )}
                  {quantityType === "dropdown" && item.Free_Delivery && (
                    <span className="text-blue-600 text-sm font-medium inline-flex items-center mt-1">
                      <FaTruckFast className="mr-1" />
                      Free Delivery
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`font-semibold ${
                    isSelected ? "text-blue-700" : "text-gray-900"
                  }`}
                >
                  {formatPrice(totalPrice)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatPrice(unitPrice)}/{unit}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => handleBulkOrder()}
          className="w-full py-2 px-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <PlusOutlined />
          Bulk Order Inquiry
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Prices include all applicable taxes
        </p>
      </div>
    </div>
  );

  // Share functionality
  const shareProduct = (platform) => {
    const productUrl = encodeURIComponent(window.location.href);
    const productName = encodeURIComponent(data.name);
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=Check out this product: ${productName}&url=${productUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=Check out this product: ${productName} ${productUrl}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank");
    }
    setShowShareMenu(false);
  };

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

  // Bulk order form submission
  const handleBulkOrderSubmit = async (values) => {
    try {
      console.log("Bulk order submitted:", values);
      const result = await bulkOrder(values);
      console.log(result);

      message.success("Bulk order inquiry submitted successfully!");
      setShowBulkOrderForm(false);
      form.resetFields();
    } catch (error) {
      message.error("Failed to submit bulk order inquiry");
    }
  };

  // Processing Time Info Content
  const ProcessingTimeInfo = () => (
    <div className="max-h-[400px] overflow-y-auto text-gray-700">
      <Paragraph>
        The printing time determines how long it takes us to complete your
        order.
      </Paragraph>
      <Paragraph>
        While we strive to complete the order within the committed timeframes,
        the timings also depend on the following factors:
      </Paragraph>
      <ul className="list-disc pl-5 mt-2 space-y-2">
        <li>
          We will provide the proof file for approval before printing. Faster
          approval will guarantee speedy processing.
        </li>
        <li>
          We need 300 dpi CMYK resolution artwork uploaded along the order.
        </li>
        <li>Production time does not include the shipping time.</li>
      </ul>
    </div>
  );

  const Gst = _.get(data, "GST", 0);

  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Functions
  const handleSendOtp = async (email) => {
    if (emailVerified) return;

    setSendingOtp(true);
    try {
      await resendOtp({ email: email });
      setOtpSent(true);
      message.success("OTP sent to your email");
    } catch (error) {
      message.error("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    try {
      const email = form.getFieldValue("email");
      const user = { email: email, otp: otp };
      const response = await verifyOtp(user);
      setEmailVerified(true);
      message.success("Email verified successfully");
    } catch (error) {
      message.error("Invalid OTP");
      form.setFields([{ name: "otp", errors: ["Invalid OTP"] }]);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <Spin
      spinning={loading}
      indicator={
        <IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />
      }
    >
      <div className="font-primary w-full space-y-2 relative">
        {/* Product Header - Responsive Layout */}
        <div className="space-y-1 flex flex-col md:flex-row justify-between items-start gap-4">
          {/* Left Section - Title and Labels */}
          <div className="flex-1 w-full md:w-auto">
            <h1 className="text-gray-900 font-bold mb-2 text-xl md:text-2xl lg:text-2xl leading-tight w-full md:w-[80%]">
              {data.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              {data.label?.map((label, index) => (
                <span key={index}>{generateLabel(label)}</span>
              ))}
            </div>
          </div>

          {/* Right Section - Price and Share Button */}
          <div className="w-full md:w-auto flex flex-col md:flex-row items-start md:items-center gap-3 md:relative">
            {/* Share Button - Mobile */}
            <div className="md:hidden flex flex-row-reverse items-center gap-3 w-full justify-between my-2">
              <button
                onClick={handleNativeShare}
                className="bg-[#f2c41a] hover:bg-[#f2c41a] text-black p-3 rounded-full shadow-md transition-all duration-300"
              >
                <IoShareSocial />
              </button>
              
              {/* Price Badge - Mobile */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-md px-4 py-2 shadow-md text-right"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-white/70 text-xs line-through">
                    ₹
                    {_.get(data, "MRP_price", 0) ||
                      Number(_.get(checkOutState, "product_price", 0)) + 50}
                  </span>
                  <h3 className="text-white text-base font-semibold">
                    {quantity
                      ? formatPrice(
                          Number(_.get(checkOutState, "product_price", 0))
                        )
                      : "Select Qty"}
                  </h3>
                </div>
              </motion.div>
            </div>

            {/* Share Button - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleNativeShare}
                className="bg-[#f2c41a] hover:bg-[#f2c41a] text-black p-3 rounded-full shadow-md transition-all duration-300 hidden"
              >
                <IoShareSocial />
              </button>

              {/* Price Badge - Desktop */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-md px-4 py-2 shadow-md text-right"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-white/70 text-xs line-through">
                    ₹
                    {_.get(data, "MRP_price", 0) ||
                      Number(_.get(checkOutState, "product_price", 0)) + 50}
                  </span>
                  <h3 className="text-white text-base font-semibold">
                    {quantity
                      ? formatPrice(
                          Number(_.get(checkOutState, "product_price", 0))
                        )
                      : "Select Qty"}
                  </h3>
                </div>
              </motion.div>
            </div>

            {/* Share Menu Popover */}
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
        </div>

        {/* Product Description */}
        <div>
          <h2 className="text-md font-semibold w-full md:w-[70%]">
            {_.get(data, "product_description_tittle", "")}
          </h2>
          <ul className="grid grid-cols-1 my-2 gap-2 text-md list-disc pl-5">
            <li>{_.get(data, "Point_one", "")}</li>
            <li>{_.get(data, "Point_two", "")}</li>
            <li>{_.get(data, "Point_three", "")}</li>
            <li>{_.get(data, "Point_four", "")}</li>
            <li
              className="list-none text-blue-600 cursor-pointer"
              onClick={scrollToproductDetails}
            >
              read more
            </li>
          </ul>
        </div>

        {/* Quantity and Variants Section */}
        <div className="w-full flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
            <Text strong className="block mb-2 md:mb-0 md:w-24">
              Quantity:
            </Text>
            <Select
              value={quantity}
              onChange={handleQuantitySelect}
              options={quantityOptions}
              className="w-full md:w-[30vw]"
              placeholder="Select quantity"
              dropdownRender={quantityDropdownRender}
              open={quantityDropdownVisible}
              onDropdownVisibleChange={setQuantityDropdownVisible}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product_type !== "Stand Alone Product" &&
              !_.isEmpty(currentPriceSplitup) && (
                <>
                  {_.get(data, "variants", []).map((variant, index) => (
                    <div className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
                      <Text strong className="block mb-2 md:mb-0 md:w-24">
                        {variant.variant_name}:
                      </Text>
                      {variant.variant_type !== "image_variant" ? (
                        <Select
                          defaultValue={_.get(
                            currentPriceSplitup,
                            `[${variant.variant_name}]`,
                            ""
                          )}
                          options={variant.options.map((opt) => ({
                            value: opt.value,
                            label: opt.value,
                          }))}
                          onChange={(value) =>
                            handleOnChangeSelectOption(value, index)
                          }
                          placeholder={`Select ${variant.variant_name}`}
                          className="w-full"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {variant.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex flex-col items-center"
                            >
                              <div
                                onClick={() =>
                                  handleOnChangeSelectOption(
                                    option.value,
                                    index
                                  )
                                }
                                className={`cursor-pointer border-2 p-1 rounded transition duration-200 ${
                                  _.get(
                                    currentPriceSplitup,
                                    `[${variant.variant_name}]`,
                                    ""
                                  ) === option.value
                                    ? "border-blue-500 shadow-md"
                                    : "border-gray-300 hover:border-blue-400"
                                }`}
                                style={{ width: "50px", height: "50px" }}
                              >
                                <img
                                  src={option.image_name}
                                  className="w-full h-full object-contain"
                                  alt={option.value}
                                />
                              </div>
                              <Text className="text-xs mt-1 text-center">
                                {option.value}
                              </Text>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

            {_.get(data, "name", "") === "Matt Finish" && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={individualBox}
                  onChange={(e) => setIndividualBox(e.target.checked)}
                >
                  Individual Box for 100 Cards
                </Checkbox>
              </div>
            )}
          </div>
        </div>

        {/* Total Price Section */}
        <Card className="bg-blue-50 rounded-lg border-0">
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <Text strong className="text-gray-800">
                Deal Price:
              </Text>
              <div className="text-right flex flex-col md:flex-row md:items-baseline gap-1">
                <Text delete className="text-md text-gray-500 md:mr-2">
                  MRP {formatPrice(_.get(data, "MRP_price", 0))}
                </Text>
                <Title level={4} className="!m-0 !text-green-600">
                  {quantity
                    ? formatPrice(calculateTotalPrice())
                    : formatMRPPrice(calculateTotalPrice())}
                </Title>
              </div>
            </div>

            {/* Savings Alerts */}
            <div className="space-y-2">
              {calculateMRPSavings() > 0 && (
                <Alert
                  message={
                    <div>
                      <div>
                        You saved {formatPrice(calculateMRPSavings())} on MRP
                      </div>
                      {quantity && calculateSavings() > 0 && (
                        <div className="mt-1">
                          <div>
                            Kudos! Additionally you saved{" "}
                            {formatPrice(calculateSavings())} (
                            {discountPercentage.percentage}% quantity discount)
                          </div>
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: "1.125rem",
                              marginTop: "4px",
                            }}
                          >
                            Total Savings:{" "}
                            {formatPrice(calculateTotalSavings())}
                          </div>
                        </div>
                      )}
                    </div>
                  }
                  type="success"
                  showIcon
                  className="!py-2"
                />
              )}
            </div>

            {quantity && (
              <div className="text-gray-600">
                <h1 className="!text-md text-gray-600">
                  Exclusive of all taxes for <Text strong>{quantity}</Text> Qty
                  (
                  <Text strong>
                    {formatPrice(
                      DISCOUNT_HELPER(
                        discountPercentage.percentage,
                        Number(_.get(checkOutState, "product_price", 0))
                      )
                    )}
                  </Text>
                  / piece)
                </h1>
              </div>
            )}
            {quantity && (
              <div className="!text-[12px] text-gray-600">
                <h1>
                  Inclusive of all taxes for <span strong>{quantity}</span> Qty
                  (
                  <span className="font-bold">
                    {formatPrice(
                      GST_DISCOUNT_HELPER(
                        discountPercentage.percentage,
                        Number(_.get(checkOutState, "product_price", 0)),
                        Gst
                      )
                    )}
                  </span>
                  / piece)
                </h1>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full justify-between mt-4">
            <div className="flex items-center gap-2">
              <Text strong className="text-gray-700">
                Production Time:
              </Text>
              <Tooltip title="Learn more about processing time">
                <Button
                  type="text"
                  icon={<IconHelper.QUESTION_MARK />}
                  size="small"
                  onClick={() => setIsModalOpen(true)}
                />
              </Tooltip>
              <span className="font-bold">{processing_item} days</span>
            </div>

            {/* Custom Modal for Processing Time */}
            <CustomModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Processing Time Information"
              width={700}
            >
              <ProcessingTimeInfo />
            </CustomModal>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="mt-4"
          >
            <Text strong className="block mb-2 text-gray-700">
              Estimated Delivery
            </Text>
            <PincodeDeliveryCalculator
              Production={processing_item}
              freeDelivery={freeDelivery}
            />
          </motion.div>
        </Card>

        {/* File Upload Section */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <Text strong className="text-gray-800">
              Upload Your Design
            </Text>
            <div className="flex items-center gap-2">
              <Text>Already have a Design</Text>
              <Switch
                checked={needDesignUpload}
                onChange={(checked) => {
                  setNeedDesignUpload(checked);
                  if (!checked) {
                    setCheckOutState((prev) => ({
                      ...prev,
                      product_design_file: "",
                    }));
                    setChecked(false);
                  }
                }}
              />
            </div>
          </div>

          {needDesignUpload ? (
            <>
              <UploadFileButton
                handleUploadImage={handleUploadImage}
                buttonText="Drag & Drop Files Here or Browse Files"
                className="w-full border-dotted rounded-lg flex flex-col items-center justify-center transition-colors"
              />

              {checkOutState.product_design_file && (
                <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => setDesignPreviewVisible(true)}
                    className="md:order-1"
                  >
                    View Design
                  </Button>
                  <Checkbox
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="md:order-2"
                  >
                    I confirm this design
                  </Checkbox>
                </div>
              )}
            </>
          ) : (
            <Alert
              message="Our Designing Team will contact you within 24 Hours After Booking"
              type="info"
              showIcon
            />
          )}

          {/* Instructions Section */}
          <div>
            <div className="flex gap-3 mb-2">
              <Text className="text-gray-800 font-bold">Instructions</Text>
              <Switch
                checked={instructionsVisible}
                onChange={setInstructionsVisible}
              />
            </div>
            {instructionsVisible && (
              <TextArea
                rows={4}
                placeholder="Please provide the instructions for this product. Your response should be clear, concise, and must not exceed 180 words"
                maxLength={180}
                onChange={(e) =>
                  setCheckOutState((prev) => ({
                    ...prev,
                    instructions: e.target.value,
                  }))
                }
              />
            )}
          </div>

          {/* Add to Cart Button */}
          <div className="w-full">
            {isGettingVariantPrice ? (
              <div className="center_div py-6">
                <Spin size="large" />
              </div>
            ) : (
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                className="!h-12 !bg-yellow-400 text-black hover:!bg-yellow-500 hover:!text-black font-semibold w-full"
                onClick={handlebuy}
                loading={loading}
                disabled={!quantity || !handleQuantityDetails(stock, quantity)}
              >
                {!quantity
                  ? "Select quantity first"
                  : !handleQuantityDetails(stock, quantity)
                  ? "Out of stock"
                  : "Add To Cart"}
              </Button>
            )}
          </div>

          <Divider className="!my-4" />
          
          {/* Custom Modal for Design Preview */}
          <CustomModal
            open={designPreviewVisible}
            onClose={() => setDesignPreviewVisible(false)}
            title="Design Preview"
            width={700}
            footer={[
              <Button
                key="close"
                onClick={() => setDesignPreviewVisible(false)}
              >
                Close
              </Button>,
            ]}
            topPosition="top-[-170%]"
          >
            <div className="flex justify-center">
              <img
                src={checkOutState.product_design_file}
                alt="Design Preview"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </CustomModal>
        </div>

        {/* Bulk Order Custom Modal */}
        <CustomModal
          open={showBulkOrderForm}
          onClose={() => setShowBulkOrderForm(false)}
          title="Bulk Order Inquiry"
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleBulkOrderSubmit}>
            <div className="space-y-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Product Name"
                    name="product_name"
                    initialValue={_.get(data, "name", "")}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Quantity"
                    name="quantity"
                    rules={[
                      { required: true, message: "Please enter quantity" },
                    ]}
                  >
                    <InputNumber min={1} className="w-full" addonAfter={unit} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Invalid email" },
                ]}
              >
                <Input
                  placeholder="your@email.com"
                  suffix={
                    emailVerified ? (
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    ) : (
                      <LoadingOutlined spin={sendingOtp} />
                    )
                  }
                  onBlur={(e) => {
                    const email = e.target.value;
                    if (email && validateEmail(email)) {
                      handleSendOtp(email);
                    }
                  }}
                />
              </Form.Item>

              {/* OTP Input Section */}
              {otpSent && !emailVerified && (
                <Form.Item
                  label="Enter OTP"
                  name="otp"
                  rules={[
                    { required: true, message: "Please enter OTP" },
                    { len: 6, message: "OTP must be 6 digits" },
                  ]}
                >
                  <div className="flex items-center gap-3">
                    <Input.OTP
                      length={6}
                      onChange={(otp) => {
                        if (otp.length === 6) {
                          handleVerifyOtp(otp);
                        }
                      }}
                      disabled={emailVerified}
                    />
                    <Button
                      type="link"
                      onClick={() => handleSendOtp(form.getFieldValue("email"))}
                      disabled={sendingOtp}
                    >
                      Resend OTP
                    </Button>
                  </div>
                </Form.Item>
              )}

              <Form.Item
                label="Mobile Number"
                name="mobile"
                rules={[
                  { required: true, message: "Please enter mobile number" },
                ]}
              >
                <Input placeholder="+91 12345 67890" />
              </Form.Item>

              <Form.Item
                label="Additional Requirements"
                name="additional_requirements"
              >
                <TextArea
                  rows={3}
                  placeholder="Any special requirements or notes..."
                />
              </Form.Item>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowBulkOrderForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="flex-1 bg-yellow-500"
                  disabled={!emailVerified}
                >
                  Submit Inquiry
                </Button>
              </div>
            </div>
          </Form>
        </CustomModal>

        {/* Product Meta Information */}
        <div className="space-y-2 z-0 relative">
          <div className="flex items-center">
            <Text strong className="!text-gray-800 !w-20">
              Categories:
            </Text>
            <Text className="text-gray-600">
              {_.get(data, "category_details.main_category_name", "")}
              {_.get(data, "sub_category_details.sub_category_name", "") &&
                `, ${_.get(
                  data,
                  "sub_category_details.sub_category_name",
                  ""
                )}`}
            </Text>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default ProductDetails;

import { FaTruck, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

export const PincodeDeliveryCalculator = ({ Production, freeDelivery }) => {
  const [pincode, setPincode] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isPincodeValid, setIsPincodeValid] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stateDeliveryDays = {
    maharashtra: { days: 2, name: "Maharashtra" },
    gujarat: { days: 3, name: "Gujarat" },
    karnataka: { days: 4, name: "Karnataka" },
    "tamil nadu": { days: 3, name: "Tamil Nadu" },
    kerala: { days: 6, name: "Kerala" },
    delhi: { days: 7, name: "Delhi" },
    default: { days: 3, name: "Other States" },
  };

  const pincodeToStateMap = {
    400: "maharashtra",
    395: "gujarat",
    560: "karnataka",
    600: "tamil nadu",
    682: "kerala",
    110: "delhi",
  };

  const getStateFromPincode = (pincode) => {
    const prefix = pincode.substring(0, 3);
    return pincodeToStateMap[prefix] || "default";
  };

  // Calculate production completion date only (without delivery days)
  const calculateProductionDate = () => {
    const today = new Date();
    const productionTime = Production || 0;

    let productionDate = new Date(today);
    productionDate.setDate(productionDate.getDate() + Number(productionTime));

    // Skip weekends for production time
    let addedDays = 0;
    while (addedDays < productionTime) {
      productionDate.setDate(productionDate.getDate() + 1);
      if (productionDate.getDay() !== 0 && productionDate.getDay() !== 6) {
        addedDays++;
      }
    }

    return productionDate.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate delivery date (production + delivery days)
  const calculateDeliveryDate = (state = "tamil nadu") => {
    const { days: deliveryDays } =
      stateDeliveryDays[state] || stateDeliveryDays.default;
    const today = new Date();
    const productionTime = Production || 0;

    let deliveryDate = new Date(today);
    deliveryDate.setDate(deliveryDate.getDate() + Number(productionTime));

    let totalDays = productionTime + deliveryDays;
    let addedDays = 0;

    while (addedDays < totalDays) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        addedDays++;
      }
    }

    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const validatePincode = async (pincode) => {
    setIsValidatingPincode(true);

    // Simulate API validation
    await new Promise((resolve) => setTimeout(resolve, 800));

    const isValid = /^\d{6}$/.test(pincode);
    setIsPincodeValid(isValid);

    if (isValid) {
      const stateKey = getStateFromPincode(pincode);
      setState(
        stateDeliveryDays[stateKey]?.name || stateDeliveryDays.default.name
      );
      const date = calculateDeliveryDate(stateKey);
      setDeliveryDate(date);
      setError("");
    } else {
      setError("Please enter a valid 6-digit pincode");
      setDeliveryDate("");
      setState("");
    }

    setIsValidatingPincode(false);
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPincode(value.slice(0, 6));
    setIsPincodeValid(null);
    setState("");
    setDeliveryDate("");
    setError("");

    if (value.length === 6) {
      validatePincode(value);
    }
  };

  const extractPincodeFromDisplayName = (displayName) => {
    const pincodeMatch = displayName.match(/\b\d{6}\b/);
    return pincodeMatch ? pincodeMatch[0] : null;
  };

  const handleGeolocationError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        toast.error(
          "Location access denied. Please enable location permissions."
        );
        break;
      case error.POSITION_UNAVAILABLE:
        toast.error(
          "Location information unavailable. Please check your GPS settings."
        );
        break;
      case error.TIMEOUT:
        toast.error("Location request timed out. Please try again.");
        break;
      default:
        toast.error("Failed to get location. Please enter pincode manually.");
    }
  };

  const checkLocationPermission = async () => {
    if (!navigator.permissions) return true;

    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation",
      });
      return permissionStatus.state !== "denied";
    } catch {
      return true;
    }
  };

  const getPincodeByGPS = async () => {
    setIsGettingLocation(true);
    setError("");

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation not supported");
      }

      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 15000,
          enableHighAccuracy: true,
          maximumAge: 300000,
        })
      );

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`
      );

      const data = await response.json();
      const detectedPincode =
        data.address?.postcode ||
        extractPincodeFromDisplayName(data.display_name);

      if (detectedPincode) {
        setPincode(detectedPincode);
        validatePincode(detectedPincode);
        toast.success(`📍 Pincode detected: ${detectedPincode}`);
      } else {
        throw new Error("No pincode found");
      }
    } catch (error) {
      handleGeolocationError(error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const getPincodeByGPSWithPermissionCheck = async () => {
    const hasPermission = await checkLocationPermission();
    hasPermission
      ? await getPincodeByGPS()
      : toast.error("Location permission denied");
  };

  // Delivery Info Content for Custom Modal
  const DeliveryInfoContent = () => (
    <div className="delivery-info-content">
      <ul className="space-y-2">
        <li>• Delivery times vary by state and region</li>
        <li>• Orders placed after 3 PM will be processed next business day</li>
        <li>• Weekends and holidays are not counted as business days</li>
      </ul>
    </div>
  );

  const productionDate = calculateProductionDate();

  return (
    <div className="pincode-delivery-calculator">
      <div className="pincode-input-container">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="input-wrapper relative overflow-hidden rounded-lg"
        >
          <Input
            className="pincode-input"
            value={pincode}
            onChange={handlePincodeChange}
            placeholder="Enter 6-digit Pincode"
            maxLength={6}
            suffix={
              <div className="input-suffix">
                {isValidatingPincode && <Spin size="small" />}
                {isPincodeValid && (
                  <CheckCircleOutlined className="success-icon" />
                )}
                {isPincodeValid === false && (
                  <CloseCircleOutlined className="error-icon" />
                )}
              </div>
            }
          />
          <button
            onClick={getPincodeByGPSWithPermissionCheck}
            disabled={isGettingLocation}
            className="location-button absolute flex top-0 right-0 bg-yellow-500 h-full p-2"
          >
            {isGettingLocation ? (
              <Spin size="small" />
            ) : (
              <span className="button-content flex items-center gap-2 ">
                <FaMapMarkerAlt className="" /> Get Location
              </span>
            )}
          </button>
        </motion.div>

        {error && <div className="error-message">{error}</div>}

        {/* Show different messages based on whether pincode is provided */}
        {pincode && deliveryDate ? (
          // When pincode is provided and valid
          <motion.div className="delivery-info" whileHover={{ x: 5 }}>
            <span className="delivery-text">
              Standard Delivery by <Text strong>{deliveryDate}</Text>
            </span>
            <Divider type="vertical" />
            {freeDelivery ? (
              <div className="flex items-center gap-2">
                <Text delete type="secondary">
                  ₹ 100
                </Text>
                <Text type="success" strong>
                  Cheers – Zero Delivery Charges, 100% Happiness!
                </Text>
              </div>
            ) : (
              <Text type="success" strong>
                ₹ 100
              </Text>
            )}
          </motion.div>
        ) : (
          // When no pincode is provided
          <motion.div className="production-info" whileHover={{ x: 5 }}>
            <span className="production-text">
              Expected Dispatch by <Text strong>{productionDate}</Text>
            </span>
            <Divider type="vertical" />
            <Text type="secondary">
              Enter pincode for delivery date & charges
            </Text>
            {freeDelivery ? (
              <div className="flex items-center gap-2">
                <Text type="success" strong>
                  Cheers – Zero Delivery Charges, 100% Happiness!
                </Text>
              </div>
            ) : (
              <Text type="success" strong></Text>
            )}
          </motion.div>
        )}

        {/* Custom Modal for Delivery Information */}
        <CustomModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Delivery Information"
          width={700}
        >
          {/* <DeliveryInfoContent /> */}
        </CustomModal>
      </div>
    </div>
  );
};