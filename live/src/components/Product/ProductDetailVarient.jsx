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
const CustomPopover = ({
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
import { PincodeDeliveryCalculator } from "./ProductDetails";


const ProductDetailVarient = ({
  data = {
    _id: "",
    name: "",
    desc: "",
    images: [],
    variants: [],
    variants_price: [],
    type: "Variable Product",
  },
  onColorChange, 
  selectedColor: propSelectedColor, 
}) => {
  const { user } = useSelector((state) => state.authSlice);
  const [form] = Form.useForm();

  const product_type = _.get(data, "type", "Variable Product");
  
  // Get initial price based on user role
  let price = "";
  if (user.role === "Dealer") {
    price = _.get(data, "variants_price[0].Deler_product_price", 0);
  } else if (user.role === "Corporate") {
    price = _.get(data, "variants_price[0].corporate_product_price", 0);
  } else {
    price = _.get(data, "variants_price[0].customer_product_price", 0);
  }

  // State management
  const [totalPrice, setTotalPrice] = useState(price);
  const [quantity, setQuantity] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState({
    uuid: "",
    percentage: 0,
  });
  const [variant, setVariant] = useState([]);
  const [currentPriceSplitup, setCurrentPriceSplitup] = useState({});
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [maximum_quantity, setMaimumQuantity] = useState();
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [checkOutState, setCheckOutState] = useState({
    product_image: _.get(data, "images[0]", ""),
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
  
  // Use local state for selectedColor with prop as initial value
  const [selectedColor, setSelectedColor] = useState(propSelectedColor || "");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isGettingVariantPrice, product, productRateAndReview } = useSelector(
    (state) => state.publicSlice
  );

  // Get product data
  const quantityDiscounts = _.get(data, "quantity_discount_splitup", []);
  const dropdownGap = _.get(data, "dropdown_gap", 100);
  const quantityType = _.get(data, "quantity_type", "dropdown");
  const maxQuantity = _.get(data, "max_quantity", 10000);
  const unit = _.get(data, "unit", "Box");
  const productionTime = _.get(data, "Production_time", "");
  const ArrangeTime = _.get(data, "Stock_Arrangement_time", "");
  const processing_item = Number(productionTime) + Number(ArrangeTime);
  const Gst = _.get(data, "GST", 0);

  // Get color variants
  const colorVariants = data.variants?.find(v => v.variant_name === "Colour") || { options: [] };

  // Initialize variants and prices
  useEffect(() => {
    if (product_type === "Variable Product" && data.variants_price?.length > 0) {
      const firstVariant = data.variants_price[0];
      const firstColor = _.get(firstVariant, "Colour", "");
      
      // Use the propSelectedColor if available, otherwise use first color
      const initialColor = propSelectedColor || firstColor;
      
      setSelectedColor(initialColor);
      setCurrentPriceSplitup(firstVariant);
      setVariant([initialColor]);
      
      // Set price based on user role
      let price = 0;
      if (user.role === "Dealer") {
        price = _.get(firstVariant, "Deler_product_price", 0);
      } else if (user.role === "Corporate") {
        price = _.get(firstVariant, "corporate_product_price", 0);
      } else {
        price = _.get(firstVariant, "customer_product_price", 0);
      }
      
      setCheckOutState((prevState) => ({
        ...prevState,
        product_price: price,
        product_variants: firstVariant,
      }));
      setStockCount(_.get(firstVariant, "stock_count", 0));
      
      // Notify parent component about initial color selection
      if (onColorChange && !propSelectedColor) {
        onColorChange(initialColor);
      }
    }

    // Initialize quantity
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
  }, [quantityDiscounts, quantityType, maxQuantity, data.variants_price, user.role, propSelectedColor, onColorChange]);

  // Update local selectedColor when prop changes
  useEffect(() => {
    if (propSelectedColor && propSelectedColor !== selectedColor) {
      setSelectedColor(propSelectedColor);
    }
  }, [propSelectedColor]);

  // Rating and review effects
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

  // Handle color selection
  const handleOnChangeSelectOption = async (selectedValue, index) => {
    try {
      const updatedVariant = [...variant];
      updatedVariant[index] = selectedValue;
      setVariant(updatedVariant);
      
      // Find the variant price data for the selected variant
      const variantPriceData = data.variants_price.find(
        (vp) => vp.Colour === selectedValue
      );

      if (variantPriceData) {
        setCurrentPriceSplitup(variantPriceData);
        setSelectedColor(selectedValue);
        
        // Set price based on user role
        let price = 0;
        if (user.role === "Dealer") {
          price = _.get(variantPriceData, "Deler_product_price", 0);
        } else if (user.role === "Corporate") {
          price = _.get(variantPriceData, "corporate_product_price", 0);
        } else {
          price = _.get(variantPriceData, "customer_product_price", 0);
        }

        setCheckOutState((prevState) => ({
          ...prevState,
          product_price: price,
          product_variants: variantPriceData,
        }));
        setStockCount(_.get(variantPriceData, "stock_count", 0));

        // Notify parent component about color change for image update
        if (onColorChange && typeof onColorChange === 'function') {
          onColorChange(selectedValue);
        }
      }
    } catch (err) {
      console.log("Error in handleOnChangeSelectOption:", err);
      toast.error("Failed to change color variant");
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
    } catch (err) {
      return false;
    }
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
    const mrpPrice = Number(_.get(currentPriceSplitup, "MRP_price", 0));
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
          onClick={() => setShowBulkOrderForm(true)}
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

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // OTP Functions
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
        {/* Product Header */}
        <div className="space-y-1 flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-gray-900 font-bold mb-2 text-3xl md:text-4xl lg:text-[2.8rem] leading-tight w-[80%]">
              {data.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              {data.label?.map((label, index) => (
                <span key={index}>{generateLabel(label)}</span>
              ))}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={handleNativeShare}
              className="bg-[#f2c41a] hover:bg-[#f2c41a] text-black p-3 rounded-full shadow-md transition-all duration-300"
            >
              <IoShareSocial />
            </button>

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

            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-md px-3 py-2 shadow-md text-right h-fit w-fit absolute top-16 right-0"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-white/70 text-xs line-through">
                  ₹
                  {_.get(currentPriceSplitup, "MRP_price", 0) ||
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
        </div>

        {/* Product Description */}
        <div>
          <h2 className="text-xl font-semibold">
            {_.get(data, "product_description_tittle", "")}
          </h2>
          <ul className="grid grid-cols-1 my-2 gap-2 text-md list-disc pl-5 w-[70%]">
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

        {/* Color Variants Section */}
        {colorVariants.options.length > 0 && (
          <div className="w-full space-y-2">
            <Text strong className="block mb-2">
              Colour:
            </Text>
            <div className="flex flex-wrap gap-3">
              {colorVariants.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                    selectedColor === option.value
                      ? "ring-2 ring-blue-500 rounded-lg"
                      : "hover:ring-2 hover:ring-blue-300 rounded-lg"
                  }`}
                  onClick={() => handleOnChangeSelectOption(option.value, 0)}
                >
                  <div
                    className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden"
                    style={{
                      backgroundImage: `url(${option.image_names[0]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <Text className="text-xs mt-1 text-center capitalize">
                    {option.value}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Section */}
        <div className="w-full flex flex-wrap space-y-2">
          <div className="flex items-center gap-2 space-x-1">
            <Text strong className="block mb-2">
              Quantity:
            </Text>
            <Select
              value={quantity}
              onChange={handleQuantitySelect}
              options={quantityOptions}
              className="w-[30vw]"
              placeholder="Select quantity"
              dropdownRender={quantityDropdownRender}
              open={quantityDropdownVisible}
              onDropdownVisibleChange={setQuantityDropdownVisible}
            />
          </div>

          <div className="grid grid-cols-2">
            {_.get(data, "name", "") === "Matt Finish" && (
              <div className="flex items-center gap-2 space-x-1">
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
            <div className="flex items-center justify-between">
              <Text strong className="text-gray-800">
                Deal Price:
              </Text>
              <div className="text-right flex items-baseline">
                <Text delete className="text-md text-gray-500 mr-2">
                  MRP {formatPrice(_.get(currentPriceSplitup, "MRP_price", 0))}
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
          <div className="flex items-center justify-between">
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
                <div className="mt-2 flex items-center justify-between flex-row-reverse">
                  <Checkbox
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                  >
                    I confirm this design
                  </Checkbox>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => setDesignPreviewVisible(true)}
                  >
                    View Design
                  </Button>
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

export default ProductDetailVarient;