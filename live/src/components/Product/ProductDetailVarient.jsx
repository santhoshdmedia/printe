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
  Row,
  Col,
  Form,
  message,
} from "antd";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import UploadFileButton from "../UploadFileButton";
import { useNavigate } from "react-router-dom";
import { IconHelper } from "../../helper/IconHelper";
import { FacebookIcon, WhatsappIcon } from "react-share";
import { IoShareSocial } from "react-icons/io5";
import { addToShoppingCart, bulkOrder, resendOtp, verifyOtp,notifyWhenAvailable } from "../../helper/api_helper";
import Swal from "sweetalert2";
import { ADD_TO_CART } from "../../redux/slices/cart.slice";
import {
  DISCOUNT_HELPER,
  GST_DISCOUNT_HELPER,
  Gst_HELPER
} from "../../helper/form_validation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCartOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  PlusOutlined,
  LoadingOutlined,
   MailOutlined,
  PhoneOutlined,
  UserOutlined
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { PincodeDeliveryCalculator } from "./ProductDetails.jsx";

const { Title, Text, Paragraph } = Typography;

// Custom Modal Component
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
      className={`fixed inset-0 !z-50 flex items-start justify-center p-2 ${topPosition} ${
        isMobile ? "items-end" : "items-center"
      }`}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
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

// Custom Popover Component
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

// Helper functions
const getProductImages = (data) => {
  let images;
  if (_.get(data, "variants[0].variant_type", []) == "image_variant") {
    images = _.get(data, "variants[0].options[0].image_names", []);
  } else {
    images = _.get(data, "images", []);
  }
  
  if (!images || images.length === 0) return [];

  return images.map(image => {
    if (typeof image === 'string') {
      return image;
    } else if (image && image.path) {
      return image.path;
    }
    return '';
  }).filter(Boolean);
};

const getFirstProductImage = (data) => {
  const images = getProductImages(data);
  return images.length > 0 ? images[0] : "";
};

const getRoleFields = (role) => {
  switch (role) {
    case 'Dealer':
      return {
        quantity: 'Dealer_quantity',
        discount: 'Dealer_discount',
        freeDelivery: 'free_delivery_dealer',
        recommended: 'recommended_stats_dealer',
        deliveryCharges: 'delivery_charges_dealer'
      };
    case 'Corporate':
      return {
        quantity: 'Corporate_quantity',
        discount: 'Corporate_discount',
        freeDelivery: 'free_delivery_corporate',
        recommended: 'recommended_stats_corporate',
        deliveryCharges: 'delivery_charges_corporate'
      };
    default:
      return {
        quantity: 'Customer_quantity',
        discount: 'Customer_discount',
        freeDelivery: 'free_delivery_customer',
        recommended: 'recommended_stats_customer',
        deliveryCharges: 'delivery_charges_customer'
      };
  }
};

// Price calculation helper functions
const calculateUnitPrice = (basePrice, discountPercentage, userRole, gst = 0) => {
  if (userRole === "Corporate" || userRole === "Dealer") {
    return DISCOUNT_HELPER(discountPercentage, basePrice);
  } else {
    return GST_DISCOUNT_HELPER(discountPercentage, basePrice, gst);
  }
};

