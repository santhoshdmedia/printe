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
import React, { useCallback, useEffect, useState, useRef } from "react";
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
  notifyWhenAvailable
} from "../../helper/api_helper";
import Swal from "sweetalert2";
import {
  CUSTOM_ERROR_NOTIFICATION,
  CUSTOM_SUCCESS_SWALFIRE_NOTIFICATION,
  ERROR_NOTIFICATION,
} from "../../helper/notification_helper";
import { ADD_TO_CART } from "../../redux/slices/cart.slice";
import Soldout from "../../assets/logo/soldOut.png";

import {
  DISCOUNT_HELPER,
  GST_DISCOUNT_HELPER,
  Gst_HELPER
} from "../../helper/form_validation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartOutlined,
  PlusOutlined,
  MinusOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  CloseOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { CiFaceSmile } from "react-icons/ci";
import { CgSmileSad } from "react-icons/cg";
import toast from "react-hot-toast";
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

// Import social media icons
import { FaGoogle, FaInstagram, FaFacebook, FaYoutube, FaWhatsapp, FaGlobe, FaPlus } from "react-icons/fa";

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
      className={`fixed inset-0 !z-50 flex items-start justify-center p-2 ${topPosition} ${isMobile ? "items-end" : "items-center"
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
        className={`relative bg-white rounded-lg shadow-xl ${isMobile ? "w-full h-full rounded-b-none" : "max-h-[90vh]"
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
import { RiRocket2Fill } from "react-icons/ri";
import { GiWaxSeal } from "react-icons/gi";

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

// Animated Wax Seal Badge Component
const AnimatedWaxSealBadge = () => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="relative -top-20 h-0 overflow-visible"
  >
    <SimpleHangingSoldBoard />
    {/* Ribbon tail */}
  </motion.div>
);

// Helper functions
const getProductImages = (data) => {
  const images = _.get(data, "images", []);
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
const calculateUnitPrice = (basePrice, discountPercentage, userRole, gst = 18) => {
  if (userRole === "Corporate" || userRole === "Dealer" || userRole === "bni_user") {
    // For dealers and corporate - apply discount only (no GST)
    return DISCOUNT_HELPER(discountPercentage, basePrice);
  } else {
    // For customers - apply discount and then add GST
    return GST_DISCOUNT_HELPER(discountPercentage, basePrice, gst);
  }
};
const calculateUnitPriceWithoutGst = (basePrice, discountPercentage, userRole, gst = 18) => {
  // For dealers and corporate - apply discount only (no GST)
  return DISCOUNT_HELPER(discountPercentage, basePrice);

};

const calculateMRPUnitPrice = (basePrice, userRole, gst = 0) => {
  if (userRole === "Corporate" || userRole === "Dealer" || userRole === "bni_user") {
    // For dealers and corporate - base price without GST
    return basePrice;
  } else {
    // For customers - base price with GST
    return basePrice * (1 + gst / 100);
  }
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
  const [notifyForm] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get role-based price
  const getRoleBasedPrice = () => {
    const product_type = _.get(data, "type", "Stand Alone Product");

    if (user.role === "Dealer") {
      return product_type === "Stand Alone Product"
        ? _.get(data, "Deler_product_price", 0) || _.get(data, "single_product_price", 0)
        : _.get(data, "variants_price[0].Deler_product_price", "");
    } else if (user.role === "Corporate") {
      return product_type === "Stand Alone Product"
        ? _.get(data, "corporate_product_price", 0) || _.get(data, "single_product_price", 0)
        : _.get(data, "variants_price[0].corporate_product_price", "");
    } else if (user.role === "bni_user") {
      let Del_price = product_type === "Stand Alone Product"
        ? _.get(data, "Deler_product_price", 0)
        : _.get(data, "variants_price[0].Deler_product_price", "");
      let cus_price = product_type === "Stand Alone Product"
        ? _.get(data, "customer_product_price", 0)
        : _.get(data, "variants_price[0].customer_product_price", "");

      let bni_price = cus_price - Math.abs((cus_price - Del_price) / 2)
      return bni_price
    } else {
      return product_type === "Stand Alone Product"
        ? _.get(data, "customer_product_price", 0) || _.get(data, "single_product_price", 0)
        : _.get(data, "variants_price[0].customer_product_price", "");
    }
  };

  const basePrice = getRoleBasedPrice();
  const product_type = _.get(data, "type", "Stand Alone Product");
  const Gst = _.get(data, "GST", 0);
  const isSoldOut = _.get(data, "is_soldout", false);
  const CheckisQrProduct =()=>{ 
    let name=_.get(data, "name", false);
    if(name.includes('QR')){
      return true
    }else{
      return false
    }
    }
  const isQrProduct = CheckisQrProduct()
  console.log(data,"vbghvghvghvghccfhc");
  

  // State declarations
  const [quantity, setQuantity] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState({
    uuid: "",
    percentage: 0,
  });
  const [variant, setVariant] = useState([]);
  const [currentPriceSplitup, setCurrentPriceSplitup] = useState([]);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [maximum_quantity, setMaximumQuantity] = useState();
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [deliveryCharges, setDeliveryCharges] = useState(100);
  const [noDesignUpload, setNoDesignUpload] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  const [checkOutState, setCheckOutState] = useState({
    product_image: getFirstProductImage(data),
    product_design_file: "",
    product_name: _.get(data, "name", ""),
    category_name: _.get(data, "category_details.main_category_name", ""),
    subcategory_name: _.get(data, "sub_category_details.sub_category_name", ""),
    product_price: basePrice,
    product_variants: {},
    product_quantity: 0,
    product_seo_url: _.get(data, "seo_url", ""),
    product_id: _.get(data, "_id", ""),
    MRP_savings: 0,
    TotalSavings: 0,
    FreeDelivery: false,
    DeliveryCharges: 100,
  });

  // State for social media platforms - CORRECTED
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platformLinks, setPlatformLinks] = useState({});
  const [expandedPlatform, setExpandedPlatform] = useState(null);
  const [platformSelectionLocked, setPlatformSelectionLocked] = useState(false);

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
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [lazy, setLazy] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [showBulkOrderForm, setShowBulkOrderForm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Refs for platform items
  const platformRefs = useRef({});

  // Product configuration
  const { isGettingVariantPrice, product, productRateAndReview } = useSelector(
    (state) => state.publicSlice
  );
  const quantityDiscounts = _.get(data, "quantity_discount_splitup", []);
  const dropdownGap = _.get(data, "dropdown_gap", 100);
  const quantityType = _.get(data, "quantity_type", "dropdown");
  const maxQuantity = _.get(data, "max_quantity", 10000);
  const unit = _.get(data, "unit", "");
  const stockCount = _.get(data, "stock_count", "");
  const productionTime = _.get(data, "Production_time", "");
  const ArrangeTime = _.get(data, "Stock_Arrangement_time", "");
  const processing_item = stockCount === 0
    ? Number(productionTime) + Number(ArrangeTime)
    : Number(productionTime);

  // Generate quantity options based on user role
  const generateQuantityOptions = () => {
    const roleFields = getRoleFields(user.role);

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
  };

  const quantityOptions = generateQuantityOptions();

  // Initialize quantity and delivery charges
  useEffect(() => {
    if (quantityType !== "textbox" && quantityDiscounts.length > 0) {
      const roleFields = getRoleFields(user.role);
      const firstAvailableItem = quantityDiscounts.find(item => item[roleFields.quantity]);

      if (firstAvailableItem) {
        const initialQuantity = Number(firstAvailableItem[roleFields.quantity]);
        const initialDiscount = Number(firstAvailableItem[roleFields.discount] || 0);
        const initialFreeDelivery = firstAvailableItem[roleFields.freeDelivery] || false;
        const initialDeliveryCharges = initialFreeDelivery ? 0 : Number(firstAvailableItem[roleFields.deliveryCharges] || 100);

        setQuantity(initialQuantity);
        setDiscountPercentage({
          uuid: firstAvailableItem.uniqe_id,
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
      setMaximumQuantity(maxQuantity);
      setQuantity(null);
      setCheckOutState(prev => ({
        ...prev,
        product_quantity: 0,
        DeliveryCharges: 100,
        FreeDelivery: false,
      }));
    }
  }, [quantityDiscounts, quantityType, maxQuantity, user.role]);

  // FIXED: Handle platform selection - SIMPLIFIED VERSION
  const handlePlatformSelect = (platform, e) => {
    // Prevent event propagation
    if (e) {
      e.stopPropagation();
    }

    // For QR products: allow multiple selection
    if (isQrProduct) {
      if (selectedPlatforms.includes(platform)) {
        // Remove platform
        const newPlatforms = selectedPlatforms.filter(p => p !== platform);
        setSelectedPlatforms(newPlatforms);

        // Remove link for deselected platform
        const newLinks = { ...platformLinks };
        delete newLinks[platform];
        setPlatformLinks(newLinks);

        // Close expanded view if this platform was expanded
        if (expandedPlatform === platform) {
          setExpandedPlatform(null);
        }
      } else {
        // Add platform
        const newPlatforms = [...selectedPlatforms, platform];
        setSelectedPlatforms(newPlatforms);

        // Initialize empty link for new platform
        const newLinks = {
          ...platformLinks,
          [platform]: ""
        };
        setPlatformLinks(newLinks);

        // Expand this platform to show input
        setExpandedPlatform(platform);
      }
    } else {
      // For non-QR products: single selection only
      if (selectedPlatforms.includes(platform)) {
        // Deselect if already selected
        setSelectedPlatforms([]);
        setPlatformLinks({});
        setExpandedPlatform(null);
      } else {
        // Select new platform
        setSelectedPlatforms([platform]);
        setPlatformLinks({
          [platform]: ""
        });
        setExpandedPlatform(platform);
      }
    }
  };

  // FIXED: Handle platform link input
  const handlePlatformLinkChange = (platform, link) => {
    const newLinks = {
      ...platformLinks,
      [platform]: link
    };
    setPlatformLinks(newLinks);

    // Also update checkout state
    setCheckOutState(prev => ({
      ...prev,
      platform_links: newLinks
    }));
  };

  // Handle checkbox change separately
  const handlePlatformCheckboxChange = (platform, e) => {
    e.stopPropagation();
    handlePlatformSelect(platform, e);
  };

  // Handle click on platform container
  const handlePlatformContainerClick = (platform, e) => {
    // Only handle if click is not on checkbox or input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('.ant-checkbox') || e.target.closest('.ant-input')) {
      return;
    }
    handlePlatformSelect(platform, e);
  };

  // Platform options with proper icons and colors
  const platformOptions = [
    {
      value: "Google",
      label: "Google",
      icon: <FaGoogle />,
      color: "#4285F4",
      bgColor: "#4285F41A"
    },
    {
      value: "Instagram",
      label: "Instagram",
      icon: <FaInstagram />,
      color: "#E4405F",
      bgColor: "#E4405F1A"
    },
    {
      value: "Facebook",
      label: "Facebook",
      icon: <FaFacebook />,
      color: "#1877F2",
      bgColor: "#1877F21A"
    },
    {
      value: "YouTube",
      label: "YouTube",
      icon: <FaYoutube />,
      color: "#FF0000",
      bgColor: "#FF00001A"
    },
    {
      value: "WhatsApp",
      label: "WhatsApp",
      icon: <FaWhatsapp />,
      color: "#25D366",
      bgColor: "#25D3661A"
    },
    {
      value: "Website",
      label: "Website",
      icon: <FaGlobe />,
      color: "#4CAF50",
      bgColor: "#4CAF501A"
    },
    {
      value: "Other",
      label: "Other",
      icon: <FaPlus />,
      color: "#9C27B0",
      bgColor: "#9C27B01A"
    },
  ];

  // Rating calculations
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

  // Initialize product variants and stock
  useEffect(() => {
    if (product_type === "Stand Alone Product") {
      setCheckOutState((prevState) => ({
        ...prevState,
        product_price: basePrice,
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
  }, [product, product_type, basePrice, data]);

  // Handle variant selection
  const handleOnChangeSelectOption = async (selectedValue, index) => {
    try {
      const updatedVariant = [...variant];
      updatedVariant[index] = selectedValue;

      setVariant(updatedVariant);
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
      console.error("Error fetching variant price:", err);
    }
  };

  // Scroll to product details
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

  // Handle file upload
  const handleUploadImage = (fileString) => {
    setCheckOutState((prev) => ({ ...prev, product_design_file: fileString }));
  };

  const goToShoppingCart = () => {
    navigate("/shopping-cart");
  };

  // Handle quantity selection with delivery charges
  const handleQuantitySelect = (selectedQuantity) => {
    const roleFields = getRoleFields(user.role);

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
        setDeliveryCharges(selectedDiscount[roleFields.freeDelivery] ? 0 : Number(selectedDiscount[roleFields.deliveryCharges] || 100));

        setCheckOutState(prev => ({
          ...prev,
          DeliveryCharges: selectedDiscount[roleFields.freeDelivery] ? 0 : Number(selectedDiscount[roleFields.deliveryCharges] || 100),
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
  };

  // Price calculation functions
  const formatPrice = (price) => {
    return `₹${parseFloat(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculate unit prices
  const getUnitPrice = () => {
    const basePrice = Number(_.get(checkOutState, "product_price", 0));
    return Math.round(calculateUnitPrice(basePrice, discountPercentage.percentage, user.role, Gst));
  };
  const getUnitPricewithoutGst = () => {
    const basePrice = Number(_.get(checkOutState, "product_price", 0));
    return Math.round(calculateUnitPriceWithoutGst(basePrice, discountPercentage.percentage, user.role, Gst));
  };

  const getMRPUnitPrice = () => {
    const basePrice = Number(_.get(checkOutState, "product_price", 0));
    return calculateMRPUnitPrice(basePrice, user.role, Gst);
  };

  const getOriginalUnitPrice = () => {
    const basePrice = Number(_.get(checkOutState, "product_price", 0));
    if (user.role === "Corporate" || user.role === "Dealer") {
      return basePrice;
    } else {
      return basePrice * (1 + Gst / 100);
    }
  };

  // Calculate total prices
  const calculateTotalPrice = () => {
    if (!quantity) return 0;
    const unitPrice = getUnitPrice();
    return (unitPrice * quantity).toFixed(2);
  };

  const calculateTotalPricewithoutGst = () => {
    if (!quantity) return 0;
    const unitPrice = getUnitPricewithoutGst();
    return (unitPrice * quantity).toFixed(2);
  };

  const calculateGstPrice = () => {
    if (!quantity) return "0.00";

    const unitPrice = getUnitPrice();

    // Ensure unitPrice is a number before calling toFixed
    if (typeof unitPrice !== 'number' || isNaN(unitPrice)) {
      return Number(unitPrice);
    }

    return unitPrice.toFixed(2);
  };

  const calculateMRPTotalPrice = () => {
    if (!quantity) return 0;
    const mrpPrice = Number(_.get(data, "MRP_price", 0));
    return (mrpPrice * quantity).toFixed(2);
  };

  const calculateOriginalTotalPrice = () => {
    if (!quantity) return 0;
    const unitPrice = getOriginalUnitPrice();
    return (unitPrice * quantity).toFixed(2);
  };

  // Calculate savings
  const calculateMRPSavings = () => {
    if (!quantity) return 0;
    const mrpPrice = Number(_.get(data, "MRP_price", 0));
    const currentUnitPrice = getMRPUnitPrice();
    const savingsPerUnit = mrpPrice - currentUnitPrice;
    return (savingsPerUnit * quantity).toFixed(2);
  };

  const calculateDiscountSavings = () => {
    if (!quantity) return 0;
    const originalUnitPrice = getOriginalUnitPrice();
    const discountedUnitPrice = getUnitPrice();
    const savingsPerUnit = originalUnitPrice - discountedUnitPrice;
    return (savingsPerUnit * quantity).toFixed(2);
  };

  const calculateTotalSavings = () => {
    const mrpSavings = parseFloat(calculateMRPSavings());
    const discountSavings = parseFloat(calculateDiscountSavings());
    return (mrpSavings + discountSavings).toFixed(2);
  };

  // Calculate percentage discount for deal price - FIXED CALCULATION
  const calculateDealPercentageDiscount = () => {
    if (!quantity) return 0;

    const mrpTotal = parseFloat(calculateMRPTotalPrice());
    const dealTotal = parseFloat(calculateTotalPrice());

    if (mrpTotal === 0 || dealTotal >= mrpTotal) return 0;

    const percentage = ((mrpTotal - dealTotal) / mrpTotal) * 100;
    return Math.round(percentage);
  };

  // Calculate percentage savings - FIXED CALCULATION
  const calculateTotalSavingsPercentage = () => {
    const totalSavings = parseFloat(calculateTotalSavings());
    const mrpTotal = parseFloat(calculateMRPTotalPrice());

    if (mrpTotal === 0 || totalSavings <= 0) return 0;

    const percentage = (totalSavings / mrpTotal) * 100;
    return Math.min(100, Math.round(percentage)); // Cap at 100%
  };

  // FIXED: Handle add to cart with proper platform links
  const handlebuy = async () => {
    try {
      setLoading(true);

      if (!quantity) {
        toast.error("Please select quantity first");
        return;
      }

      // Validate platform links for QR products
      if (isQrProduct && selectedPlatforms.length > 0) {
        const missingLinks = selectedPlatforms.filter(platform =>
          !platformLinks[platform] || platformLinks[platform].trim() === ""
        );

        if (missingLinks.length > 0) {
          toast.error(`Please enter links for: ${missingLinks.join(", ")}`);
          return;
        }

        // Validate URL format for entered links
        for (const platform of selectedPlatforms) {
          const link = platformLinks[platform];
          if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
            toast.error(`Please enter a valid URL for ${platform} (include http:// or https://)`);
            return;
          }
        }
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
      let token = localStorage.getItem("userData") || "guest"

      const getGuestId = () => {
        let guestId = localStorage.getItem('guestId');

        if (!guestId) {
          guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('guestId', guestId);
        }

        return guestId;
      };

      // Create platform links object with only selected platforms
      const selectedPlatformLinks = {};
      selectedPlatforms.forEach(platform => {
        if (platformLinks[platform]) {
          selectedPlatformLinks[platform] = platformLinks[platform];
        }
      });

      // UPDATED: Include platform links in checkout state
      const finalCheckoutState = {
        ...checkOutState,
        selected_platforms: selectedPlatforms,
        platform_links: selectedPlatformLinks,
        is_qr_product: isQrProduct,
        guestId: getGuestId(),
        userRole: token,
        sgst: Number(Gst / 2),
        cgst: Number(Gst / 2),
        MRP_savings: calculateMRPSavings(),
        TotalSavings: calculateTotalSavings(),
        FreeDelivery: freeDelivery,
        DeliveryCharges: deliveryCharges,
        noCustomtation: noDesignUpload,
        final_total: Number(calculateTotalPrice()),
        final_total_withoutGst: Number(calculateTotalPricewithoutGst()),
      };

      const GuestCheckoutState = {
        ...checkOutState,
        selected_platforms: selectedPlatforms,
        platform_links: selectedPlatformLinks,
        is_qr_product: isQrProduct,
        GuestId: getGuestId(),
        userRole: token,
        sgst: Number(Gst / 2),
        cgst: Number(Gst / 2),
        MRP_savings: calculateMRPSavings(),
        TotalSavings: calculateTotalSavings(),
        FreeDelivery: freeDelivery,
        DeliveryCharges: deliveryCharges,
        noCustomtation: noDesignUpload,
        final_total: Number(calculateTotalPrice()),
        final_total_withoutGst: Number(calculateTotalPricewithoutGst()),
      };

      console.log("Sending to cart:", token == "user" ? finalCheckoutState : GuestCheckoutState);

      const result = await addToShoppingCart(token == "user" ? finalCheckoutState : GuestCheckoutState);

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

    // User is not logged in, show popup
    setShowNotifyModal(true);
    notifyForm.resetFields();
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
    console.log(values);

    await sendNotification(values);
    setShowNotifyModal(false)
    form.resetFields()
  };

  // Quantity dropdown renderer
  const quantityDropdownRender = (menu) => {
    const roleFields = getRoleFields(user.role);
    const quantityOptions = generateQuantityOptions();

    return (
      <div
        className="p-2 rounded-lg shadow-xl bg-white"
        onMouseLeave={() => setQuantityDropdownVisible(false)}
      >
        <div className="overflow-y-auto max-h-80 space-y-3">
          {quantityOptions.map((item) => {
            const unitPrice = calculateUnitPrice(
              Number(_.get(checkOutState, "product_price", 0)),
              item.discount,
              user.role,
              Gst
            );
            const totalPrice = unitPrice * item.value;
            const isSelected = quantity === item.value;

            return (
              <div
                key={item.value}
                className={`flex justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${isSelected
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-100 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                onClick={() => handleQuantitySelect(item.value)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-base font-medium ${isSelected ? "text-blue-700" : "text-gray-800"
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
                        <FaTruckFast className="mr-1" />
                        Free Delivery
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-semibold ${isSelected ? "text-yellow-700" : "text-gray-900"
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
    );
  };

  // Share functionality
  const shareProduct = async (platform) => {
    const productUrl = encodeURIComponent(window.location.href);
    const productName = encodeURIComponent(data.name);
    const productTitle = encodeURIComponent(_.get(data, "product_description_tittle", ""));
    const productImage = getFirstProductImage(data);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${productUrl}&quote=${productTitle}`,
      twitter: `https://twitter.com/intent/tweet?text=${productTitle}&url=${productUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${productTitle} - ${productUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${productUrl}&title=${productTitle}`,
      email: `mailto:?subject=${productTitle}&body=Check out this product: ${productTitle} - ${productUrl}`,
    };

    if (platform === 'whatsapp' && productImage) {
      const message = `${productTitle} - ${window.location.href}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    }
    else if (platform === 'email') {
      window.location.href = shareUrls[platform];
    }
    else if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank");
    }

    setShowShareMenu(false);
  };

  // Enhanced Native Share Function with Image
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const shareData = {
          title: data.name,
          text: _.get(data, "product_description_tittle", ""),
          url: window.location.href,
        };

        const productImage = getFirstProductImage(data);
        if (productImage) {
          try {
            const response = await fetch(productImage);
            const blob = await response.blob();
            const file = new File([blob], 'product-image.jpg', { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (error) {
            console.error("Error sharing image:", error);
          }
        }

        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
        setShowShareMenu(!showShareMenu);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  // Bulk order functions
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

  const handleNoCustomization = (e) => {
    setNoDesignUpload(e.target.checked);
    if (e.target.checked) {
      setNeedDesignUpload(false);
    } else {
      setNeedDesignUpload(true);
    }
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

  const handleDesignRemove = () => {
    setCheckOutState(prev => ({ ...prev, product_design_file: "" }));
  };

  return (
    <Spin
      spinning={loading}
      indicator={
        <IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />
      }
    >
      <div className="font-primary w-full space-y-2 relative">
        {/* Sold Out Overlay */}
        {/* {isSoldOut && <SoldOutOverlay />} */}

        {/* Product Header with Animated Wax Seal */}
        <div className="space-y-1 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1 w-full md:w-auto">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-gray-900 font-bold text-xl md:text-2xl lg:text-2xl leading-tight w-full md:w-[80%]">
                {data.name}
              </h1>

            </div>
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
                    {formatPrice(Number(_.get(data, "MRP_price", 0)))}
                  </span>
                  <h3 className="text-white text-base font-semibold">
                    {quantity
                      ? formatPrice(getUnitPrice())
                      : "Select Qty"}
                  </h3>
                </div>
              </motion.div>
            </div>

            <div className="hidden md:flex items-center gap-3 flex-col-reverse">
              <button
                onClick={handleNativeShare}
                className="bg-[#f2c41a] hover:bg-[#f2c41a] text-black p-3 rounded-full shadow-md transition-all duration-300 hidden"
              >
                <IoShareSocial />
              </button>
              {isSoldOut && (
                <div className="relative top-0">
                  <AnimatedWaxSealBadge />
                </div>
              )}

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
                    {formatPrice(Number(_.get(data, "MRP_price", 0)))}
                  </span>
                  <h3 className="text-white text-base font-semibold">
                    {formatPrice(getUnitPrice())}
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
            // disabled={isSoldOut}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product_type !== "Stand Alone Product" &&
              !_.isEmpty(currentPriceSplitup) && (
                <>
                  {_.get(data, "variants", []).map((variant, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
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
                        // disabled={isSoldOut}
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
                                className={`cursor-pointer border-2 p-1 rounded transition duration-200 ${_.get(
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
                  disabled={isSoldOut}
                >
                  Individual Box for 100 Cards
                </Checkbox>
              </div>
            )}
          </div>
        </div>

        {/* Total Price Section */}
        <Card className={`rounded-lg border-0 bg-blue-50`}>
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
                  {formatPrice(calculateMRPTotalPrice())}
                </Text>
                <Title level={4} className={`!m-0 !text-green-600`}>
                  {quantity
                    ? formatPrice(calculateTotalPrice())
                    : formatPrice(0)}
                </Title>
              </div>
            </div>

            {/* Savings Alerts - FIXED PERCENTAGE CALCULATION */}
            {calculateTotalSavings() > 0 && (
              <div className="space-y-2">
                <Alert
                  message={
                    <div>
                      {calculateMRPSavings() > 0 && (
                        <div className="mt-1 text-sm">
                          You Saved: {formatPrice(calculateMRPSavings())} &nbsp;(
                          {calculateDealPercentageDiscount()}% OFF MRP)
                        </div>
                      )}

                      {discountPercentage.percentage == 0 ? "" : (
                        <div className="text-sm mt-2">
                          Additional Savings: {formatPrice(calculateDiscountSavings())} ({discountPercentage.percentage}% Quantity Discount)
                        </div>
                      )}

                      {discountPercentage.percentage === 0 && quantity && (
                        <div className="mt-2 text-base text-amber-600">
                          💡 Select higher quantity to get extra discounts
                        </div>
                      )}

                      <div className="font-semibold text-green-700 text-lg mt-1">
                        🎉 Total Savings: {formatPrice(calculateTotalSavings())} ({calculateTotalSavingsPercentage()}% OFF)
                      </div>
                    </div>
                  }
                  type="success"
                  showIcon
                  className="!py-3"
                />
              </div>
            )}


            {(user.role == "Corporate" || user.role == "Dealer" || user.role === "bni_user") ? (
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
                    &nbsp;({(user.role === "Dealer" || user.role === "Corporate" || user.role === "bni_user")
                      ? <>{formatPrice(Gst_HELPER(Gst, getUnitPrice()))}</>
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
            {/* PincodeDeliveryCalculator component would go here */}
            <div className="rounded-lg">
              <PincodeDeliveryCalculator
                Production={processing_item}
                freeDelivery={freeDelivery}
                deliveryCharges={deliveryCharges}
              />
            </div>
          </motion.div>
        </Card>

        {/* FIXED: SOCIAL MEDIA PLATFORMS SECTION - SIMPLIFIED AND CORRECTED */}
        {isQrProduct && (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Text strong className="text-lg">
                  Select Platforms <span className="text-red-500">*</span>
                </Text>
                <Tag color="blue" className="text-xs">
                  {isQrProduct ? "Multiple Selection" : "Single Selection"}
                </Tag>
              </div>
              <Text className="block mb-3 text-gray-600 text-sm">
                {isQrProduct
                  ? "Select platforms and enter the corresponding links (You can select multiple platforms)"
                  : "Select a platform and enter the corresponding link (You can select up to 1 platform)"}
              </Text>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {platformOptions.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.value);
                  const isExpanded = expandedPlatform === platform.value;

                  return (
                    <div
                      key={platform.value}
                      className={`flex flex-col p-3 border rounded-lg transition-all cursor-pointer ${isSelected
                          ? `border-[${platform.color}] bg-[${platform.bgColor}]`
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                      onClick={(e) => handlePlatformContainerClick(platform.value, e)}
                      style={isSelected ? {
                        borderColor: platform.color,
                        backgroundColor: platform.bgColor
                      } : {}}
                    >
                      <div className="flex items-center">
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-full mr-3"
                          style={{
                            backgroundColor: isSelected ? platform.color : '#f3f4f6',
                            color: isSelected ? 'white' : platform.color
                          }}
                        >
                          {platform.icon}
                        </div>
                        <span className="font-medium">{platform.label}</span>

                        <div className="ml-auto">
                          {isSelected ? (
                            <CheckCircleOutlined
                              style={{ color: platform.color, fontSize: '16px' }}
                            />
                          ) : (
                            <div className="w-4 h-4 border border-gray-300 rounded"></div>
                          )}
                        </div>
                      </div>

                      {/* Link input box for selected platforms */}
                      {isSelected && isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 overflow-hidden"
                        >
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder={`Enter ${platform.label} link`}
                              value={platformLinks[platform.value] || ""}
                              onChange={(e) => handlePlatformLinkChange(platform.value, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                              className="flex-1"
                              size="small"
                              prefix={<span className="text-gray-400">🔗</span>}
                              autoFocus={isExpanded}
                              style={{ borderColor: platform.color }}
                            />
                            <Button
                              type="text"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedPlatform(null);
                              }}
                              style={{ color: platform.color }}
                            >
                              Done
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Enter full URL (e.g., https://example.com)
                          </div>
                        </motion.div>
                      )}

                      {/* Show edit button for selected but not expanded */}
                      {isSelected && !isExpanded && (
                        <div className="mt-2">
                          <Button
                            type="link"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedPlatform(platform.value);
                            }}
                            style={{ color: platform.color }}
                            className="p-0"
                          >
                            {platformLinks[platform.value] ? "Edit link" : "Add link"}
                          </Button>
                          {platformLinks[platform.value] && (
                            <div className="text-xs text-gray-600 truncate mt-1">
                              {platformLinks[platform.value].length > 30
                                ? `${platformLinks[platform.value].substring(0, 30)}...`
                                : platformLinks[platform.value]
                              }
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selected platforms summary */}
              {selectedPlatforms.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <Text strong>
                    Selected Platforms ({selectedPlatforms.length})
                  </Text>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPlatforms.map(platform => {
                      const platformInfo = platformOptions.find(p => p.value === platform);
                      return (
                        <Tag
                          key={platform}
                          style={{
                            backgroundColor: platformInfo?.bgColor,
                            borderColor: platformInfo?.color,
                            color: platformInfo?.color
                          }}
                          className="py-1 px-2 flex items-center gap-1"
                        >
                          <span style={{ color: platformInfo?.color }}>
                            {platformInfo?.icon}
                          </span>
                          <span className="font-medium">{platform}: </span>
                          {platformLinks[platform] ? (
                            <span className="text-xs truncate max-w-[150px] inline-block">
                              {platformLinks[platform]}
                            </span>
                          ) : (
                            <span className="text-red-500 text-xs">No link</span>
                          )}
                          <CloseOutlined
                            className="ml-1 cursor-pointer hover:opacity-70"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handlePlatformSelect(platform);
                            }}
                          />
                        </Tag>
                      );
                    })}
                  </div>
                  {selectedPlatforms.some(p => !platformLinks[p] || platformLinks[p].trim() === "") && (
                    <Alert
                      message="Some platforms are missing links. Please enter links for all selected platforms."
                      type="warning"
                      showIcon
                      className="mt-2 !py-2"
                    />
                  )}

                </div>
              )}

              {/* Instructions */}

            </div>
          </div>
        )}

        {/* ORIGINAL FILE UPLOAD SECTION */}
        {isSoldOut ? <></> : <>
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <Checkbox
                checked={noDesignUpload}
                onChange={handleNoCustomization}
                disabled={isSoldOut}
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
                    disabled={isSoldOut}
                  />
                </div>
              )}
            </div>

            {!noDesignUpload && (
              <div className="">
                {needDesignUpload ? (
                  <>
                      <Alert
                        message="If you already have a design, we will review it prior to starting production."
                        type="warning"
                        showIcon
                        className="my-2 !py-2 "
                      />
                    <UploadFileButton
                      handleUploadImage={handleUploadImage}
                      buttonText="Drag & Drop Files Here or Browse Files"
                      className="w-full border-dotted rounded-lg flex flex-col items-center justify-center transition-colors"
                      disabled={isSoldOut}
                    />

                    {checkOutState.product_design_file && (
                      <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="md:order-1">
                          <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => setDesignPreviewVisible(true)}
                            className="md:order-1"
                            disabled={isSoldOut}
                          >
                            View Design
                          </Button>
                          <Button
                            type="link"
                            onClick={handleDesignRemove}
                            className="md:order-1"
                            disabled={isSoldOut}
                          >
                            Remove
                          </Button>
                        </div>

                        <Checkbox
                          checked={checked}
                          onChange={(e) => setChecked(e.target.checked)}
                          className="md:order-2"
                          disabled={isSoldOut}
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
                  disabled={isSoldOut}
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
                  disabled={isSoldOut}
                />
              )}
            </div>

          </div>
        </>}

        <div className="">

          {/* Add to Cart / Notify Button */}
          <div className="w-full">
            {isGettingVariantPrice ? (
              <div className="center_div py-6">
                <Spin size="large" />
              </div>
            ) : (
              <>
                {isSoldOut ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className=""
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mb-4"
                    >
                      <Button
                        type="default"
                        size="large"
                        className="!h-12 !border-gray-300 !text-gray-700 hover:!border-gray-400 hover:!text-gray-800 font-medium w-full"
                        onClick={handleNotify}
                        loading={sendingNotification}
                        icon={<MailOutlined />}
                      >
                        Notify Me
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    className="!h-12 !bg-yellow-400 text-black hover:!bg-yellow-500 hover:!text-black font-semibold w-full"
                    onClick={handlebuy}
                    loading={loading}
                  >
                    Add To Cart
                  </Button>
                )}
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
          <Form form={form} layout="vertical" onFinish={handleNotifySubmit}>
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
                <TextArea
                  rows={3}
                  placeholder="Any special requirements or notes..."
                />
              </Form.Item>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowNotifyModal(false)}
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

// PincodeDeliveryCalculator Component
import { FaTruck, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

export const PincodeDeliveryCalculator = ({ Production, freeDelivery, deliveryCharges }) => {
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

  const calculateProductionDate = () => {
    const today = new Date();
    const productionTime = Production || 0;
    let productionDate = new Date(today);
    productionDate.setDate(productionDate.getDate() + Number(productionTime));
    return productionDate.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDeliveryDate = (state = "tamil nadu") => {
    const { days: deliveryDays } =
      stateDeliveryDays[state] || stateDeliveryDays.default;
    const today = new Date();
    const productionTime = Production || 0;
    let deliveryDate = new Date(today);
    deliveryDate.setDate(deliveryDate.getDate() + Number(productionTime) + Number(deliveryDays) + 2);
    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const validatePincode = async (pincode) => {
    setIsValidatingPincode(true);
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
        toast.error("Location access denied. Please enable location permissions.");
        break;
      case error.POSITION_UNAVAILABLE:
        toast.error("Location information unavailable. Please check your GPS settings.");
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

        {pincode && deliveryDate ? (
          <motion.div className="delivery-info" whileHover={{ x: 5 }}>
            <span className="delivery-text">
              Expected Delivery by <Text strong>{deliveryDate}</Text>
            </span>
            <Divider type="vertical" />
            {freeDelivery ? (
              <div className="flex items-center gap-2">
                <Text delete type="secondary">
                  ₹ {deliveryCharges}
                </Text>
                <Text type="success" strong>
                  Cheers – Zero Delivery Charges, 100% Happiness!
                </Text>
              </div>
            ) : (
              <Text type="success" strong>
                ₹ {deliveryCharges} Delivery Charges Applicable
              </Text>
            )}
          </motion.div>
        ) : (
          <motion.div className="production-info" whileHover={{ x: 5 }}>
            <span className="production-text">
              Expected Dispatch by <Text strong>{productionDate}</Text>
            </span>
            <Divider type="vertical" />
            <Text type="secondary">
              Enter pincode for delivery date & charges
            </Text>
            {freeDelivery && (
              <div className="flex items-center gap-2">
                <Text type="success" strong>
                  Cheers – Zero Delivery Charges, 100% Happiness!
                </Text>
              </div>
            )}
          </motion.div>
        )}

        <CustomModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Delivery Information"
          width={700}
        >
          {/* Delivery info content can be added here */}
        </CustomModal>
      </div>
    </div>
  );
};


export const SimpleHangingSoldBoard = () => {
  const swingAnimation = {
    animate: {
      rotate: [0, 8, -8, 6, -6, 3, -3, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className=" z-50 pointer-events-none flex justify-center">
      {/* Top hook */}
      <div className="relative">
        {/* Board */}
        <motion.div
          className="relative mt-20 w-40 h-14 bg-red-600 rounded-md border-3 shadow-xl"
          variants={swingAnimation}
          animate="animate"
          style={{ originY: 0 }}
        >
          {/* SOLD text */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="text-xl font-black tracking-wider">
              <span className="bg-gradient-to-b from-white to-white bg-clip-text text-transparent">
                SOLD OUT
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};