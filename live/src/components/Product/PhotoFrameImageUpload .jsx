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
  Upload,
} from "antd";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
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
  InboxOutlined,
  HomeOutlined,
  ShopOutlined,
  CameraOutlined,
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
import { FaTruck, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

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
                <CloseOutlined className="text-gray-500 " />
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
// ✅ FIXED: PhotoFrameImageUpload — improved with proper isolation and alignment
// ─────────────────────────────────────────────────────────────────────────────
const PhotoFrameImageUpload = ({ label, value, onChange, required }) => {
  // ✅ FIX: Use key-based approach to force component re-mount for each instance
  const [preview, setPreview] = useState(value || null);
  const [uploadKey, setUploadKey] = useState(0);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  // ✅ FIX: Memoized callback with explicit reference to onChange
  const handleUpload = useCallback((fileString) => {
    if (!fileString) return;
    console.log(`[${label}] Uploading:`, fileString); // Debug log
    setPreview(fileString);
    onChange(fileString);
  }, [onChange, label]);

  const handleRemove = (e) => {
    e.stopPropagation();
    console.log(`[${label}] Removing image`); // Debug log
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <label className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {preview ? (
        // ── Preview state ───────────────────────────────────────────────────
        <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm group flex-grow">
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-cover"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            {/* ✅ FIX: Use key to force re-render and reset upload state */}
            <UploadFileButton
              key={`upload-${uploadKey}`}
              handleUploadImage={handleUpload}
              buttonText="Change"
              className="bg-white/90 text-gray-800 px-3 py-1 rounded-lg text-xs font-medium hover:bg-white transition-colors cursor-pointer"
            />

            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500/90 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-500 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        // ── Empty / upload state ────────────────────────────────────────────
        <div className="w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-500 transition-all flex-grow flex items-center justify-center">
          <UploadFileButton
            key={`upload-empty-${uploadKey}`}
            handleUploadImage={handleUpload}
            buttonText={
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <CameraOutlined className="text-amber-600 text-xl" />
                </div>
                <span className="text-xs text-amber-700 font-medium">Click to upload</span>
                <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
              </div>
            }
            className="w-full h-full flex items-center justify-center cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PincodeDeliveryCalculatorForModal - standalone version for the modal
// ─────────────────────────────────────────────────────────────────────────────
const PincodeDeliveryCalculatorForModal = ({
  onDeliveryChargeChange,
  onPincodeChange,
  initialPincode = "",
}) => {
  const [pincode, setPincode] = useState(initialPincode);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState("");
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isPincodeValid, setIsPincodeValid] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

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
    600: "tamil nadu", 601: "tamil nadu", 602: "tamil nadu", 603: "tamil nadu",
    604: "tamil nadu", 605: "tamil nadu", 606: "tamil nadu", 607: "tamil nadu",
    608: "tamil nadu", 609: "tamil nadu", 610: "tamil nadu", 611: "tamil nadu",
    612: "tamil nadu", 613: "tamil nadu", 614: "tamil nadu", 615: "tamil nadu",
    616: "tamil nadu", 617: "tamil nadu", 618: "tamil nadu", 619: "tamil nadu",
    620: "tamil nadu", 621: "tamil nadu", 622: "tamil nadu", 623: "tamil nadu",
    624: "tamil nadu", 625: "tamil nadu", 626: "tamil nadu", 627: "tamil nadu",
    628: "tamil nadu", 629: "tamil nadu", 630: "tamil nadu", 631: "tamil nadu",
    632: "tamil nadu", 633: "tamil nadu", 634: "tamil nadu", 635: "tamil nadu",
    636: "tamil nadu", 637: "tamil nadu", 638: "tamil nadu", 639: "tamil nadu",
    640: "tamil nadu", 641: "tamil nadu", 642: "tamil nadu", 643: "tamil nadu",
    644: "tamil nadu", 645: "tamil nadu", 646: "tamil nadu", 647: "tamil nadu",
    648: "tamil nadu", 649: "tamil nadu",
    400: "maharashtra",
    395: "gujarat",
    560: "karnataka",
    682: "kerala",
    110: "delhi",
  };

  const getStateFromPincode = (pin) =>
    pincodeToStateMap[parseInt(pin.substring(0, 3))] || "default";

  const calculateDeliveryDate = (stateKey = "tamil nadu") => {
    const { days } = stateDeliveryDays[stateKey] || stateDeliveryDays.default;
    const d = new Date();
    d.setDate(d.getDate() + Number(days) + 2);
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const validatePincode = async (pin) => {
    setIsValidatingPincode(true);
    await new Promise((res) => setTimeout(res, 800));
    const isValid = /^\d{6}$/.test(pin);
    setIsPincodeValid(isValid);

    if (isValid) {
      const stateKey = getStateFromPincode(pin);
      const stateName = stateDeliveryDays[stateKey]?.name || stateDeliveryDays.default.name;
      setState(stateName);
      setDeliveryDate(calculateDeliveryDate(stateKey));

      const charge = stateKey === "tamil nadu" ? 60 : 100;
      setDeliveryCharge(charge);
      if (onDeliveryChargeChange) onDeliveryChargeChange(charge);
      if (onPincodeChange) onPincodeChange(pin);
      setError("");
    } else {
      setError("Please enter a valid 6-digit pincode");
      setDeliveryDate("");
      setState("");
      setDeliveryCharge(0);
      if (onDeliveryChargeChange) onDeliveryChargeChange(0);
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
    setDeliveryCharge(0);
    if (value.length === 6) {
      validatePincode(value);
    } else {
      if (onDeliveryChargeChange) onDeliveryChargeChange(0);
    }
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
    } catch {
      toast.error("Failed to get location. Please enter pincode manually.");
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="pincode-delivery-calculator-modal space-y-3">
      <div className="pincode-input-container">
        <div className="relative">
          <Input
            className="pincode-input !rounded-lg !border-gray-300 !h-11"
            value={pincode}
            onChange={handlePincodeChange}
            placeholder="Enter 6-digit Pincode for delivery estimate"
            maxLength={6}
            suffix={
              <div className="flex items-center gap-2">
                {isValidatingPincode && <Spin size="small" />}
                {isPincodeValid === true && <CheckCircleOutlined className="text-green-500" />}
                {isPincodeValid === false && <CloseCircleOutlined className="text-red-500" />}
              </div>
            }
          />
          <button
            onClick={getPincodeByGPS}
            disabled={isGettingLocation}
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            {isGettingLocation ? (
              <Spin size="small" />
            ) : (
              <>
                <FaMapMarkerAlt className="text-xs" />
                <span className="hidden sm:inline">Detect</span>
              </>
            )}
          </button>
        </div>

        {error && <div className="mt-1 text-red-500 text-sm">{error}</div>}

        {isPincodeValid && deliveryDate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircleOutlined className="text-green-500" />
                <span className="font-medium">Delivery available to {state}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <FaTruck className="text-blue-500" />
                  Expected Delivery: <strong>{deliveryDate}</strong>
                </span>
                <span className="flex items-center gap-1.5 text-gray-700">
                  <FaMapMarkerAlt className="text-red-400" />
                  Pincode: <strong>{pincode}</strong>
                </span>
              </div>
              <div className="mt-1 pt-2 border-t border-green-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Delivery Charges:</span>
                  <span className="font-bold text-green-700 text-base">₹{deliveryCharge}</span>
                  {deliveryCharge === 0 && (
                    <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">
                      Free Delivery
                    </span>
                  )}
                  {deliveryCharge === 60 && (
                    <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full">
                      Within Tamil Nadu
                    </span>
                  )}
                  {deliveryCharge === 100 && (
                    <span className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-0.5 rounded-full">
                      Outside Tamil Nadu
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ FIXED: PhotoFrameOrderModal
// ─────────────────────────────────────────────────────────────────────────────
const PhotoFrameOrderModal = ({ open, onClose, onConfirm, loading }) => {
  const [form] = Form.useForm();
  const [fatherImg, setFatherImg]       = useState(null);
  const [sonImg, setSonImg]             = useState(null);
  const [deliveryType, setDeliveryType] = useState(null); // 'pickup' | 'delivery'
  const [msgLength, setMsgLength]       = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [pincode, setPincode]           = useState("");
  const [validationError, setValidationError] = useState("");

  const handleDeliveryChange = (type) => {
    if (deliveryType === type) return;
    setDeliveryType(type);
    setValidationError("");
    form.setFieldsValue({
      pickup_from_office: type === "pickup",
      delivery_to_home:   type === "delivery",
    });
  };

  const handleDeliveryChargeChange = (charge) => setDeliveryCharge(charge);
  const handlePincodeChange = (pin) => setPincode(pin);

  const showError = (msg) => {
    setValidationError(msg);
    setTimeout(() => setValidationError(""), 4000);
  };

  const handleSubmit = async () => {
    setValidationError("");
    try {
      const values = await form.validateFields();

      if (!fatherImg) {
        showError("Please upload Father's photo");
        return;
      }
      if (!sonImg) {
        showError("Please upload Son's photo");
        return;
      }
      if (!deliveryType) {
        showError("Please select Pickup or Delivery option");
        return;
      }
      if (deliveryType === "delivery") {
        if (!pincode || pincode.length !== 6) {
          showError("Please enter a valid 6-digit pincode for delivery");
          return;
        }
        if (deliveryCharge === 0) {
          showError("Please wait while we calculate delivery charges for your pincode");
          return;
        }
      }

      onConfirm({
        father_name:        values.father_name,
        son_name:           values.son_name,
        unique_message:     values.unique_message || "",
        father_image:       fatherImg,
        son_image:          sonImg,
        pickup_from_office: deliveryType === "pickup",
        delivery_to_home:   deliveryType === "delivery",
        delivery_charge:    deliveryType === "pickup" ? 0 : deliveryCharge,
        pincode,
      });
    } catch {
      // Ant Design form validation handles field-level errors inline
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFatherImg(null);
    setSonImg(null);
    setDeliveryType(null);
    setMsgLength(0);
    setDeliveryCharge(0);
    setPincode("");
    setValidationError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 !z-[9999] flex items-center justify-center p-3 !overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col"
        style={{ boxShadow: "0 24px 80px rgba(180,120,0,0.18), 0 4px 20px rgba(0,0,0,0.12)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ background: "linear-gradient(135deg, #f2c41a 0%, #f2c41a 100%)" }}
        >
          <div>
            <h2 className="text-black font-bold text-lg leading-tight">
              🖼️ Photo Frame Details
            </h2>
            <p className="text-black text-xs mt-0.5">
              Personalise your frame — we'll handle the rest
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <CloseOutlined className="text-white text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-scroll overflow-x-hidden px-6 py-5">

          {/* ✅ FIX 2: Inline error banner — always visible inside the modal */}
          <AnimatePresence>
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium"
              >
                <CloseCircleOutlined className="text-red-500 flex-shrink-0" />
                <span>{validationError}</span>
                <button
                  type="button"
                  onClick={() => setValidationError("")}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <CloseOutlined className="text-xs" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <Form form={form} layout="vertical" requiredMark={false}>

            {/* Names */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Form.Item
                label={<span className="text-sm font-semibold text-gray-700">Father's Name <span className="text-red-500">*</span></span>}
                name="father_name"
                rules={[{ required: true, message: "Enter father's name" }]}
                className="!mb-0"
              >
                <Input
                  placeholder="e.g. Rajan Kumar"
                  className="rounded-lg"
                  prefix={<UserOutlined className="text-amber-500" />}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-sm font-semibold text-gray-700">Son's Name <span className="text-red-500">*</span></span>}
                name="son_name"
                rules={[{ required: true, message: "Enter son's name" }]}
                className="!mb-0"
              >
                <Input
                  placeholder="e.g. Arjun Kumar"
                  className="rounded-lg"
                  prefix={<UserOutlined className="text-amber-500" />}
                />
              </Form.Item>
            </div>

            {/* ── Photo Uploads (UploadFileButton with preview) ── */}
            {/* ✅ FIXED: Ensure both containers have equal height with proper alignment */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <PhotoFrameImageUpload
                  label="Father's Photo"
                  value={fatherImg}
                  onChange={setFatherImg}
                  required
                />
              </div>
              <div className="flex flex-col">
                <PhotoFrameImageUpload
                  label="Son's Photo"
                  value={sonImg}
                  onChange={setSonImg}
                  required
                />
              </div>
            </div>

            {/* Unique Message */}
            <Form.Item
              label={
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-gray-700">
                    Unique Message
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      msgLength > 25 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {msgLength}/30
                  </span>
                </div>
              }
              name="unique_message"
              className="!mb-4"
            >
              <Input
                placeholder="e.g. Forever In Our Hearts"
                maxLength={30}
                className="rounded-lg"
                onChange={(e) => setMsgLength(e.target.value.length)}
                showCount={false}
              />
            </Form.Item>

            {/* Delivery Options */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Delivery Option <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-3">

                {/* Pickup */}
                <button
                  type="button"
                  onClick={() => handleDeliveryChange("pickup")}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    deliveryType === "pickup"
                      ? "border-amber-500 bg-amber-50 shadow-sm"
                      : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
                  }`}
                >
                  {deliveryType === "pickup" && (
                    <div className="absolute top-2 right-2">
                      <CheckCircleOutlined className="text-amber-500 text-base" />
                    </div>
                  )}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      deliveryType === "pickup" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <ShopOutlined className="text-lg" />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${deliveryType === "pickup" ? "text-amber-700" : "text-gray-700"}`}>
                      Pickup from Office
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-0.5">Free</p>
                  </div>
                </button>

                {/* Delivery */}
                <button
                  type="button"
                  onClick={() => handleDeliveryChange("delivery")}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    deliveryType === "delivery"
                      ? "border-amber-500 bg-amber-50 shadow-sm"
                      : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
                  }`}
                >
                  {deliveryType === "delivery" && (
                    <div className="absolute top-2 right-2">
                      <CheckCircleOutlined className="text-amber-500 text-base" />
                    </div>
                  )}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      deliveryType === "delivery" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <HomeOutlined className="text-lg" />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${deliveryType === "delivery" ? "text-amber-700" : "text-gray-700"}`}>
                      Delivery to Home
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Charges apply</p>
                  </div>
                </button>
              </div>

              {/* Pincode calculator (shown only when delivery selected) */}
              <AnimatePresence>
                {deliveryType === "delivery" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <FaTruckFast className="text-blue-500 text-lg flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-800 mb-2">
                            Enter Pincode to Calculate Delivery Charges
                          </p>
                          <PincodeDeliveryCalculatorForModal
                            onDeliveryChargeChange={handleDeliveryChargeChange}
                            onPincodeChange={handlePincodeChange}
                          />
                          {deliveryCharge > 0 && (
                            <div className="mt-2 p-2 bg-white rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Delivery Charge:</span>
                                <span className="font-bold text-blue-700 text-base">₹{deliveryCharge}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {deliveryCharge === 60 && "📍 Within Tamil Nadu"}
                                {deliveryCharge === 100 && "📍 Outside Tamil Nadu"}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <Button onClick={handleClose} className="flex-1 h-11 rounded-xl font-medium">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={<ShoppingCartOutlined />}
            className="flex-1 h-11 rounded-xl font-semibold"
            style={{
              background: "linear-gradient(135deg, rgb(242, 196, 26) 0%, rgb(242, 196, 26) 100%)",
              border: "none",
              color: "black",
            }}
          >
            Add to Cart
          </Button>
        </div>
      </motion.div>
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

export default PhotoFrameOrderModal;