const calculateMRPUnitPrice = (basePrice, userRole, gst = 0) => {
  if (userRole === "Corporate" || userRole === "Dealer") {
    return basePrice;
  } else {
    return basePrice * (1 + gst / 100);
  }
};

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
  onVariantChange,
  selectedVariants: propSelectedVariants = {},
}) => {
  const { user } = useSelector((state) => state.authSlice);
  const [form] = Form.useForm();
  const [notifyForm] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Product data constants
  const stockCount = _.get(data, "stock_count", 0);
  const productionTime = _.get(data, "Production_time", "2");
  const arrangeTime = _.get(data, "Stock_Arrangement_time", "3");
  const processing_item = stockCount === 0
    ? Number(productionTime) + Number(arrangeTime)
    : Number(productionTime);
  const productType = _.get(data, "type", "Variable Product");
  const availableVariants = data.variants || [];
  const quantityDiscounts = _.get(data, "quantity_discount_splitup", []);
  const dropdownGap = _.get(data, "dropdown_gap", 100);
  const quantityType = _.get(data, "quantity_type", "dropdown");
  const maxQuantity = _.get(data, "max_quantity", 10000);
  const unit = _.get(data, "unit", "pcs");
  const gst = _.get(data, "GST", 18);

  // State declarations
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState({
    uuid: "",
    percentage: 0,
  });
  const [currentPriceSplitup, setCurrentPriceSplitup] = useState({});
  const [checked, setChecked] = useState(false);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [deliveryCharges, setDeliveryCharges] = useState(100);
  const [needDesignUpload, setNeedDesignUpload] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stock, setStockCount] = useState(0);
  const [designPreviewVisible, setDesignPreviewVisible] = useState(false);
  const [quantityDropdownVisible, setQuantityDropdownVisible] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [noDesignUpload, setNoDesignUpload] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [showBulkOrderForm, setShowBulkOrderForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Checkout state
  const [checkOutState, setCheckOutState] = useState({
    product_image: getFirstProductImage(data),
    product_design_file: "",
    product_name: _.get(data, "name", ""),
    category_name: _.get(data, "category_details.main_category_name", ""),
    subcategory_name: _.get(data, "sub_category_details.sub_category_name", ""),
    product_price: 0,
    product_variants: {},
    product_quantity: 0,
    product_seo_url: _.get(data, "seo_url", ""),
    product_id: _.get(data, "_id", ""),
    MRP_savings: 0,
    TotalSavings: 0,
    FreeDelivery: false,
    DeliveryCharges: 100,
  });

  const { isGettingVariantPrice } = useSelector((state) => state.publicSlice);

  // Helper function to get role-based price from variant data
  const getRoleBasedPrice = useCallback((variantData) => {
    if (!variantData) return 0;

    if (user?.role === "Dealer") {
      return _.get(variantData, "Deler_product_price", _.get(variantData, "price", 0));
    } else if (user?.role === "Corporate") {
      return _.get(variantData, "corporate_product_price", _.get(variantData, "price", 0));
    } else {
      return _.get(variantData, "customer_product_price", _.get(variantData, "price", 0));
    }
  }, [user?.role]);

  // Find matching variant price based on selected variants
  const findMatchingVariantPrice = useCallback(
    (variants) => {
      if (!data.variants_price) return null;

      return data.variants_price.find((variantPrice) => {
        return Object.keys(variants).every((variantName) => {
          return variantPrice[variantName] === variants[variantName];
        });
      });
    },
    [data.variants_price]
  );

  // Update variant data when variant changes
  const updateVariantData = useCallback(
    (variantData) => {
      if (!variantData) return;

      setCurrentPriceSplitup(variantData);
      const price = getRoleBasedPrice(variantData);

      setCheckOutState((prevState) => ({
        ...prevState,
        product_price: price,
        product_variants: variantData,
      }));
      setStockCount(_.get(variantData, "stock_count", _.get(variantData, "stock", 0)));
    },
    [getRoleBasedPrice]
  );

  // Initialize variants and prices
  useEffect(() => {
    if (productType === "Variable Product" && data.variants_price?.length > 0) {
      // Set initial selected variants
      const initialSelectedVariants = {};
      availableVariants.forEach((variant) => {
        if (variant.options?.length > 0) {
          initialSelectedVariants[variant.variant_name] = variant.options[0].value;
        }
      });

      setSelectedVariants(initialSelectedVariants);

      // Find matching variant price
      const matchingVariant = findMatchingVariantPrice(initialSelectedVariants);

      if (matchingVariant) {
        updateVariantData(matchingVariant);

        // Notify parent about initial variant selection
        if (onVariantChange) {
          onVariantChange(initialSelectedVariants);
        }
      }
    } else {
      // For simple products
      const firstVariant = data.variants_price?.[0] || {};
      updateVariantData(firstVariant);
    }

    // Initialize quantity
    initializeQuantity();
  }, [
    data.variants_price,
    availableVariants,
    productType,
    findMatchingVariantPrice,
    updateVariantData,
    onVariantChange,
  ]);

  // Update local selectedVariants when prop changes
  useEffect(() => {
    if (propSelectedVariants && Object.keys(propSelectedVariants).length > 0) {
      setSelectedVariants(propSelectedVariants);

      // Find matching variant price for the prop variants
      const matchingVariant = findMatchingVariantPrice(propSelectedVariants);
      if (matchingVariant) {
        updateVariantData(matchingVariant);
      }
    }
  }, [propSelectedVariants, findMatchingVariantPrice, updateVariantData]);

  // Initialize quantity settings
  const initializeQuantity = useCallback(() => {
    const roleFields = getRoleFields(user?.role);

    if (quantityType !== "textbox" && quantityDiscounts.length > 0) {
      // Get the first available quantity for the current user role
      const firstAvailableItem = quantityDiscounts.find((item) => 
        item[roleFields.quantity] && Number(item[roleFields.quantity]) > 0
      ) || quantityDiscounts[0];

      if (firstAvailableItem) {
        const initialQuantity = Number(firstAvailableItem[roleFields.quantity]);
        const initialDiscount = Number(firstAvailableItem[roleFields.discount] || 0);
        const initialFreeDelivery = firstAvailableItem[roleFields.freeDelivery] || false;
        const initialDeliveryCharges = initialFreeDelivery ? 0 : Number(firstAvailableItem[roleFields.deliveryCharges] || 100);

        setQuantity(initialQuantity);
        setDiscountPercentage({
          uuid: _.get(firstAvailableItem, "uniqe_id", ""),
          percentage: initialDiscount,
        });
        setFreeDelivery(initialFreeDelivery);
        setDeliveryCharges(initialDeliveryCharges);
        setCheckOutState(prev => ({
          ...prev,
          product_quantity: initialQuantity,
          DeliveryCharges: initialDeliveryCharges,
          FreeDelivery: initialFreeDelivery,
        }));
      }
    } else {
      setDiscountPercentage({ uuid: "", percentage: 0 });
      setFreeDelivery(false);
      setDeliveryCharges(100);
      setQuantity(null);
      setCheckOutState(prev => ({
        ...prev,
        product_quantity: 0,
        DeliveryCharges: 100,
        FreeDelivery: false,
      }));
    }
  }, [user?.role, quantityType, quantityDiscounts]);

  // Handle variant selection
  const handleVariantChange = useCallback(
    async (variantName, selectedValue) => {
      try {
        const updatedVariants = {
          ...selectedVariants,
          [variantName]: selectedValue,
        };

        setSelectedVariants(updatedVariants);

        // Find the variant price data for the selected combination
        const variantPriceData = findMatchingVariantPrice(updatedVariants);

        if (variantPriceData) {
          updateVariantData(variantPriceData);

          // Notify parent component about variant changes
          if (onVariantChange) {
            onVariantChange(updatedVariants);
          }
        } else {
          console.warn("No variant price data found for:", updatedVariants);
          toast.error("This variant combination is not available");
        }
      } catch (err) {
        console.log("Error in handleVariantChange:", err);
        toast.error("Failed to change variant");
      }
    },
    [selectedVariants, findMatchingVariantPrice, updateVariantData, onVariantChange]
  );

  // Generate quantity options based on user role
  const generateQuantityOptions = useCallback(() => {
    const roleFields = getRoleFields(user?.role);

    if (quantityType === "textbox") {
      const options = [];
      for (let i = dropdownGap; i <= maxQuantity; i += dropdownGap) {
        options.push({ value: i, label: i.toString() });
      }
      return options;
    } else {
      return quantityDiscounts
        .filter(item => item[roleFields.quantity])
        .map((item) => ({
          value: Number(item[roleFields.quantity]),
          label: `${item[roleFields.quantity]}`,
          Free_Delivery: item[roleFields.freeDelivery] || false,
          discount: Number(item[roleFields.discount] || 0),
          uuid: item.uniqe_id,
          stats: item[roleFields.recommended] || "No comments",
          deliveryCharges: Number(item[roleFields.deliveryCharges] || 100)
        }))
        .sort((a, b) => a.value - b.value);
    }
  }, [user?.role, quantityType, quantityDiscounts, dropdownGap, maxQuantity]);

  const quantityOptions = generateQuantityOptions();

  // Handle quantity selection
  const handleQuantitySelect = useCallback((selectedQuantity) => {
    const roleFields = getRoleFields(user?.role);
    
    if (quantityType === "textbox") {
      const availableDiscounts = quantityDiscounts
        .filter(item => item[roleFields.quantity] && Number(item[roleFields.quantity]) <= selectedQuantity)
        .sort((a, b) => Number(b[roleFields.quantity]) - Number(a[roleFields.quantity]));
        
      const selectedDiscount = availableDiscounts[0];

      setQuantity(selectedQuantity);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: selectedQuantity,
      }));

      if (selectedDiscount) {
        setDiscountPercentage({
          uuid: selectedDiscount.uniqe_id,
          percentage: Number(selectedDiscount[roleFields.discount] || 0),
        });
        setFreeDelivery(selectedDiscount[roleFields.freeDelivery] || false);
        const charges = selectedDiscount[roleFields.freeDelivery] ? 0 : Number(selectedDiscount[roleFields.deliveryCharges] || 100);
        setDeliveryCharges(charges);
        
        setCheckOutState(prev => ({
          ...prev,
          DeliveryCharges: charges,
          FreeDelivery: selectedDiscount[roleFields.freeDelivery] || false,
        }));
      } else {
        setDiscountPercentage({ uuid: "", percentage: 0 });
        setFreeDelivery(false);
        setDeliveryCharges(100);
        setCheckOutState(prev => ({
          ...prev,
          DeliveryCharges: 100,
          FreeDelivery: false,
        }));
      }
    } else {
      const selectedDiscount = quantityDiscounts.find(
        (item) => Number(item[roleFields.quantity]) === selectedQuantity
      );

      setQuantity(selectedQuantity);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: selectedQuantity,
      }));

      if (selectedDiscount) {
        setDiscountPercentage({
          uuid: selectedDiscount.uniqe_id,
          percentage: Number(selectedDiscount[roleFields.discount] || 0),
        });
        setFreeDelivery(selectedDiscount[roleFields.freeDelivery] || false);
        const charges = selectedDiscount[roleFields.freeDelivery] ? 0 : Number(selectedDiscount[roleFields.deliveryCharges] || 100);
        setDeliveryCharges(charges);
        
        setCheckOutState(prev => ({
          ...prev,
          DeliveryCharges: charges,
          FreeDelivery: selectedDiscount[roleFields.freeDelivery] || false,
        }));
      } else {
        setDiscountPercentage({ uuid: "", percentage: 0 });
        setFreeDelivery(false);
        setDeliveryCharges(100);
        setCheckOutState(prev => ({
          ...prev,
          DeliveryCharges: 100,
          FreeDelivery: false,
        }));
      }
    }
    setQuantityDropdownVisible(false);
  }, [user?.role, quantityType, quantityDiscounts]);

  // Price calculation functions
  const formatPrice = useCallback((price) => {
    return `₹${parseFloat(price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  const formatMRPPrice = useCallback((price) => {
    return `₹${parseFloat(price || 0).toFixed(2)}`;
  }, []);

  // Calculate unit prices
  const getUnitPrice = useMemo(() => {
    const basePrice = Number(_.get(checkOutState, "product_price", 0));
    return calculateUnitPrice(basePrice, discountPercentage.percentage, user?.role, gst);
  }, [checkOutState.product_price, discountPercentage.percentage, user?.role, gst]);

  const getMRPUnitPrice = useMemo(() => {
    const basePrice = Number(_.get(checkOutState, "product_price", 0));
    return calculateMRPUnitPrice(basePrice, user?.role, gst);
  }, [checkOutState.product_price, user?.role, gst]);

  const getOriginalUnitPrice = useMemo(() => {
    const basePrice = Number(_.get(checkOutState, "product_price", 0));
    if (user?.role === "Corporate" || user?.role === "Dealer") {
      return basePrice;
    } else {
      return basePrice * (1 + gst / 100);
    }
  }, [checkOutState.product_price, user?.role, gst]);

  // Calculate total prices
  const calculateTotalPrice = useCallback(() => {
    if (!quantity) return 0;
    return (getUnitPrice * quantity).toFixed(2);
  }, [getUnitPrice, quantity]);
  const calculateGstPrice = useCallback(() => {
    if (!quantity) return 0;
    return Number(getUnitPrice).toFixed(2);
  }, [getUnitPrice, quantity]);

  const calculateMRPTotalPrice = useCallback(() => {
    if (!quantity) return 0;
    const mrpPrice = Number(_.get(currentPriceSplitup, "MRP_price", 0));
    return (mrpPrice * quantity).toFixed(2);
  }, [currentPriceSplitup, quantity]);

  const calculateOriginalTotalPrice = useCallback(() => {
    if (!quantity) return 0;
    return (getOriginalUnitPrice * quantity).toFixed(2);
  }, [getOriginalUnitPrice, quantity]);

  // Calculate savings
  const calculateMRPSavings = useCallback(() => {
    if (!quantity) return 0;
    const mrpPrice = Number(_.get(currentPriceSplitup, "MRP_price", 0));
    const currentUnitPrice = getMRPUnitPrice;
    const savingsPerUnit = mrpPrice - currentUnitPrice;
    return (savingsPerUnit * quantity).toFixed(2);
  }, [currentPriceSplitup, getMRPUnitPrice, quantity]);

  const calculateDiscountSavings = useCallback(() => {
    if (!quantity) return 0;
    const originalUnitPrice = getOriginalUnitPrice;
    const discountedUnitPrice = getUnitPrice;
    const savingsPerUnit = originalUnitPrice - discountedUnitPrice;
    return (savingsPerUnit * quantity).toFixed(2);
  }, [getOriginalUnitPrice, getUnitPrice, quantity]);

  const calculateTotalSavings = useCallback(() => {
    const mrpSavings = parseFloat(calculateMRPSavings());
    const discountSavings = parseFloat(calculateDiscountSavings());
    return (mrpSavings + discountSavings).toFixed(2);
  }, [calculateMRPSavings, calculateDiscountSavings]);

  // Calculate percentage discount for deal price
  const calculateDealPercentageDiscount = useCallback(() => {
    if (!quantity) return 0;
    
    const mrpTotal = parseFloat(calculateMRPTotalPrice());
    const dealTotal = parseFloat(calculateTotalPrice());
    
    if (mrpTotal === 0 || dealTotal >= mrpTotal) return 0;
    
    const percentage = ((mrpTotal - dealTotal) / mrpTotal) * 100;
    return Math.round(percentage);
  }, [calculateMRPTotalPrice, calculateTotalPrice, quantity]);

  // Calculate percentage savings
  const calculateTotalSavingsPercentage = useCallback(() => {
    const totalSavings = parseFloat(calculateTotalSavings());
    const originalTotal = parseFloat(calculateOriginalTotalPrice());
    if (originalTotal === 0) return 0;
    return ((totalSavings / originalTotal) * 100).toFixed(1);
  }, [calculateTotalSavings, calculateOriginalTotalPrice]);

  // Render variant selector based on variant type
  const renderVariantSelector = useCallback(
    (variant) => {
      const { variant_name, variant_type, options } = variant;

      if (!options || options.length === 0) return null;

      // For color variants
      if (variant_type === "color_variant") {
        return (
          <div className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
            <Text strong className="block mb-2 md:mb-0 md:w-24">
              {variant_name}:
            </Text>
            <div className="flex flex-wrap gap-2">
              {options.map((option, index) => (
                <Tooltip key={index} title={option.value}>
                  <div
                    className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-1 ${
                      selectedVariants[variant_name] === option.value
                        ? "ring-2 ring-blue-500 rounded-lg"
                        : "border border-gray-200 rounded-lg hover:border-blue-300"
                    }`}
                    onClick={() => handleVariantChange(variant_name, option.value)}
                  >
                    <div
                      className="w-12 h-12 rounded-md overflow-hidden border border-gray-300"
                      style={{
                        backgroundColor: option.color_code || '#f0f0f0',
                      }}
                    >
                      {!option.color_code && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-xs text-gray-500">
                            {option.value}
                          </span>
                        </div>
                      )}
                    </div>
                    <Text className="text-xs mt-1 text-center capitalize max-w-[60px] truncate">
                      {option.value}
                    </Text>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        );
      }

      // For image variants
      if (variant_type === "image_variant") {
        return (
          <div className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
            <Text strong className="block mb-2 md:mb-0 md:w-24">
              {variant_name}:
            </Text>
            <div className="flex flex-wrap gap-2">
              {options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex flex-col items-center">
                  <div
                    onClick={() => handleVariantChange(variant_name, option.value)}
                    className={`cursor-pointer border-2 p-1 rounded transition duration-200 ${
                      selectedVariants[variant_name] === option.value
                        ? "border-blue-500 shadow-md"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                    style={{ width: "60px", height: "60px" }}
                  >
                    <img
                      src={option.image_names?.[0]?.path || option.image_names?.[0]}
                      className="w-full h-full object-contain"
                      alt={option.value}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
                      }}
                    />
                  </div>
                  <Text className="text-xs mt-1 text-center">
                    {option.value}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Default dropdown for other variants
      return (
        <div className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
          <Text strong className="block mb-2 md:mb-0 md:w-24">
            {variant_name}:
          </Text>
          <Select
            value={selectedVariants[variant_name]}
            onChange={(value) => handleVariantChange(variant_name, value)}
            className="w-full"
            placeholder={`Select ${variant_name}`}
          >
            {options.map((option, index) => (
              <Select.Option key={index} value={option.value}>
                {option.value}
              </Select.Option>
            ))}
          </Select>
        </div>
      );
    },
    [selectedVariants, handleVariantChange]
  );

  // Helper functions
  const scrollToProductDetails = useCallback(() => {
    const targetElement = document.getElementById("overview");
    if (targetElement) {
      const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 180;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  }, []);

  const handleUploadImage = useCallback((fileString) => {
    setCheckOutState((prev) => ({ ...prev, product_design_file: fileString }));
  }, []);

  const goToShoppingCart = useCallback(() => {
    navigate("/shopping-cart");
  }, [navigate]);

  // Quantity dropdown render
  const quantityDropdownRender = useCallback(
    (menu) => (
      <div
        className="p-2 rounded-lg shadow-xl bg-white"
        onMouseLeave={() => setQuantityDropdownVisible(false)}
      >
        <div className="overflow-y-auto max-h-80 space-y-3">
          {quantityOptions.map((item) => {
            const itemUnitPrice = calculateUnitPrice(
              Number(_.get(checkOutState, "product_price", 0)),
              quantityType === "dropdown" ? item.discount : discountPercentage.percentage,
              user?.role,
              gst
            );
            const itemTotalPrice = itemUnitPrice * item.value;
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

                  <div className="flex flex-wrap gap-2">
                    {quantityType === "dropdown" && item.discount > 0 && (
                      <span className="text-green-600 text-sm font-medium inline-flex items-center">
                        <CheckCircleOutlined className="mr-1" />
                        {item.discount}% discount
                      </span>
                    )}
                    {quantityType === "dropdown" && item.Free_Delivery && (
                      <span className="text-blue-600 text-sm font-medium inline-flex items-center">
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
                    {formatPrice(itemTotalPrice)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatPrice(itemUnitPrice)}/{unit}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {quantityOptions.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No quantity options available
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => setShowBulkOrderForm(true)}
            className="w-full py-2 px-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <PlusOutlined />
            Bulk Order Inquiry
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Prices include all applicable taxes •
          </p>
        </div>
      </div>
    ),
    [quantityOptions, checkOutState.product_price, quantity, unit, handleQuantitySelect, formatPrice, quantityType, discountPercentage.percentage, user?.role, gst]
  );

  // Handle buy/add to cart
  const handleBuy = async () => {
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

      const getGuestId = () => {
        let guestId = localStorage.getItem('guestId');

        if (!guestId) {
          guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('guestId', guestId);
        }

        return guestId;
      };

      const token = localStorage.getItem("userData") || "guest";

      const updatedCheckoutState = {
        ...checkOutState,
        guestId: getGuestId(),
        userRole: token,
        sgst: Number(gst / 2),
        cgst: Number(gst / 2),
        MRP_savings: calculateMRPSavings(),
        TotalSavings: calculateTotalSavings(),
        FreeDelivery: freeDelivery,
        DeliveryCharges: deliveryCharges,
        noCustomtation: noDesignUpload,
        final_total: Number(calculateTotalPrice()),
      };

      const result = await addToShoppingCart(updatedCheckoutState);

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
 // Handle Notify When Available
  const handleNotify = () => {
    // Check if user is logged in
    if (user && user.email) {
      // User is logged in, send notification immediately
      sendNotification({
        email: user.email,
        phone: user.phone || "",
        name: user.name || ""
      });
    } else {
      // User is not logged in, show popup
      setShowNotifyModal(true);
      notifyForm.resetFields();
    }
  };

  const sendNotification = async (userData) => {
    try {
      setSendingNotification(true);
      
      const notificationData = {
        productName: _.get(data, "name", ""),
        productId: _.get(data, "Vendor_Code", data._id),
        productUrl: window.location.href,
        userEmail: userData.email,
        userPhone: userData.phone,
        userName: userData.name,
        timestamp: new Date().toISOString(),
      };
      
      const result = await notifyWhenAvailable(notificationData);
      
      if (result.data.success) {
        toast.success("We'll notify you when this product is available!");
        setShowNotifyModal(false);
        notifyForm.resetFields();
      } else {
        toast.error("Failed to submit notification request");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to submit notification request");
    } finally {
      setSendingNotification(false);
    }
  };

  const handleNotifySubmit = async (values) => {
    await sendNotification(values);
  };

  // Share functionality
  const shareProduct = useCallback(
    (platform) => {
      const productUrl = encodeURIComponent(window.location.href);
      const productName = encodeURIComponent(data.name);
      const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`,
        whatsapp: `https://api.whatsapp.com/send?text=Check out this product: ${productName} ${productUrl}`,
      };

      if (shareUrls[platform]) {
        window.open(shareUrls[platform], "_blank");
      }
      setShowShareMenu(false);
    },
    [data.name]
  );

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
        setShowShareMenu(!showShareMenu);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  // Bulk Order Functions
  const handleBulkOrderSubmit = async (values) => {
    try {
      const result = await bulkOrder(values);
      message.success("Bulk order inquiry submitted successfully!");
      setShowBulkOrderForm(false);
      form.resetFields();
    } catch (error) {
      message.error("Failed to submit bulk order inquiry");
    }
  };

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
      const userData = { email: email, otp: otp };
      const response = await verifyOtp(userData);
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

  const handleNoCustomization = (e) => {
    setNoDesignUpload(e.target.checked);
    if (e.target.checked) {
      setNeedDesignUpload(false);
    } else {
      setNeedDesignUpload(true);
    }
  };

  const handleDesignRemove = () => {
    setCheckOutState(prev => ({ ...prev, product_design_file: "" }));
  };

  // Processing Time Info
  const ProcessingTimeInfo = () => (
    <div className="max-h-[400px] overflow-y-auto text-gray-700">
      <Paragraph>
        After our <b>designing team</b> completes your design, you'll receive a <b>WhatsApp message</b> from us. You just need to reply "Yes" — and we'll immediately start processing your order to the next step.
      </Paragraph>
      <Paragraph>
        Please note that <b>delivery time may delay</b>, but don't worry — your order is <b>100% safe and secure</b> and will reach your <b>doorstep</b>.
      </Paragraph>
      <Paragraph>
        However, kindly note that <b>returns or exchanges are not applicable for customized products</b> due to their personalized nature. So please share your <b>expectations clearly</b> — we'll make sure your order is prepared <b>perfectly</b>.
      </Paragraph>
      <Alert
        message="If you place an order without a custom design, it will be delivered within 3–4 working days."
        type="info"
        showIcon
        className="!py-2"
      />
    </div>
  );

  // Label generator
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

  return (
    <Spin
      spinning={loading}
      indicator={
        <IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />
      }
    >
      <div className="font-primary w-full space-y-2 relative">
        {/* Product Header */}
        <div className="space-y-1 flex flex-col md:flex-row justify-between items-start gap-4">
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

          <div className="w-full md:w-auto flex flex-col md:flex-row items-start md:items-center gap-3 md:relative">
            <div className="md:hidden flex flex-row-reverse items-center gap-3 w-full justify-between my-2">
              <button
                onClick={handleNativeShare}
                className="bg-[#f2c41a] hover:bg-[#f2c41a] text-black p-3 rounded-full shadow-md transition-all duration-300"
              >
                <IoShareSocial />
              </button>

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
                    {formatPrice(_.get(currentPriceSplitup, "MRP_price", 0))}
                  </span>
                  <h3 className="text-white text-base font-semibold">
                    {quantity
                      ? formatPrice(getUnitPrice)
                      : "Select Qty"}
                  </h3>
                </div>
              </motion.div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleNativeShare}
                className="bg-[#f2c41a] hover:bg-[#f2c41a] text-black p-3 rounded-full shadow-md transition-all duration-300 hidden"
              >
                <IoShareSocial />
              </button>

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
                    {formatPrice(_.get(currentPriceSplitup, "MRP_price", 0))}
                  </span>
                  <h3 className="text-white text-base font-semibold">
                    {formatPrice(getUnitPrice)}
                  </h3>
                </div>
              </motion.div>
            </div>

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
              onClick={scrollToProductDetails}
            >
              read more
            </li>
          </ul>
        </div>

        {/* Variants Section */}
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
        </div>

        {/* Selected Variants Summary */}
        {Object.keys(selectedVariants).length > 0 && (
          <Card size="small" className="!bg-blue-50">
            {availableVariants.length > 0 && (
              <div className="w-full flex flex-col space-y-4">
                {availableVariants.map((variant, index) => (
                  <div key={index}>
                    {renderVariantSelector(variant)}
                  </div>
                ))}
              </div>
            )}
            <Text strong className="text-gray-800 block mb-2">
              Selected Options:
            </Text>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedVariants).map(([key, value]) => (
                <Tag key={key} color="blue" className="capitalize">
                  {key}: {value}
                </Tag>
              ))}
            </div>
          </Card>
        )}

        {/* Total Price Section */}
        <Card className="bg-blue-50 rounded-lg border-0">
          <div className="space-y-3">
            {/* Deal Price with Percentage Discount */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex-1">
                <Text strong className="text-gray-800">
                  Deal Price:
                </Text>
                
              </div>
              <div className="text-right flex flex-col md:flex-row md:items-baseline gap-1">
                <Text delete className="text-md text-gray-500 md:mr-2">
                  {formatMRPPrice(calculateMRPTotalPrice())}
                </Text>
                <Title level={4} className="!m-0 !text-green-600">
                  {quantity
                    ? formatPrice(calculateTotalPrice())
                    : formatPrice(0)}
                </Title>
              </div>
            </div>

            {/* Price Breakdown */}
            {/* {quantity && (
              <div className="space-y-2 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium">{formatPrice(getOriginalUnitPrice)}</span>
                </div>
                
                {discountPercentage.percentage > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Discount ({discountPercentage.percentage}%):</span>
                    <span className="text-green-600 font-medium">
                      -{formatPrice(getOriginalUnitPrice - getUnitPrice)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Final Unit Price:</span>
                  <span className="font-medium text-blue-600">{formatPrice(getUnitPrice)}</span>
                </div>

                <div className="flex justify-between items-center text-sm border-t pt-2">
                  <span className="text-gray-600">Total for {quantity} {unit}:</span>
                  <span className="font-bold text-lg text-green-600">{formatPrice(calculateTotalPrice())}</span>
                </div>
              </div>
            )} */}

            {/* Savings Alerts */}
            <div className="space-y-2">
              {calculateTotalSavings() > 0 && (
                <Alert
                  message={
                    <div>
                      <div className="font-semibold ">
                         You Saved: {formatPrice(calculateMRPSavings())} &nbsp;(
                              {(user.role === "Dealer" || user.role === "Corporate")
                                ? <>{calculateDealPercentageDiscount()}% Discount</>
                                : <>{calculateTotalSavingsPercentage()}% Discount</>
                              })
                      </div>
                      
                      {calculateDiscountSavings() > 0 && (
                        <div className="text-sm mt-2">
                          Kudos! Additionally you saved {formatPrice(calculateDiscountSavings())} ({discountPercentage.percentage}% Discount)
                        </div>
                      )}
                      
                      {discountPercentage.percentage === 0 && quantity && (
                        <div className="mt-2 text-base text-amber-600">
                          💡 Select higher quantity to get extra discounts
                        </div>
                      )}
                      <div className="font-semibold text-green-700 text-lg mt-1">
                        🎉 You saved {formatPrice(calculateTotalSavings())} ({calculateTotalSavingsPercentage()}% OFF)
                      </div>

                    </div>
                  }
                  type="success"
                  showIcon
                  className="!py-3"
                />
              )}
            </div>

            {(user.role == "Corporate" || user.role == "Dealer") ? (
              <div className="text-gray-600">
                <h1 className="!text-[12px] text-gray-600">
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
            ) : ""}
            {quantity && (
              <div className="!text-[14px] text-gray-600">
                <h1>
                  Inclusive of all taxes for <span strong>{quantity}</span> Qty
                  <span className="font-bold">
 &nbsp;({(user.role === "Dealer" || user.role === "Corporate")
                    ? <>{formatPrice(Gst_HELPER(18, getUnitPrice))}</>
                    : <>{formatPrice(calculateGstPrice())}</>
                  }

                  
                  / piece)
                  </span>
                </h1>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full justify-between mt-4">
            <div className="flex items-center gap-2">
              <Text strong className="text-gray-700">
                Processing Time:
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

            <CustomModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Once you confirm, your order will get the green signal for processing"
              width={700}
              topPosition="!top-[-500px]"
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
              deliveryCharges={deliveryCharges}
            />
          </motion.div>
        </Card>

        {/* File Upload Section */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <Checkbox
              checked={noDesignUpload}
              onChange={handleNoCustomization}
            >
              Proceed without Design
            </Checkbox>

            {!noDesignUpload && (
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
            )}
          </div>

          {!noDesignUpload && (
            <div className="">
              {needDesignUpload ? (
                <>
                  <UploadFileButton
                    handleUploadImage={handleUploadImage}
                    buttonText="Drag & Drop Files Here or Browse Files"
                    className="w-full border-dotted rounded-lg flex flex-col items-center justify-center transition-colors"
                  />

                  {checkOutState.product_design_file && (
                    <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="md:order-1">
                        <Button
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={() => setDesignPreviewVisible(true)}
                          className="md:order-1"
                        >
                          View Design
                        </Button>
                        <Button
                          type="link"
                          onClick={handleDesignRemove}
                          className="md:order-1"
                        >
                          Remove
                        </Button>
                      </div>

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
            </div>
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
              <Input.TextArea
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
                       <>{_.get(data, "is_soldout", false) ? <Button
                         type="primary"
                         size="large"
                         icon={<MailOutlined />}
                         className="!h-12 !bg-gray-600 text-white hover:!bg-gray-700 hover:!text-white font-semibold w-full"
                         onClick={handleNotify}
                         loading={sendingNotification}
                       >
                         Notify When Available
                       </Button> : <Button
                         type="primary"
                         size="large"
                         icon={<ShoppingCartOutlined />}
                         className="!h-12 !bg-yellow-400 text-black hover:!bg-yellow-500 hover:!text-black font-semibold w-full"
                         onClick={handleBuy}
                         loading={loading}
                       >
                         Add To Cart
                       </Button>}
                       </>
                     )}
                   </div>
          <Divider className="!my-4" />

          {/* Design Preview Modal */}
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
            topPosition=""
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
         {/* Notify Modal (for non-logged in users) */}
                <CustomModal
                  open={showNotifyModal}
                  onClose={() => {
                    setShowNotifyModal(false);
                    notifyForm.resetFields();
                  }}
                  title="Notify When Available"
                  width={500}
                >
                  <Form
                    form={notifyForm}
                    layout="vertical"
                    onFinish={handleNotifySubmit}
                  >
                    <div className="space-y-4">
                      <div className="mb-4">
                        <Text className="text-gray-600">
                          We'll notify you when <strong>{data.name}</strong> is back in stock.
                        </Text>
                      </div>
        
                      <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                          { required: true, message: "Please enter your name" },
                          { min: 2, message: "Name must be at least 2 characters" },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined className="text-gray-400" />}
                          placeholder="Your full name"
                        />
                      </Form.Item>
        
                      <Form.Item
                        label="Email Address"
                        name="email"
                        rules={[
                          { required: true, message: "Please enter your email" },
                          { type: "email", message: "Please enter a valid email" },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined className="text-gray-400" />}
                          placeholder="your@email.com"
                        />
                      </Form.Item>
        
                      <Form.Item
                        label="Phone Number"
                        name="phone"
                        rules={[
                          { required: true, message: "Please enter your phone number" },
                          {
                            pattern: /^[0-9]{10}$/,
                            message: "Please enter a valid 10-digit phone number",
                          },
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined className="text-gray-400" />}
                          placeholder="9876543210"
                          maxLength={10}
                        />
                      </Form.Item>
        
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setShowNotifyModal(false);
                            notifyForm.resetFields();
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="flex-1 bg-blue-500"
                          loading={sendingNotification}
                        >
                          Notify Me
                        </Button>
                      </div>
                    </div>
                  </Form>
                </CustomModal>

        {/* Bulk Order Modal */}
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
                <Input.TextArea
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