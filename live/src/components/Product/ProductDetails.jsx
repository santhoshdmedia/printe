/* eslint-disable no-empty */
/* eslint-disable react/prop-types */
import {
  Checkbox,
  Divider,
  Input,
  InputNumber,
  Modal,
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
} from "antd";
import React, { useEffect, useState } from "react";
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
import { DISCOUNT_HELPER } from "../../helper/form_validation";
import { motion } from "framer-motion";
import {
  HeartOutlined,
  PlusOutlined,
  MinusOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { CiFaceSmile } from "react-icons/ci";
import { CgSmileSad } from "react-icons/cg";
import { toast } from "react-toastify";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

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
  const product_type = _.get(data, "type", "Single Product");
  const price =
    product_type === "Single Product"
      ? _.get(data, "single_product_price", 0)
      : _.get(data, "variants_price[0].price", "");

  // State
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
  const [checkOutState, setCheckOutState] = useState({
    product_image: _.get(data, "images[0].path", ""),
    product_design_file: "",
    product_name: _.get(data, "name", ""),
    category_name: _.get(data, "category_details.main_category_name", ""),
    subcategory_name: _.get(data, "sub_category_details.sub_category_name", ""),
    product_price: price,
    product_variants: {},
    product_quantity: 0,
    product_seo_url: _.get(data, "seo_url", ""),
    product_id: _.get(data, "_id", ""),
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
  // geo locaton
  const [individualBox, setIndividualBox] = useState(false);
  const [quantityDropdownVisible, setQuantityDropdownVisible] = useState(false);
  // Add these state variables at the top with your other states
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isPincodeValid, setIsPincodeValid] = useState(null);
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState(0);

  // Add these functions
  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
    setPincode(value);
    setIsPincodeValid(null); // Reset validation when user types

    // Auto-validate when pincode is 6 digits
    if (value.length === 6) {
      validatePincode(value);
    }
  };

  const validatePincode = async (pincodeToValidate) => {
    setIsValidatingPincode(true);
    try {
      // Simple regex validation for Indian pincode (6 digits)
      const indianPincodeRegex = /^[1-9][0-9]{5}$/;

      if (!indianPincodeRegex.test(pincodeToValidate)) {
        setIsPincodeValid(false);
        toast.error("Invalid pincode format. Must be 6 digits.");
        return;
      }

      // Simulate API validation (replace with actual API call)
      const isValid = await simulatePincodeValidation(pincodeToValidate);

      if (isValid) {
        setIsPincodeValid(true);
        // toast.success("✓ Pincode is valid and serviceable");
      } else {
        setIsPincodeValid(false);
        toast.error("❌ Sorry, we don't deliver to this pincode yet");
      }
    } catch (error) {
      console.error("Pincode validation error:", error);
      setIsPincodeValid(false);
      toast.error("Error validating pincode");
    } finally {
      setIsValidatingPincode(false);
    }
  };

  const simulatePincodeValidation = async (pincode) => {
    // This is a mock validation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate: pincodes starting with 1-6 are valid (for demo)
        const isValid = /^[1-6]/.test(pincode);
        resolve(isValid);
      }, 1000);
    });
  };

  const getPincodeByGPS = async () => {
    setIsGettingLocation(true);
    setIsPincodeValid(null);

    try {
      // First check if geolocation is available
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        setIsGettingLocation(false);
        return;
      }

      // Check if we're on HTTPS (required for geolocation on mobile)
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      if (
        isMobile &&
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
      ) {
        toast.error("Please use HTTPS for location access on mobile devices");
        setIsGettingLocation(false);
        return;
      }

      // Get current position with timeout
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            handleGeolocationError(error);
            reject(error);
          },
          {
            timeout: 15000,
            enableHighAccuracy: true,
            maximumAge: 300000, // 5 minutes cache
          }
        );
      });

      const { latitude, longitude } = position.coords;

      // Use OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "YourApp/1.0 (your@email.com)", // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const detectedPincode = data.address?.postcode;
      const detectedState = data.address?.state;

      if (detectedPincode) {
        setPincode(detectedPincode);
        setState(detectedState);
        calculateDeliveryTime(state)
        console.log(state);

        toast.success(`📍 Pincode detected: ${detectedPincode}`);
        validatePincode(detectedPincode);
      } else {
        // Fallback: try to extract from display_name
        const fallbackPincode = extractPincodeFromDisplayName(
          data.display_name
        );
        if (fallbackPincode) {
          setPincode(fallbackPincode);
          toast.success(`📍 Pincode detected: ${fallbackPincode}`);
          validatePincode(fallbackPincode);
        } else {
          toast.error("Could not detect pincode from your location");
          setIsPincodeValid(false);
        }
      }
    } catch (error) {
      console.error("GPS location detection failed:", error);
      setIsPincodeValid(false);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const extractPincodeFromDisplayName = (displayName) => {
    const pincodeMatch = displayName.match(/\b\d{5,6}\b/);
    return pincodeMatch ? pincodeMatch[0] : null;
  };

  const handleGeolocationError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        toast.error(
          "Location access denied. Please enable location permissions in your browser settings."
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
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });

        if (permissionStatus.state === "denied") {
          toast.error(
            "Location access is blocked. Please enable it in browser settings."
          );
          return false;
        }

        if (permissionStatus.state === "prompt") {
          toast.info("Please allow location access when prompted");
        }

        return permissionStatus.state !== "denied";
      } catch (error) {
        console.warn("Permission API not supported:", error);
        return true;
      }
    }
    return true;
  };

  const getPincodeByGPSWithPermissionCheck = async () => {
    const hasPermission = await checkLocationPermission();
    if (hasPermission) {
      await getPincodeByGPS();
    }
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isGettingVariantPrice, product, productRateAndReview } = useSelector(
    (state) => state.publicSlice
  );
  const { user } = useSelector((state) => state.authSlice);

  // Get quantity discounts from backend
  const quantityDiscounts = _.get(data, "quantity_discount_splitup", []);
  const dropdownGap = _.get(data, "dropdown_gap", 100);
  const quantityType = _.get(data, "quantity_type", "dropdown");
  const maxQuantity = _.get(data, "max_quantity", 10000);

  useEffect(() => {
    if (quantityType !== "textbox" && quantityDiscounts.length > 0) {
      // Set initial quantity from the first discount option
      const initialQuantity = Number(
        _.get(quantityDiscounts, "[0].quantity", 500)
      );
      const initialDiscount = Number(
        _.get(quantityDiscounts, "[0].discount", 0)
      );

      setQuantity(initialQuantity);
      setDiscountPercentage({
        uuid: _.get(quantityDiscounts, "[0].uniqe_id", ""),
        percentage: initialDiscount,
      });
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: initialQuantity,
      }));
    } else {
      setDiscountPercentage({ uuid: "", percentage: 0 });
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
    // For single products, set the initial price and stock
    if (product_type === "Single Product") {
      setCheckOutState((prevState) => ({
        ...prevState,
        product_price: price,
      }));
      setStockCount(_.get(data, "stock_count", 0));
    } else if (_.isEmpty(currentPriceSplitup)) {
      // For products with variants
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
      checkOutState.sgst = Number((checkOutState?.product_price * 4) / 100);
      checkOutState.cgst = Number((checkOutState?.product_price * 4) / 100);
      checkOutState.final_total = Number(
        Number((checkOutState?.product_price * 4) / 100) * 2 +
          Number(checkOutState?.product_price * checkOutState.product_quantity)
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

  const calculateDeliveryTime = (state) => {
  switch (state) {
    case "Andhra Pradesh":
      setDeliveryTime(3);
      break;
    case "Arunachal Pradesh":
      setDeliveryTime(5);
      break;
    case "Assam":
      setDeliveryTime(4);
      break;
      case "Bihar":
      setDeliveryTime(3);
      break;
    case "Chhattisgarh":
      setDeliveryTime(3);
      break;
    case "Goa":
      setDeliveryTime(3);
      break;
    case "Gujarat":
      setDeliveryTime(3);
      break;
    case "Haryana":
      setDeliveryTime(8);
      break;
    case "Himachal Pradesh":
      setDeliveryTime(8);
      break;
    case "Jharkhand":
      setDeliveryTime(8);
      break;
    case "Karnataka":
      setDeliveryTime(3);
      break;
    case "Kerala":
      setDeliveryTime(3);
      break;
      case "Madhya Pradesh":
      setDeliveryTime(6);
      break;
    case "Maharashtra":
      setDeliveryTime(6);
      break;
    case "Manipur":
      setDeliveryTime(6);
      break;
    case "Meghalaya":
      setDeliveryTime(6);
      break;
    case "Mizoram":
      setDeliveryTime(5);
      break;
    case "Nagaland":
      setDeliveryTime(5);
      break;
    case "Odisha":
      setDeliveryTime(6);
      break;
    case "Punjab":
      setDeliveryTime(6);
      break;
    case "Rajasthan":
      setDeliveryTime(6);
      break;
    case "Sikkim":
      setDeliveryTime(6);
      break;
    case "Tamil Nadu":
      setDeliveryTime(2);
      break;
    case "Telangana":
      setDeliveryTime(3);
      break;
       case "Tripura":
      setDeliveryTime(3);
      break;
    case "Uttar Pradesh":
      setDeliveryTime(8);
      break;
    case "Uttarakhand":
      setDeliveryTime(8);
      break;
    case "West Bengal":
      setDeliveryTime(8);
      break;
    // Union Territories
    case "Andaman and Nicobar Islands":
      setDeliveryTime(6);
      break;
    case "Chandigarh":
      setDeliveryTime(8);
      break;
    case "Dadra and Nagar Haveli and Daman and Diu":
      setDeliveryTime(3);
      break;
    case "Delhi":
      setDeliveryTime(8);
      break;
    case "Jammu and Kashmir":
      setDeliveryTime(8);
      break;
    case "Ladakh":
      setDeliveryTime(8);
      break;
      case "Lakshadweep":
      setDeliveryTime(7);
      break;
    case "Puducherry":
      setDeliveryTime(3);
      break;
    default:
      setDeliveryTime(3); // Default delivery time if state not matched
      break;
  }
};

  const calculateDeliveryDate = (days) => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + (Number(days) + Number(processing_item)));

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

  const processing_item = _.get(data, "processing_time", "");
  let path = encodeURI(`${PUBLIC_URL}/product/${data.seo_url}`);
  let product_name = _.get(data, "name", "");
  let product_description = _.get(data, "short_description", "");

  const shareicon = [
    {
      id: 1,
      name: "Whatsapp",
      com: (
        <WhatsappShareButton title={`Printe - ${product_name}`} url={path}>
          <WhatsappIcon className="!size-[35px] rounded-full  !text-white p-1 bg-[#25d266]" />
        </WhatsappShareButton>
      ),
    },
    {
      id: 2,
      name: "Facebook",
      com: (
        <FacebookShareButton quote={`Printe - ${product_name}`} url={path}>
          <FacebookIcon className="!size-[35px] rounded-full !text-white p-1  bg-[#0965fd]" />
        </FacebookShareButton>
      ),
    },
    {
      id: 3,
      name: "Email",
      com: (
        <EmailShareButton subject={`Printe - ${product_name}`} body={path}>
          <MdOutlineMailOutline className="!size-[35px] rounded-full  !text-white p-1 bg-orange-500" />
        </EmailShareButton>
      ),
    },
    {
      id: 4,
      name: "LinkedIn",
      com: (
        <LinkedinShareButton
          title={`Printe - ${product_name}`}
          summary={product_description}
          source={path}
          url={path}
        >
          <LinkedinIcon className="!size-[35px] rounded-full" />
        </LinkedinShareButton>
      ),
    },
  ];

  // Format price with Indian Rupee symbol
  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!quantity) return "0.00";
    const unitPrice = DISCOUNT_HELPER(
      discountPercentage.percentage,
      Number(_.get(checkOutState, "product_price", 0))
    );
    return Number(unitPrice * quantity).toFixed(2);
  };

  // Calculate original price (before discount)
  const calculateOriginalPrice = () => {
    if (!quantity) return "0.00";
    return Number(
      Number(_.get(checkOutState, "product_price", 0)) * quantity
    ).toFixed(2);
  };

  // Calculate savings
  const calculateSavings = () => {
    if (!quantity) return "0.00";
    const original = calculateOriginalPrice();
    const discounted = calculateTotalPrice();
    return (original - discounted).toFixed(2);
  };

  

  // Generate quantity options based on backend data
  const generateQuantityOptions = () => {
    if (quantityType === "textbox") {
      // For textbox type, create options using dropdown_gap
      const options = [];
      for (let i = dropdownGap; i <= maxQuantity; i += dropdownGap) {
        options.push({ value: i, label: i.toString() });
      }
      return options;
    } else {
      // For dropdown type, use the quantity_discount_splitup from backend
      return quantityDiscounts.map((item) => ({
        value: Number(item.quantity),
        label: `${item.quantity}`,
        discount: Number(item.discount),
        uuid: item.uniqe_id,
      }));
    }
  };

  const quantityOptions = generateQuantityOptions();

  const handleQuantitySelect = (selectedQuantity) => {
    if (quantityType === "textbox") {
      // For textbox type, find the appropriate discount
      const selectedDiscount = quantityDiscounts
        .filter((item) => Number(item.quantity) <= selectedQuantity)
        .sort((a, b) => Number(b.quantity) - Number(a.quantity))[0];

      setQuantity(selectedQuantity);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: selectedQuantity,
      }));

      if (selectedDiscount) {
        setDiscountPercentage({
          uuid: selectedDiscount.uniqe_id,
          percentage: Number(selectedDiscount.discount),
        });
      } else {
        setDiscountPercentage({ uuid: "", percentage: 0 });
      }
    } else {
      // For dropdown type, find the exact match
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
          percentage: Number(selectedDiscount.discount),
        });
      }
    }
    setQuantityDropdownVisible(false);
  };

  // Custom dropdown renderer for quantity selection
  const quantityDropdownRender = (menu) => (
    <div
      style={{ padding: "12px", minWidth: "350px" }}
      onMouseLeave={() => setQuantityDropdownVisible(false)}
    >
      <div>
        <Text strong>Quantity Options</Text>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {quantityOptions.map((item) => {
          const unitPrice = DISCOUNT_HELPER(
            quantityType === "dropdown"
              ? item.discount
              : discountPercentage.percentage,
            Number(_.get(checkOutState, "product_price", 0))
          );
          const totalPrice = unitPrice * item.value;

          return (
            <div
              key={item.value}
              className={`flex justify-between items-center p-3 cursor-pointer hover:bg-blue-50 ${
                quantity === item.value ? "bg-blue-100" : ""
              }`}
              onClick={() => handleQuantitySelect(item.value)}
            >
              <div className="flex-1">
                <Text
                  className={
                    quantity === item.value ? "font-semibold text-blue-600" : ""
                  }
                >
                  {item.value}
                </Text>
                {quantityType === "dropdown" && (
                  <div>
                    <Text type="success" className="text-sm">
                      {item.discount == 0 ? (
                        <></>
                      ) : (
                        <>{item.discount}% discount</>
                      )}
                    </Text>
                  </div>
                )}
              </div>
              <div className="text-right">
                <Text
                  className={
                    quantity === item.value ? "font-semibold text-blue-600" : ""
                  }
                >
                  {formatPrice(totalPrice)}
                </Text>
                <div>
                  <Text className="text-sm text-gray-500">
                    {formatPrice(unitPrice)}/unit
                  </Text>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Spin
      spinning={loading}
      indicator={
        <IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />
      }
    >
      <div className="font-primary w-full space-y-2">
        {/* Product Header */}
        <div className="space-y-1 flex justify-between">
          <Title level={1} className="!text-gray-900 !font-bold !mb-2">
            {data.name}
          </Title>

          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
            className="bg-green-100 border border-green-300 rounded-lg p-3 shadow-lg text-right"
          >
            <Title level={4} className="!m-0 !text-green-600">
              {quantity
                ? formatPrice(
                    DISCOUNT_HELPER(
                      discountPercentage.percentage,
                      Number(_.get(checkOutState, "product_price", 0))
                    )
                  )
                : "Select quantity"}
            </Title>
          </motion.div>
        </div>

        {/* Product Description */}
        <div>
          <h1 className="text-xl font-semibold">
            {_.get(data, "product_description_tittle", "")}
          </h1>
          <ul className="grid grid-cols-1 my-2 gap-2 text-md list-disc pl-5">
            <li>{_.get(data, "Point_one", "")}</li>
            <li>{_.get(data, "Point_two", "")}</li>
            <li>{_.get(data, "Point_three", "")}</li>
            <li>
              {_.get(data, "Point_four", "")} <a href="">read more</a>
            </li>
          </ul>
        </div>

        {/* Quantity and Variants Section */}
        <div className="w-full">
          <Row
            gutter={[16, 16]}
            align="bottom"
            className="justify-between w-full "
          >
            {/* Quantity Selection */}
            <Col xs={24} md={product_type !== "Single Product" ? 8 : 24}>
              <div className="flex flex-col">
                <Text strong className="block mb-2">
                  Quantity:
                </Text>
                <Select
                  value={quantity}
                  onChange={handleQuantitySelect}
                  options={quantityOptions}
                  className="w-full"
                  placeholder="Select your quantity"
                  optionLabelProp="label"
                  dropdownRender={quantityDropdownRender}
                  open={quantityDropdownVisible}
                  onDropdownVisibleChange={(visible) =>
                    setQuantityDropdownVisible(visible)
                  }
                  dropdownStyle={{ minWidth: "350px" }}
                />
                {quantityType === "textbox" && quantity && (
                  <Text type="secondary" className="text-xs mt-1">
                    Discount: {discountPercentage.percentage}%
                  </Text>
                )}
              </div>
            </Col>

            {/* Variants Selection */}
            {product_type !== "Single Product" &&
              !_.isEmpty(currentPriceSplitup) && (
                <>
                  {_.get(data, "variants", []).map((variant, index) => (
                    <Col xs={24} md={8} key={index}>
                      <div className="flex flex-col">
                        <Text strong className="block mb-2">
                          {variant.variant_name}:
                        </Text>
                        {variant.variant_type !== "image_variant" ? (
                          <Select
                            disabled={variant.options.length === 1}
                            className="w-full"
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
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {_.get(variant, "options", []).map(
                              (option, optionIndex) => (
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
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </Col>
                  ))}
                </>
              )}

            {/* Individual Box Checkbox */}
            <Col
              xs={24}
              md={product_type !== "Single Product" ? 8 : 24}
              className="flex items-center justify-start"
            >
              <Checkbox
                checked={individualBox}
                onChange={(e) => setIndividualBox(e.target.checked)}
                className="py-2"
              >
                Individual Box for 100 Cards
              </Checkbox>
            </Col>
          </Row>
        </div>

        {/* Total Price Section */}
        <Card className="bg-blue-50 rounded-lg border-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text strong className="text-gray-800">
                Total Price:
              </Text>
              <div className="text-right flex">
                {quantity && calculateSavings() > 0 && (
                  <Text delete className="text-md text-gray-500 mr-2">
                    {formatPrice(calculateOriginalPrice())}
                  </Text>
                )}
                <Title level={4} className="!m-0 !text-green-600">
                  {quantity
                    ? formatPrice(calculateTotalPrice())
                    : "Select quantity"}
                </Title>
              </div>
            </div>

            {quantity && calculateSavings() > 0 && (
              <Alert
                message={`You save ${formatPrice(calculateSavings())} (${
                  discountPercentage.percentage
                }% discount)`}
                type="success"
                showIcon
                className="!py-2"
              />
            )}

            {quantity && (
              <div className="text-sm text-gray-600">
                <Text>
                  Inclusive of all taxes for <Text strong>{quantity}</Text> Qty
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
                </Text>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full justify-between mt-3">
            <div className="flex items-center gap-2 ">
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
              <span className="font-bold">
                {processing_item} days 
              </span>
            </div>

            <Modal
              title="Processing Time Information"
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              footer={null}
              centered
              width={700}
            >
              <div className="max-h-[400px] overflow-y-auto text-gray-700">
                <Paragraph>
                  The printing time determines how long it takes us to complete
                  your order. You may pick your preferred production time from
                  the list.
                </Paragraph>
                <Paragraph>
                  While we strive to complete the order within the committed
                  timeframes, the timings also depend on the following factors:
                </Paragraph>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>
                    We will provide the proof file for approval before printing.
                    Faster approval will guarantee speedy processing.
                  </li>
                  <li>
                    We need 300 dpi CMYK resolution artwork uploaded along the
                    order. Preferred file types include CDR, AI, PSD, and
                    High-Res Images with text and components converted to vector
                    where needed.
                  </li>
                  <li>
                    Production time does not include the shipping time. Business
                    days do not include Sundays and National Holidays, and
                    orders made after 12 p.m. are counted from the next Business
                    Day.
                  </li>
                </ul>
                <Paragraph className="mt-4">
                  In case you still have any questions, let's connect? Contact
                  us on WhatsApp, call us at +91-7373610000, or email
                  business@printe.in.
                </Paragraph>
              </div>
            </Modal>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5 },
              },
            }}
            className="mt-3"
          >
            <Text strong className="block mb-2 text-gray-700">
              Estimated Delivery
            </Text>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="mb-2 flex rounded-lg relative overflow-hidden"
            >
              <Input
                className="h-10 rounded-lg w-full"
                value={pincode}
                onChange={handlePincodeChange}
                placeholder="Enter Pincode"
                maxLength={6}
                suffix={
                  <div className="flex items-center">
                    {isValidatingPincode && (
                      <Spin size="small" className="mr-2" />
                    )}
                    {isPincodeValid === true && (
                      <CheckCircleOutlined className="text-green-500 mr-2" />
                    )}
                    {isPincodeValid === false && (
                      <CloseCircleOutlined className="text-red-500 mr-2" />
                    )}
                  </div>
                }
              />
              <button
                onClick={getPincodeByGPSWithPermissionCheck}
                disabled={isGettingLocation}
                className="absolute right-0 top-0 text-black font-semibold p-3 bg-yellow-300 hover:bg-yellow-500 h-full disabled:bg-gray-400 flex items-center justify-center min-w-[100px]"
              >
                {isGettingLocation ? (
                  <Spin size="small" className="text-white" />
                ) : (
                  <span className="flex items-center gap-2">
                    <GPS_ICON className="mr-1" />
                    get pincode
                  </span>
                )}
              </button>
            </motion.div>

            {pincode && isPincodeValid !== null && (
              <Alert
                message={
                  isPincodeValid
                    ? "We deliver to this pincode"
                    : "Sorry, we don't deliver to this pincode yet"
                }
                type={isPincodeValid ? "success" : "error"}
                showIcon
                className="mb-2"
              />
            )}

            <motion.div
              className={`text-gray-700 flex gap-2 items-center`}
              whileHover={{ x: 5 }}
            >
              <IconHelper.DELIVERY_TRUCK_ICON className="text-blue-500" />
              Standard Delivery by
              <Text strong>{calculateDeliveryDate(deliveryTime)}</Text>
              <Divider type="vertical" />
              <Text type="success" strong>
                ₹ 75
              </Text>
            </motion.div>
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
                icon={<div className="text-lg text-gray-400">+</div>}
              />

              {checkOutState.product_design_file && (
                <div className="mt-2 flex items-center justify-between">
                  <Checkbox
                    checked={checked}
                    onChange={(e) => {
                      setChecked(e.target.checked);
                      setError("");
                    }}
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
                  {error && (
                    <Text type="danger" className="block mt-1">
                      {error}
                    </Text>
                  )}
                </div>
              )}
            </>
          ) : (
            <Alert
              message="Our Designing Team contact will within 24 Hours After Booking"
              type="info"
              showIcon
            />
          )}

          {/* Design Preview Modal */}
          <Modal
            title="Design Preview"
            open={designPreviewVisible}
            onCancel={() => setDesignPreviewVisible(false)}
            footer={[
              <Button
                key="close"
                onClick={() => setDesignPreviewVisible(false)}
              >
                Close
              </Button>,
            ]}
            width={700}
          >
            <div className="flex justify-center">
              <Image
                src={checkOutState.product_design_file}
                alt="Design Preview"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </Modal>
        </div>

        {/* Add to Cart Section */}
        <div className="w-full">
          {isGettingVariantPrice ? (
            <div className="center_div py-6">
              <Spin size="large" />
            </div>
          ) : (
            <div className="text-gray-600">
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
            </div>
          )}
        </div>

        <Divider className="!my-4" />

        {/* Product Meta Information */}
        <div className="space-y-2">
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

// In your IconHelper.js or similar file
export const GPS_ICON = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
  </svg>
);
