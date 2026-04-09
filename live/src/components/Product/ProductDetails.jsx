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
  notifyWhenAvailable,
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
  Gst_HELPER,
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

import { FaGoogle, FaInstagram, FaFacebook, FaYoutube, FaWhatsapp, FaGlobe, FaPlus } from "react-icons/fa";

// ─────────────────────────────────────────────────────────────────────────────
// CustomModal
// ─────────────────────────────────────────────────────────────────────────────
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: isMobile ? 100 : 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: isMobile ? 100 : 20 }}
        className={`relative bg-white rounded-lg shadow-xl ${
          isMobile ? "w-full h-full rounded-b-none" : "max-h-[90vh]"
        } overflow-hidden flex flex-col ${className}`}
        style={isMobile ? {} : { width }}
      >
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
        <div className={`flex-1 overflow-auto ${isMobile ? "p-4" : "p-6"}`}>
          {children}
        </div>
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

// ─────────────────────────────────────────────────────────────────────────────
// CustomPopover
// ─────────────────────────────────────────────────────────────────────────────
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
    "bottom-left":  "top-full left-0 mt-2",
    "top-right":    "bottom-full right-0 mb-2",
    "top-left":     "bottom-full left-0 mb-2",
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

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedWaxSealBadge
// ─────────────────────────────────────────────────────────────────────────────
const AnimatedWaxSealBadge = () => (
  <motion.div whileHover={{ scale: 1.05 }} className="relative -top-20 h-0 overflow-visible">
    <SimpleHangingSoldBoard />
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const getProductImages = (data) => {
  const images = _.get(data, "images", []);
  if (!images || images.length === 0) return [];
  return images
    .map((image) => (typeof image === "string" ? image : image?.path || ""))
    .filter(Boolean);
};

const getFirstProductImage = (data) => {
  const images = getProductImages(data);
  return images.length > 0 ? images[0] : "";
};

const getRoleFields = (role) => {
  switch (role) {
    case "Dealer":
      return {
        quantity:         "Dealer_quantity",
        discount:         "Dealer_discount",
        freeDelivery:     "free_delivery_dealer",
        recommended:      "recommended_stats_dealer",
        deliveryCharges:  "delivery_charges_dealer",
      };
    case "Corporate":
      return {
        quantity:         "Corporate_quantity",
        discount:         "Corporate_discount",
        freeDelivery:     "free_delivery_corporate",
        recommended:      "recommended_stats_corporate",
        deliveryCharges:  "delivery_charges_corporate",
      };
    default:
      return {
        quantity:         "Customer_quantity",
        discount:         "Customer_discount",
        freeDelivery:     "free_delivery_customer",
        recommended:      "recommended_stats_customer",
        deliveryCharges:  "delivery_charges_customer",
      };
  }
};

const calculateUnitPrice = (basePrice, discountPercentage, userRole, gst = 18) => {
  if (userRole === "Corporate" || userRole === "Dealer" || userRole === "bni_user") {
    return DISCOUNT_HELPER(discountPercentage, basePrice);
  }
  return GST_DISCOUNT_HELPER(discountPercentage, basePrice, gst);
};

const calculateUnitPriceWithoutGst = (basePrice, discountPercentage) =>
  DISCOUNT_HELPER(discountPercentage, basePrice);

const calculateMRPUnitPrice = (basePrice, userRole, gst = 0) => {
  if (userRole === "Corporate" || userRole === "Dealer" || userRole === "bni_user") {
    return basePrice;
  }
  return basePrice * (1 + gst / 100);
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ Guest ID helper — stable across the session
// ─────────────────────────────────────────────────────────────────────────────
const getGuestId = () => {
  let guestId = localStorage.getItem("guestId");
  if (!guestId) {
    guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("guestId", guestId);
  }
  return guestId;
};

// ─────────────────────────────────────────────────────────────────────────────
// ProductDetails
// ─────────────────────────────────────────────────────────────────────────────
const ProductDetails = ({
  data = {
    _id:      "",
    name:     "",
    desc:     "",
    images:   [{ key: 1, path: "" }],
    variants: [{ name: "", options: [{ value: "", price: 0 }] }],
    label:    [],
  },
}) => {
  const { user } = useSelector((state) => state.authSlice);
  const [form]       = Form.useForm();
  const [notifyForm] = Form.useForm();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  // ── Role-based base price ──────────────────────────────────────────────────
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
      const del_price =
        product_type === "Stand Alone Product"
          ? _.get(data, "Deler_product_price", 0)
          : _.get(data, "variants_price[0].Deler_product_price", 0);
      const cus_price =
        product_type === "Stand Alone Product"
          ? _.get(data, "customer_product_price", 0)
          : _.get(data, "variants_price[0].customer_product_price", 0);
      return cus_price - Math.abs((cus_price - del_price) / 2);
    } else {
      return product_type === "Stand Alone Product"
        ? _.get(data, "customer_product_price", 0) || _.get(data, "single_product_price", 0)
        : _.get(data, "variants_price[0].customer_product_price", "");
    }
  };

  const basePrice    = getRoleBasedPrice();
  const product_type = _.get(data, "type", "Stand Alone Product");
  const Gst          = _.get(data, "GST", 0);
  const isSoldOut    = _.get(data, "is_soldout", false);

  const isQrProduct = (() => {
    const name = _.get(data, "name", "");
    return name.includes("QR");
  })();

  // ── State ──────────────────────────────────────────────────────────────────
  const [quantity, setQuantity]               = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState({ uuid: "", percentage: 0 });
  const [variant, setVariant]                 = useState([]);
  const [currentPriceSplitup, setCurrentPriceSplitup] = useState([]);
  const [checked, setChecked]                 = useState(false);
  const [error, setError]                     = useState("");
  const [maximum_quantity, setMaximumQuantity] = useState();
  const [freeDelivery, setFreeDelivery]       = useState(false);
  const [deliveryCharges, setDeliveryCharges] = useState(100);
  const [noDesignUpload, setNoDesignUpload]   = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  const [checkOutState, setCheckOutState] = useState({
    product_image:       getFirstProductImage(data),
    product_design_file: "",
    product_name:        _.get(data, "name", ""),
    category_name:       _.get(data, "category_details.main_category_name", ""),
    subcategory_name:    _.get(data, "sub_category_details.sub_category_name", ""),
    product_price:       basePrice,
    product_variants:    {},
    product_quantity:    0,
    product_seo_url:     _.get(data, "seo_url", ""),
    product_id:          _.get(data, "_id", ""),
    MRP_savings:         0,
    TotalSavings:        0,
    FreeDelivery:        false,
    DeliveryCharges:     100,
  });

  // ── Platform state ────────────────────────────────────────────────────────
  const [selectedPlatforms, setSelectedPlatforms]       = useState([]);
  const [platformLinks, setPlatformLinks]               = useState({});
  const [expandedPlatform, setExpandedPlatform]         = useState(null);

  const [needDesignUpload, setNeedDesignUpload]   = useState(true);
  const [reviewData, setReviewData]               = useState([]);
  const [review, setReview]                       = useState([]);
  const [rate, setRate]                           = useState([]);
  const [loading, setLoading]                     = useState(false);
  const [averageRatingCount, setAverageRatingCount] = useState(0);
  const [stock, setStockCount]                    = useState(0);
  const [isModalOpen, setIsModalOpen]             = useState(false);
  const [designPreviewVisible, setDesignPreviewVisible] = useState(false);
  const [individualBox, setIndividualBox]         = useState(false);
  const [quantityDropdownVisible, setQuantityDropdownVisible] = useState(false);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [lazy, setLazy]                           = useState(false);
  const [showBulkOrderForm, setShowBulkOrderForm] = useState(false);
  const [showShareMenu, setShowShareMenu]         = useState(false);
  const [otpSent, setOtpSent]                     = useState(false);
  const [emailVerified, setEmailVerified]         = useState(false);
  const [sendingOtp, setSendingOtp]               = useState(false);

  // ── Redux ─────────────────────────────────────────────────────────────────
  const { isGettingVariantPrice, product, productRateAndReview } = useSelector(
    (state) => state.publicSlice
  );

  const quantityDiscounts = _.get(data, "quantity_discount_splitup", []);
  const dropdownGap       = _.get(data, "dropdown_gap", 100);
  const quantityType      = _.get(data, "quantity_type", "dropdown");
  const maxQuantity       = _.get(data, "max_quantity", 10000);
  const unit              = _.get(data, "unit", "");
  const stockCount        = _.get(data, "stock_count", "");
  const productionTime    = _.get(data, "Production_time", "");
  const ArrangeTime       = _.get(data, "Stock_Arrangement_time", "");
  const processing_item   =
    stockCount === 0
      ? Number(productionTime) + Number(ArrangeTime)
      : Number(productionTime);

  // ── Platform options ──────────────────────────────────────────────────────
  const platformOptions = [
    { value: "Google",    label: "Google",    icon: <FaGoogle />,    color: "#4285F4", bgColor: "#4285F41A" },
    { value: "Instagram", label: "Instagram", icon: <FaInstagram />, color: "#E4405F", bgColor: "#E4405F1A" },
    { value: "Facebook",  label: "Facebook",  icon: <FaFacebook />,  color: "#1877F2", bgColor: "#1877F21A" },
    { value: "YouTube",   label: "YouTube",   icon: <FaYoutube />,   color: "#FF0000", bgColor: "#FF00001A" },
    { value: "WhatsApp",  label: "WhatsApp",  icon: <FaWhatsapp />,  color: "#25D366", bgColor: "#25D3661A" },
    { value: "Website",   label: "Website",   icon: <FaGlobe />,     color: "#4CAF50", bgColor: "#4CAF501A" },
    { value: "Other",     label: "Other",     icon: <FaPlus />,      color: "#9C27B0", bgColor: "#9C27B01A" },
  ];

  // ── Quantity options ──────────────────────────────────────────────────────
  const generateQuantityOptions = () => {
    const roleFields = getRoleFields(user.role);
    if (quantityType === "textbox") {
      const options = [];
      for (let i = dropdownGap; i <= maxQuantity; i += dropdownGap) {
        options.push({ value: i, label: i.toString() });
      }
      return options;
    }
    return quantityDiscounts
      .filter((item) => item[roleFields.quantity])
      .map((item) => ({
        value:           Number(item[roleFields.quantity]),
        label:           `${item[roleFields.quantity]}`,
        Free_Delivery:   item[roleFields.freeDelivery] || false,
        discount:        Number(item[roleFields.discount] || 0),
        uuid:            item.uniqe_id,
        stats:           item[roleFields.recommended] || "No comments",
        deliveryCharges: Number(item[roleFields.deliveryCharges] || 100),
      }))
      .sort((a, b) => a.value - b.value);
  };

  const quantityOptions = generateQuantityOptions();

  // ── Init quantity ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (quantityType !== "textbox" && quantityDiscounts.length > 0) {
      const roleFields          = getRoleFields(user.role);
      const firstAvailableItem  = quantityDiscounts.find((item) => item[roleFields.quantity]);
      if (firstAvailableItem) {
        const initialQuantity       = Number(firstAvailableItem[roleFields.quantity]);
        const initialDiscount       = Number(firstAvailableItem[roleFields.discount] || 0);
        const initialFreeDelivery   = firstAvailableItem[roleFields.freeDelivery] || false;
        const initialDeliveryCharges = initialFreeDelivery ? 0 : Number(firstAvailableItem[roleFields.deliveryCharges] || 100);

        setQuantity(initialQuantity);
        setDiscountPercentage({ uuid: firstAvailableItem.uniqe_id, percentage: initialDiscount });
        setFreeDelivery(initialFreeDelivery);
        setDeliveryCharges(initialDeliveryCharges);
        setCheckOutState((prev) => ({
          ...prev,
          product_quantity: initialQuantity,
          DeliveryCharges:  initialDeliveryCharges,
          FreeDelivery:     initialFreeDelivery,
        }));
      }
    } else {
      setDiscountPercentage({ uuid: "", percentage: 0 });
      setFreeDelivery(false);
      setDeliveryCharges(100);
      setMaximumQuantity(maxQuantity);
      setQuantity(null);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: 0,
        DeliveryCharges:  100,
        FreeDelivery:     false,
      }));
    }
  }, [quantityDiscounts, quantityType, maxQuantity, user.role]);

  // ── Platform handlers ─────────────────────────────────────────────────────
  const handlePlatformSelect = (platform, e) => {
    if (e) e.stopPropagation();

    if (isQrProduct) {
      if (selectedPlatforms.includes(platform)) {
        const newPlatforms = selectedPlatforms.filter((p) => p !== platform);
        setSelectedPlatforms(newPlatforms);
        const newLinks = { ...platformLinks };
        delete newLinks[platform];
        setPlatformLinks(newLinks);
        if (expandedPlatform === platform) setExpandedPlatform(null);
      } else {
        setSelectedPlatforms([...selectedPlatforms, platform]);
        setPlatformLinks({ ...platformLinks, [platform]: "" });
        setExpandedPlatform(platform);
      }
    } else {
      if (selectedPlatforms.includes(platform)) {
        setSelectedPlatforms([]);
        setPlatformLinks({});
        setExpandedPlatform(null);
      } else {
        setSelectedPlatforms([platform]);
        setPlatformLinks({ [platform]: "" });
        setExpandedPlatform(platform);
      }
    }
  };

  const handlePlatformLinkChange = (platform, link) => {
    const newLinks = { ...platformLinks, [platform]: link };
    setPlatformLinks(newLinks);
    setCheckOutState((prev) => ({ ...prev, platform_links: newLinks }));
  };

  const handlePlatformContainerClick = (platform, e) => {
    if (
      e.target.tagName === "INPUT"    ||
      e.target.tagName === "TEXTAREA" ||
      e.target.closest(".ant-checkbox") ||
      e.target.closest(".ant-input")
    ) return;
    handlePlatformSelect(platform, e);
  };

  // ── Rating calculations ───────────────────────────────────────────────────
  useEffect(() => {
    const ratingSum    = rate.reduce((sum, r) => sum + Math.round(r.rating), 0);
    const averageRating = ratingSum === 0 ? 0 : ratingSum / rate.length;
    setAverageRatingCount(parseFloat(averageRating.toFixed(1)));
  }, [rate]);

  useEffect(() => {
    if (productRateAndReview.data.length > 0)
      setReviewData(productRateAndReview?.data || []);
  }, [productRateAndReview]);

  useEffect(() => {
    if (reviewData.length > 0) {
      setReview(reviewData.filter((d) => d.review.length > 0) || []);
      setRate(reviewData.filter((d) => d.rating > 0) || []);
    }
  }, [reviewData]);

  // ── Init product variants / stock ─────────────────────────────────────────
  useEffect(() => {
    if (product_type === "Stand Alone Product") {
      setCheckOutState((prev) => ({ ...prev, product_price: basePrice }));
      setStockCount(_.get(data, "stock_count", 0));
    } else if (_.isEmpty(currentPriceSplitup)) {
      const items    = _.get(product, "variants_price", []).map((r) => Number(r.price));
      const itemKeys = _.get(product, "variants_price", []).map((r) => r.key);
      const lowestIdx = items.indexOf(Math.min(...items));
      setVariant(String(itemKeys[lowestIdx]).split("-"));
      setCurrentPriceSplitup(_.get(product, `variants_price[${lowestIdx}]`, {}));
      setCheckOutState((prev) => ({
        ...prev,
        product_price:    _.get(product, `variants_price[${lowestIdx}].price`, {}),
        product_variants: _.get(product, `variants_price[${lowestIdx}]`, {}),
      }));
      setStockCount(_.get(product, `variants_price[${lowestIdx}].stock`, {}));
    }
  }, [product, product_type, basePrice, data]);

  // ── Variant selection ─────────────────────────────────────────────────────
  const handleOnChangeSelectOption = async (selectedValue, index) => {
    try {
      const updatedVariant     = [...variant];
      updatedVariant[index]    = selectedValue;
      setVariant(updatedVariant);
      const key    = updatedVariant.join("-");
      const result = await getVariantPrice(data._id, { key });
      setCurrentPriceSplitup(_.get(result, "data.data", {}));
      setCheckOutState((prev) => ({
        ...prev,
        product_price:    _.get(result, "data.data.price", {}),
        product_variants: _.get(result, "data.data", {}),
      }));
      setStockCount(_.get(result, "data.data.stock", {}));
    } catch (err) {
      console.error("Error fetching variant price:", err);
    }
  };

  const scrollToproductDetails = useCallback(() => {
    const el = document.getElementById("overview");
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - 180,
        behavior: "smooth",
      });
    }
  }, []);

  const handleUploadImage  = (fileString) =>
    setCheckOutState((prev) => ({ ...prev, product_design_file: fileString }));

  const goToShoppingCart   = () => navigate("/shopping-cart");

  // ── Quantity selection ────────────────────────────────────────────────────
  const handleQuantitySelect = (selectedQuantity) => {
    const roleFields = getRoleFields(user.role);

    const applyDiscount = (selectedDiscount) => {
      if (selectedDiscount) {
        const isFree   = selectedDiscount[roleFields.freeDelivery] || false;
        const charges  = isFree ? 0 : Number(selectedDiscount[roleFields.deliveryCharges] || 100);
        setDiscountPercentage({ uuid: selectedDiscount.uniqe_id, percentage: Number(selectedDiscount[roleFields.discount] || 0) });
        setFreeDelivery(isFree);
        setDeliveryCharges(charges);
        setCheckOutState((prev) => ({ ...prev, DeliveryCharges: charges, FreeDelivery: isFree }));
      } else {
        setDiscountPercentage({ uuid: "", percentage: 0 });
        setFreeDelivery(false);
        setDeliveryCharges(100);
        setCheckOutState((prev) => ({ ...prev, DeliveryCharges: 100, FreeDelivery: false }));
      }
    };

    setQuantity(selectedQuantity);
    setCheckOutState((prev) => ({ ...prev, product_quantity: selectedQuantity }));

    if (quantityType === "textbox") {
      const best = quantityDiscounts
        .filter((item) => item[roleFields.quantity] && Number(item[roleFields.quantity]) <= selectedQuantity)
        .sort((a, b) => Number(b[roleFields.quantity]) - Number(a[roleFields.quantity]))[0];
      applyDiscount(best);
    } else {
      const selected = quantityDiscounts.find(
        (item) => Number(item[roleFields.quantity]) === selectedQuantity
      );
      applyDiscount(selected);
    }

    setQuantityDropdownVisible(false);
  };

  // ── Price helpers ─────────────────────────────────────────────────────────
  const formatPrice = (price) =>
    `₹${parseFloat(price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getUnitPrice = () => {
    const p = Number(_.get(checkOutState, "product_price", 0));
    return Math.round(calculateUnitPrice(p, discountPercentage.percentage, user.role, Gst));
  };

  const getUnitPricewithoutGst = () => {
    const p = Number(_.get(checkOutState, "product_price", 0));
    return Math.round(calculateUnitPriceWithoutGst(p, discountPercentage.percentage));
  };

  const getMRPUnitPrice = () => {
    const p = Number(_.get(checkOutState, "product_price", 0));
    return calculateMRPUnitPrice(p, user.role, Gst);
  };

  const getOriginalUnitPrice = () => {
    const p = Number(_.get(checkOutState, "product_price", 0));
    return user.role === "Corporate" || user.role === "Dealer" ? p : p * (1 + Gst / 100);
  };

  const calculateTotalPrice           = () => (!quantity ? 0 : (getUnitPrice() * quantity).toFixed(2));
  const calculateTotalPricewithoutGst = () => (!quantity ? 0 : (getUnitPricewithoutGst() * quantity).toFixed(2));
  const calculateGstPrice             = () => {
    if (!quantity) return "0.00";
    const u = getUnitPrice();
    return typeof u === "number" && !isNaN(u) ? u.toFixed(2) : Number(u);
  };
  const calculateMRPTotalPrice        = () => (!quantity ? 0 : (Number(_.get(data, "MRP_price", 0)) * quantity).toFixed(2));
  const calculateOriginalTotalPrice   = () => (!quantity ? 0 : (getOriginalUnitPrice() * quantity).toFixed(2));
  const calculateMRPSavings           = () => {
    if (!quantity) return 0;
    return ((Number(_.get(data, "MRP_price", 0)) - getMRPUnitPrice()) * quantity).toFixed(2);
  };
  const calculateDiscountSavings      = () => {
    if (!quantity) return 0;
    return ((getOriginalUnitPrice() - getUnitPrice()) * quantity).toFixed(2);
  };
  const calculateTotalSavings         = () =>
    (parseFloat(calculateMRPSavings()) + parseFloat(calculateDiscountSavings())).toFixed(2);

  const calculateDealPercentageDiscount = () => {
    if (!quantity) return 0;
    const mrpTotal  = parseFloat(calculateMRPTotalPrice());
    const dealTotal = parseFloat(calculateTotalPrice());
    if (mrpTotal === 0 || dealTotal >= mrpTotal) return 0;
    return Math.round(((mrpTotal - dealTotal) / mrpTotal) * 100);
  };

  const calculateTotalSavingsPercentage = () => {
    const total = parseFloat(calculateTotalSavings());
    const mrp   = parseFloat(calculateMRPTotalPrice());
    if (mrp === 0 || total <= 0) return 0;
    return Math.min(100, Math.round((total / mrp) * 100));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ handleBuy — FIXED: now sends phone_number + email so backend can store them
  // ─────────────────────────────────────────────────────────────────────────
  const handlebuy = async () => {
    try {
      setLoading(true);

      if (!quantity) {
        toast.error("Please select quantity first");
        return;
      }

      // Validate platform links for QR products
      if (isQrProduct && selectedPlatforms.length > 0) {
        const missingLinks = selectedPlatforms.filter(
          (p) => !platformLinks[p] || platformLinks[p].trim() === ""
        );
        if (missingLinks.length > 0) {
          toast.error(`Please enter links for: ${missingLinks.join(", ")}`);
          return;
        }
        for (const platform of selectedPlatforms) {
          const link = platformLinks[platform];
          if (link && !link.startsWith("http://") && !link.startsWith("https://")) {
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

      const token   = localStorage.getItem("userData") || "guest";
      const guestId = getGuestId();

      // Build selected platform links map
      const selectedPlatformLinks = {};
      selectedPlatforms.forEach((platform) => {
        if (platformLinks[platform]) {
          selectedPlatformLinks[platform] = platformLinks[platform];
        }
      });

      // ✅ Extract user phone + email from Redux auth state
      //    These are sent so the backend can store them on the cart document
      //    immediately — without needing a separate DB lookup.
      const userPhone = user.phone || user.phoneNumber || user.mobile || null;
      const userEmail = user.email || null;

      const baseCartPayload = {
        ...checkOutState,
        selected_platforms:      selectedPlatforms,
        platform_links:          selectedPlatformLinks,
        is_qr_product:           isQrProduct,
        sgst:                    Number(Gst / 2),
        cgst:                    Number(Gst / 2),
        MRP_savings:             calculateMRPSavings(),
        TotalSavings:            calculateTotalSavings(),
        FreeDelivery:            freeDelivery,
        DeliveryCharges:         deliveryCharges,
        noCustomtation:          noDesignUpload,
        final_total:             Number(calculateTotalPrice()),
        final_total_withoutGst:  Number(calculateTotalPricewithoutGst()),
        // ✅ Contact info — critical for abandonment reminders
        phone_number:            userPhone,
        email:                   userEmail,
      };

      let cartPayload;

      if (token === "user") {
        // Logged-in user
        cartPayload = {
          ...baseCartPayload,
          userRole: token,
        };
      } else {
        // Guest user — also pass guestId
        cartPayload = {
          ...baseCartPayload,
          guestId:  guestId,
          GuestId:  guestId,
          userRole: token,
        };
      }

      console.log("[Cart] Sending payload:", cartPayload);

      const result = await addToShoppingCart(cartPayload);

      Swal.fire({
        title:             "Product Added To Cart",
        text:              "Choose an option: Go to the shopping cart page or stay here.",
        icon:              "success",
        showCancelButton:  true,
        confirmButtonText: "Go to Shopping Cart",
        cancelButtonText:  "Stay Here",
      }).then((res) => {
        if (res.isConfirmed) goToShoppingCart();
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

  // ── Notify when available ────────────────────────────────────────────────
  const handleNotify = () => {
    setShowNotifyModal(true);
    notifyForm.resetFields();
  };

  const sendNotification = async (userData) => {
    try {
      setSendingNotification(true);
      const notificationData = {
        productName: _.get(data, "name", ""),
        productId:   _.get(data, "Vendor_Code", data._id),
        productUrl:  window.location.href,
        userEmail:   userData.email,
        userPhone:   userData.phone,
        userName:    userData.name,
        timestamp:   new Date().toISOString(),
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
    setShowNotifyModal(false);
    form.resetFields();
  };

  // ── Quantity dropdown renderer ────────────────────────────────────────────
  const quantityDropdownRender = () => {
    const options = generateQuantityOptions();
    return (
      <div
        className="p-2 rounded-lg shadow-xl bg-white"
        onMouseLeave={() => setQuantityDropdownVisible(false)}
      >
        <div className="overflow-y-auto max-h-80 space-y-3">
          {options.map((item) => {
            const unitPrice  = calculateUnitPrice(
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
                className={`flex justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-100 hover:border-blue-300 hover:bg-blue-50"
                }`}
                onClick={() => handleQuantitySelect(item.value)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-base font-medium ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
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
                  <p className={`font-semibold ${isSelected ? "text-yellow-700" : "text-gray-900"}`}>
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

        {options.length === 0 && (
          <div className="text-center py-4 text-gray-500">No quantity options available</div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => setShowBulkOrderForm(true)}
            className="w-full py-2 px-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <PlusOutlined />
            Bulk Order Inquiry
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">Prices include all applicable taxes</p>
        </div>
      </div>
    );
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const shareProduct = async (platform) => {
    const productUrl   = encodeURIComponent(window.location.href);
    const productTitle = encodeURIComponent(_.get(data, "product_description_tittle", ""));
    const shareUrls    = {
      facebook:  `https://www.facebook.com/sharer/sharer.php?u=${productUrl}&quote=${productTitle}`,
      whatsapp:  `https://api.whatsapp.com/send?text=${productTitle} - ${productUrl}`,
      linkedin:  `https://www.linkedin.com/sharing/share-offsite/?url=${productUrl}&title=${productTitle}`,
      email:     `mailto:?subject=${productTitle}&body=Check out: ${productTitle} - ${productUrl}`,
    };
    if (platform === "email") window.location.href = shareUrls[platform];
    else if (shareUrls[platform])   window.open(shareUrls[platform], "_blank");
    setShowShareMenu(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.name,
          text:  _.get(data, "product_description_tittle", ""),
          url:   window.location.href,
        });
      } catch {
        setShowShareMenu(!showShareMenu);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  // ── Bulk order ────────────────────────────────────────────────────────────
  const handleBulkOrderSubmit = async (values) => {
    try {
      await bulkOrder(values);
      message.success("Bulk order inquiry submitted successfully!");
      setShowBulkOrderForm(false);
      form.resetFields();
    } catch {
      message.error("Failed to submit bulk order inquiry");
    }
  };

  const handleSendOtp = async (email) => {
    if (emailVerified) return;
    setSendingOtp(true);
    try {
      await resendOtp({ email });
      setOtpSent(true);
      message.success("OTP sent to your email");
    } catch {
      message.error("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    try {
      await verifyOtp({ email: form.getFieldValue("email"), otp });
      setEmailVerified(true);
      message.success("Email verified successfully");
    } catch {
      message.error("Invalid OTP");
      form.setFields([{ name: "otp", errors: ["Invalid OTP"] }]);
    }
  };

  const validateEmail      = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleNoCustomization = (e) => {
    setNoDesignUpload(e.target.checked);
    setNeedDesignUpload(!e.target.checked);
  };
  const handleDesignRemove = () =>
    setCheckOutState((prev) => ({ ...prev, product_design_file: "" }));

  // ── ProcessingTimeInfo ────────────────────────────────────────────────────
  const ProcessingTimeInfo = () => (
    <div className="max-h-[400px] overflow-y-auto text-gray-700">
      <Paragraph>
        After our <b>designing team</b> completes your design, you'll receive a <b>WhatsApp message</b>.
        Just reply "Yes" — and we'll immediately start processing your order.
      </Paragraph>
      <Paragraph>
        Please note that <b>delivery time may delay</b>, but your order is <b>100% safe and secure</b>.
      </Paragraph>
      <Paragraph>
        <b>Returns or exchanges are not applicable for customized products.</b> Share your <b>expectations
        clearly</b> so we prepare it <b>perfectly</b>.
      </Paragraph>
      <Alert
        message="If you place an order without a custom design, it will be delivered within 3–4 working days."
        type="info"
        showIcon
        className="!py-2"
      />
    </div>
  );

  const generateLabel = (label) => {
    switch (label) {
      case "new":          return <Tag color="green">New</Tag>;
      case "popular":      return <Tag color="purple">Popular</Tag>;
      case "only-for-today": return <Tag color="red">Only For Today</Tag>;
      default:             return <></>;
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────
  return (
    <Spin spinning={loading} indicator={<IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />}>
      <div className="font-primary w-full space-y-2 relative">

        {/* ── Product Header ─────────────────────────────────────────── */}
        <div className="space-y-1 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1 w-full md:w-auto">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-gray-900 font-bold text-xl md:text-2xl lg:text-2xl leading-tight w-full md:w-[80%]">
                {data.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.label?.map((label, index) => <span key={index}>{generateLabel(label)}</span>)}
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col md:flex-row items-start md:items-center gap-3 md:relative">
            {/* Mobile price */}
            <div className="md:hidden flex flex-row-reverse items-center gap-3 w-full justify-between my-2">
              <button
                onClick={handleNativeShare}
                className="bg-[#f2c41a] text-black p-3 rounded-full shadow-md transition-all duration-300"
              >
                <IoShareSocial />
              </button>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-md px-4 py-2 shadow-md text-right"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-white/70 text-xs line-through">
                    {formatPrice(Number(_.get(data, "MRP_price", 0)))}
                  </span>
                  <h3 className="text-white text-base font-semibold">
                    {quantity ? formatPrice(getUnitPrice()) : "Select Qty"}
                  </h3>
                </div>
              </motion.div>
            </div>

            {/* Desktop price */}
            <div className="hidden md:flex items-center gap-3 flex-col-reverse">
              {isSoldOut && <div className="relative top-0"><AnimatedWaxSealBadge /></div>}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
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
                  <p className="text-xs text-gray-500 font-semibold p-2">Share via</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => shareProduct("facebook")} className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 transition-all">
                      <FacebookIcon size={35} round /><span className="text-xs mt-1">Facebook</span>
                    </button>
                    <button onClick={() => shareProduct("whatsapp")} className="flex flex-col items-center justify-center p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-500 transition-all">
                      <WhatsappIcon size={35} round /><span className="text-xs mt-1">WhatsApp</span>
                    </button>
                  </div>
                </CustomPopover>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Product Description ────────────────────────────────────── */}
        <div>
          <h2 className="text-md font-semibold w-full md:w-[70%]">
            {_.get(data, "product_description_tittle", "")}
          </h2>
          <ul className="grid grid-cols-1 my-2 gap-2 text-md list-disc pl-5">
            <li>{_.get(data, "Point_one", "")}</li>
            <li>{_.get(data, "Point_two", "")}</li>
            <li>{_.get(data, "Point_three", "")}</li>
            <li>{_.get(data, "Point_four", "")}</li>
            <li className="list-none text-blue-600 cursor-pointer" onClick={scrollToproductDetails}>
              read more
            </li>
          </ul>
        </div>

        {/* ── Quantity & Variants ────────────────────────────────────── */}
        <div className="w-full flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
            <Text strong className="block mb-2 md:mb-0 md:w-24">Quantity:</Text>
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
            {product_type !== "Stand Alone Product" && !_.isEmpty(currentPriceSplitup) && (
              <>
                {_.get(data, "variants", []).map((v, index) => (
                  <div key={index} className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
                    <Text strong className="block mb-2 md:mb-0 md:w-24">{v.variant_name}:</Text>
                    {v.variant_type !== "image_variant" ? (
                      <Select
                        defaultValue={_.get(currentPriceSplitup, `[${v.variant_name}]`, "")}
                        options={v.options.map((opt) => ({ value: opt.value, label: opt.value }))}
                        onChange={(value) => handleOnChangeSelectOption(value, index)}
                        placeholder={`Select ${v.variant_name}`}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {v.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex flex-col items-center">
                            <div
                              onClick={() => handleOnChangeSelectOption(option.value, index)}
                              className={`cursor-pointer border-2 p-1 rounded transition duration-200 ${
                                _.get(currentPriceSplitup, `[${v.variant_name}]`, "") === option.value
                                  ? "border-blue-500 shadow-md"
                                  : "border-gray-300 hover:border-blue-400"
                              }`}
                              style={{ width: "50px", height: "50px" }}
                            >
                              <img fetchpriority="high" loading="eager" src={option.image_name} className="w-full h-full object-contain" alt={option.value} />
                            </div>
                            <Text className="text-xs mt-1 text-center">{option.value}</Text>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── Total Price Card ───────────────────────────────────────── */}
        <Card className="rounded-lg border-0 bg-blue-50">
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <Text strong className="text-gray-800">Deal Price:</Text>
              <div className="text-right flex flex-col md:flex-row md:items-baseline gap-1">
                <Text delete className="text-md text-gray-500 md:mr-2">
                  {formatPrice(calculateMRPTotalPrice())}
                </Text>
                <Title level={4} className="!m-0 !text-green-600">
                  {quantity ? formatPrice(calculateTotalPrice()) : formatPrice(0)}
                </Title>
              </div>
            </div>

            {calculateTotalSavings() > 0 && (
              <Alert
                message={
                  <div>
                    {calculateMRPSavings() > 0 && (
                      <div className="mt-1 text-sm">
                        You Saved: {formatPrice(calculateMRPSavings())} ({calculateDealPercentageDiscount()}% OFF MRP)
                      </div>
                    )}
                    {discountPercentage.percentage > 0 && (
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
            )}

            {(user.role === "Corporate" || user.role === "Dealer" || user.role === "bni_user") && (
              <div className="text-gray-600">
                <h1 className="!text-[12px]">
                  Exclusive of all taxes for <Text strong>{quantity}</Text> Qty (
                  <Text strong>
                    {formatPrice(DISCOUNT_HELPER(discountPercentage.percentage, Number(_.get(checkOutState, "product_price", 0))))}
                  </Text>/ piece)
                </h1>
              </div>
            )}

            {quantity && (
              <div className="!text-[14px] text-gray-600">
                <h1>
                  Inclusive of all taxes for <span>{quantity}</span> Qty
                  <span className="font-bold">
                    &nbsp;({(user.role === "Dealer" || user.role === "Corporate" || user.role === "bni_user")
                      ? <>{formatPrice(Gst_HELPER(Gst, getUnitPrice()))}</>
                      : <>{formatPrice(calculateGstPrice())}</>
                    }/ piece)
                  </span>
                </h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Text strong className="text-gray-700">Processing Time:</Text>
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

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
            className="mt-4"
          >
            <Text strong className="block mb-2 text-gray-700">Estimated Delivery</Text>
            <div className="rounded-lg">
              <PincodeDeliveryCalculator
                Production={processing_item}
                freeDelivery={freeDelivery}
                deliveryCharges={deliveryCharges}
              />
            </div>
          </motion.div>
        </Card>

        {/* ── Platform Selection (QR Products) ──────────────────────── */}
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
                Select platforms and enter the corresponding links
              </Text>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {platformOptions.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.value);
                  const isExpanded = expandedPlatform === platform.value;

                  return (
                    <div
                      key={platform.value}
                      className="flex flex-col p-3 border rounded-lg transition-all cursor-pointer"
                      onClick={(e) => handlePlatformContainerClick(platform.value, e)}
                      style={isSelected ? { borderColor: platform.color, backgroundColor: platform.bgColor } : {}}
                    >
                      <div className="flex items-center">
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-full mr-3"
                          style={{ backgroundColor: isSelected ? platform.color : "#f3f4f6", color: isSelected ? "white" : platform.color }}
                        >
                          {platform.icon}
                        </div>
                        <span className="font-medium">{platform.label}</span>
                        <div className="ml-auto">
                          {isSelected
                            ? <CheckCircleOutlined style={{ color: platform.color, fontSize: "16px" }} />
                            : <div className="w-4 h-4 border border-gray-300 rounded"></div>
                          }
                        </div>
                      </div>

                      {isSelected && isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 overflow-hidden"
                        >
                          <div className="flex items-center gap-0">
                            <Input
                              placeholder={`Enter ${platform.label} link`}
                              value={platformLinks[platform.value] || ""}
                              onChange={(e) => handlePlatformLinkChange(platform.value, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                              className="flex-1"
                              size="small"
                              autoFocus={isExpanded}
                              style={{ borderColor: platform.color }}
                            />
                            <Button
                              type="text"
                              className="w-3"
                              onClick={(e) => { e.stopPropagation(); setExpandedPlatform(null); }}
                              style={{ color: platform.color }}
                            >
                              ✔️
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Enter full URL (e.g., https://example.com)
                          </div>
                        </motion.div>
                      )}

                      {isSelected && !isExpanded && (
                        <div className="mt-2">
                          <Button
                            type="link"
                            size="small"
                            onClick={(e) => { e.stopPropagation(); setExpandedPlatform(platform.value); }}
                            style={{ color: platform.color }}
                            className="p-0"
                          >
                            {platformLinks[platform.value] ? "Edit link" : "Add link"}
                          </Button>
                          {platformLinks[platform.value] && (
                            <div className="text-xs text-gray-600 truncate mt-1">
                              {platformLinks[platform.value].length > 30
                                ? `${platformLinks[platform.value].substring(0, 30)}...`
                                : platformLinks[platform.value]}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedPlatforms.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <Text strong>Selected Platforms ({selectedPlatforms.length})</Text>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPlatforms.map((platform) => {
                      const info = platformOptions.find((p) => p.value === platform);
                      return (
                        <Tag
                          key={platform}
                          style={{ backgroundColor: info?.bgColor, borderColor: info?.color, color: info?.color }}
                          className="py-1 px-2 flex items-center gap-1"
                        >
                          <span style={{ color: info?.color }}>{info?.icon}</span>
                          <span className="font-medium">{platform}: </span>
                          {platformLinks[platform]
                            ? <span className="text-xs truncate max-w-[150px] inline-block">{platformLinks[platform]}</span>
                            : <span className="text-red-500 text-xs">No link</span>
                          }
                          <CloseOutlined
                            className="ml-1 cursor-pointer hover:opacity-70"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePlatformSelect(platform); }}
                          />
                        </Tag>
                      );
                    })}
                  </div>
                  {selectedPlatforms.some((p) => !platformLinks[p] || platformLinks[p].trim() === "") && (
                    <Alert
                      message="Some platforms are missing links. Please enter links for all selected platforms."
                      type="warning"
                      showIcon
                      className="mt-2 !py-2"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── File Upload Section ────────────────────────────────────── */}
        {!isSoldOut && (
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <Checkbox checked={noDesignUpload} onChange={handleNoCustomization}>
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
                        setCheckOutState((prev) => ({ ...prev, product_design_file: "" }));
                        setChecked(false);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {!noDesignUpload && (
              <div>
                {needDesignUpload ? (
                  <>
                    <Alert
                      message="If you already have a design, we will review it prior to starting production."
                      type="warning"
                      showIcon
                      className="my-2 !py-2"
                    />
                    <UploadFileButton
                      handleUploadImage={handleUploadImage}
                      buttonText="Drag & Drop Files Here or Browse Files"
                      className="w-full border-dotted rounded-lg flex flex-col items-center justify-center transition-colors"
                    />
                    {checkOutState.product_design_file && (
                      <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="md:order-1">
                          <Button type="link" icon={<EyeOutlined />} onClick={() => setDesignPreviewVisible(true)}>
                            View Design
                          </Button>
                          <Button type="link" onClick={handleDesignRemove}>Remove</Button>
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

            <div>
              <div className="flex gap-3 mb-2">
                <Text className="text-gray-800 font-bold">Instructions</Text>
                <Switch checked={instructionsVisible} onChange={setInstructionsVisible} />
              </div>
              {instructionsVisible && (
                <TextArea
                  rows={4}
                  placeholder="Please provide the instructions for this product (max 180 words)"
                  maxLength={180}
                  onChange={(e) =>
                    setCheckOutState((prev) => ({ ...prev, instructions: e.target.value }))
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* ── Add to Cart / Notify Button ────────────────────────────── */}
        <div className="w-full">
          {isGettingVariantPrice ? (
            <div className="center_div py-6"><Spin size="large" /></div>
          ) : (
            <>
              {isSoldOut ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mb-4">
                    <Button
                      type="default"
                      size="large"
                      className="!h-12 !border-gray-300 !text-gray-700 font-medium w-full"
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

        {/* ── Design Preview Modal ───────────────────────────────────── */}
        <CustomModal
          open={designPreviewVisible}
          onClose={() => setDesignPreviewVisible(false)}
          title="Design Preview"
          width={700}
          footer={[<Button key="close" onClick={() => setDesignPreviewVisible(false)}>Close</Button>]}
        >
          <div className="flex justify-center">
            <img fetchpriority="high" loading="eager" src={checkOutState.product_design_file} alt="Design Preview" style={{ maxHeight: "400px" }} />
          </div>
        </CustomModal>

        {/* ── Notify Modal ───────────────────────────────────────────── */}
        <CustomModal
          open={showNotifyModal}
          onClose={() => { setShowNotifyModal(false); notifyForm.resetFields(); }}
          title="Notify When Available"
          width={500}
        >
          <Form form={form} layout="vertical" onFinish={handleNotifySubmit}>
            <div className="space-y-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Product Name" name="product_name" initialValue={_.get(data, "name", "")}>
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: "Please enter quantity" }]}>
                    <InputNumber min={1} className="w-full" addonAfter={unit} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Email Address" name="email" rules={[{ required: true, message: "Please enter email" }, { type: "email", message: "Invalid email" }]}>
                <Input
                  placeholder="your@email.com"
                  suffix={emailVerified ? <CheckCircleOutlined style={{ color: "#52c41a" }} /> : <LoadingOutlined spin={sendingOtp} />}
                  onBlur={(e) => { if (e.target.value && validateEmail(e.target.value)) handleSendOtp(e.target.value); }}
                />
              </Form.Item>
              {otpSent && !emailVerified && (
                <Form.Item label="Enter OTP" name="otp" rules={[{ required: true, message: "Please enter OTP" }]}>
                  <div className="flex items-center gap-3">
                    <Input.OTP length={6} onChange={(otp) => { if (otp.length === 6) handleVerifyOtp(otp); }} disabled={emailVerified} />
                    <Button type="link" onClick={() => handleSendOtp(form.getFieldValue("email"))} disabled={sendingOtp}>Resend OTP</Button>
                  </div>
                </Form.Item>
              )}
              <Form.Item label="Mobile Number" name="mobile" rules={[{ required: true, message: "Please enter mobile number" }]}>
                <Input placeholder="+91 12345 67890" />
              </Form.Item>
              <Form.Item label="Additional Requirements" name="additional_requirements">
                <TextArea rows={3} placeholder="Any special requirements or notes..." />
              </Form.Item>
              <div className="flex gap-3">
                <Button onClick={() => setShowNotifyModal(false)} className="flex-1">Cancel</Button>
                <Button type="primary" htmlType="submit" className="flex-1 bg-yellow-500" disabled={!emailVerified}>Submit Inquiry</Button>
              </div>
            </div>
          </Form>
        </CustomModal>

        {/* ── Bulk Order Modal ───────────────────────────────────────── */}
        <CustomModal open={showBulkOrderForm} onClose={() => setShowBulkOrderForm(false)} title="Bulk Order Inquiry" width={600}>
          <Form form={form} layout="vertical" onFinish={handleBulkOrderSubmit}>
            <div className="space-y-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Product Name" name="product_name" initialValue={_.get(data, "name", "")}>
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: "Please enter quantity" }]}>
                    <InputNumber min={1} className="w-full" addonAfter={unit} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Email Address" name="email" rules={[{ required: true, message: "Please enter email" }, { type: "email", message: "Invalid email" }]}>
                <Input
                  placeholder="your@email.com"
                  suffix={emailVerified ? <CheckCircleOutlined style={{ color: "#52c41a" }} /> : <LoadingOutlined spin={sendingOtp} />}
                  onBlur={(e) => { if (e.target.value && validateEmail(e.target.value)) handleSendOtp(e.target.value); }}
                />
              </Form.Item>
              {otpSent && !emailVerified && (
                <Form.Item label="Enter OTP" name="otp">
                  <div className="flex items-center gap-3">
                    <Input.OTP length={6} onChange={(otp) => { if (otp.length === 6) handleVerifyOtp(otp); }} disabled={emailVerified} />
                    <Button type="link" onClick={() => handleSendOtp(form.getFieldValue("email"))} disabled={sendingOtp}>Resend OTP</Button>
                  </div>
                </Form.Item>
              )}
              <Form.Item label="Mobile Number" name="mobile" rules={[{ required: true, message: "Please enter mobile number" }]}>
                <Input placeholder="+91 12345 67890" />
              </Form.Item>
              <Form.Item label="Additional Requirements" name="additional_requirements">
                <TextArea rows={3} placeholder="Any special requirements or notes..." />
              </Form.Item>
              <div className="flex gap-3">
                <Button onClick={() => setShowBulkOrderForm(false)} className="flex-1">Cancel</Button>
                <Button type="primary" htmlType="submit" className="flex-1 bg-yellow-500" disabled={!emailVerified}>Submit Inquiry</Button>
              </div>
            </div>
          </Form>
        </CustomModal>

        {/* ── Product Meta ────────────────────────────────────────────── */}
        <div className="space-y-2 z-0 relative">
          <div className="flex items-center">
            <Text strong className="!text-gray-800 !w-20">Categories:</Text>
            <Text className="text-gray-600">
              {_.get(data, "category_details.main_category_name", "")}
              {_.get(data, "sub_category_details.sub_category_name", "") &&
                `, ${_.get(data, "sub_category_details.sub_category_name", "")}`}
            </Text>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default ProductDetails;

// ─────────────────────────────────────────────────────────────────────────────
// PincodeDeliveryCalculator
// ─────────────────────────────────────────────────────────────────────────────
import { FaTruck, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

export const PincodeDeliveryCalculator = ({ Production, freeDelivery, deliveryCharges }) => {
  const [pincode,              setPincode]              = useState("");
  const [deliveryDate,         setDeliveryDate]         = useState("");
  const [state,                setState]                = useState("");
  const [error,                setError]                = useState("");
  const [isLoading,            setIsLoading]            = useState(false);
  const [isValidatingPincode,  setIsValidatingPincode]  = useState(false);
  const [isGettingLocation,    setIsGettingLocation]    = useState(false);
  const [isPincodeValid,       setIsPincodeValid]       = useState(null);
  const [isModalOpen,          setIsModalOpen]          = useState(false);

  const stateDeliveryDays = {
    maharashtra:  { days: 2, name: "Maharashtra" },
    gujarat:      { days: 3, name: "Gujarat" },
    karnataka:    { days: 4, name: "Karnataka" },
    "tamil nadu": { days: 3, name: "Tamil Nadu" },
    kerala:       { days: 6, name: "Kerala" },
    delhi:        { days: 7, name: "Delhi" },
    default:      { days: 3, name: "Other States" },
  };

  const pincodeToStateMap = {
    400: "maharashtra",
    395: "gujarat",
    560: "karnataka",
    600: "tamil nadu",
    682: "kerala",
    110: "delhi",
  };

  const getStateFromPincode = (pin) => pincodeToStateMap[pin.substring(0, 3)] || "default";

  const calculateProductionDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + Number(Production || 0));
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const calculateDeliveryDate = (stateKey = "tamil nadu") => {
    const { days } = stateDeliveryDays[stateKey] || stateDeliveryDays.default;
    const d = new Date();
    d.setDate(d.getDate() + Number(Production || 0) + Number(days) + 2);
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const validatePincode = async (pin) => {
    setIsValidatingPincode(true);
    await new Promise((res) => setTimeout(res, 800));
    const isValid = /^\d{6}$/.test(pin);
    setIsPincodeValid(isValid);
    if (isValid) {
      const stateKey = getStateFromPincode(pin);
      setState(stateDeliveryDays[stateKey]?.name || stateDeliveryDays.default.name);
      setDeliveryDate(calculateDeliveryDate(stateKey));
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
    if (value.length === 6) validatePincode(value);
  };

  const extractPincodeFromDisplayName = (displayName) => {
    const m = displayName.match(/\b\d{6}\b/);
    return m ? m[0] : null;
  };

  const getPincodeByGPS = async () => {
    setIsGettingLocation(true);
    setError("");
    try {
      if (!navigator.geolocation) throw new Error("Geolocation not supported");
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 15000, enableHighAccuracy: true, maximumAge: 300000,
        })
      );
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`
      );
      const d = await response.json();
      const detectedPincode = d.address?.postcode || extractPincodeFromDisplayName(d.display_name);
      if (detectedPincode) {
        setPincode(detectedPincode);
        validatePincode(detectedPincode);
        toast.success(`📍 Pincode detected: ${detectedPincode}`);
      } else {
        throw new Error("No pincode found");
      }
    } catch (err) {
      toast.error("Failed to get location. Please enter pincode manually.");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const productionDate = calculateProductionDate();

  return (
    <div className="pincode-delivery-calculator">
      <div className="pincode-input-container">
        <motion.div whileHover={{ scale: 1.01 }} className="input-wrapper relative overflow-hidden rounded-lg">
          <Input
            className="pincode-input"
            value={pincode}
            onChange={handlePincodeChange}
            placeholder="Enter 6-digit Pincode"
            maxLength={6}
            suffix={
              <div className="input-suffix">
                {isValidatingPincode && <Spin size="small" />}
                {isPincodeValid && <CheckCircleOutlined className="success-icon" />}
                {isPincodeValid === false && <CloseCircleOutlined className="error-icon" />}
              </div>
            }
          />
          <button
            onClick={getPincodeByGPS}
            disabled={isGettingLocation}
            className="location-button absolute flex top-0 right-0 bg-yellow-500 h-full p-2"
          >
            {isGettingLocation
              ? <Spin size="small" />
              : <span className="button-content flex items-center gap-2"><FaMapMarkerAlt /> Get Location</span>
            }
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
                <Text delete type="secondary">₹ {deliveryCharges}</Text>
                <Text type="success" strong>Cheers – Zero Delivery Charges, 100% Happiness!</Text>
              </div>
            ) : (
              <Text type="success" strong>₹ {deliveryCharges} Delivery Charges Applicable</Text>
            )}
          </motion.div>
        ) : (
          <motion.div className="production-info" whileHover={{ x: 5 }}>
            <span className="production-text">
              Expected Dispatch by <Text strong>{productionDate}</Text>
            </span>
            <Divider type="vertical" />
            <Text type="secondary">Enter pincode for delivery date & charges</Text>
            {freeDelivery && <Text type="success" strong>Cheers – Zero Delivery Charges, 100% Happiness!</Text>}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SimpleHangingSoldBoard
// ─────────────────────────────────────────────────────────────────────────────
export const SimpleHangingSoldBoard = () => {
  const swingAnimation = {
    animate: {
      rotate: [0, 8, -8, 6, -6, 3, -3, 0],
      transition: { duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
    },
  };

  return (
    <div className="z-50 pointer-events-none flex justify-center">
      <div className="relative">
        <motion.div
          className="relative mt-20 w-40 h-14 bg-red-600 rounded-md border-3 shadow-xl"
          variants={swingAnimation}
          animate="animate"
          style={{ originY: 0 }}
        >
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