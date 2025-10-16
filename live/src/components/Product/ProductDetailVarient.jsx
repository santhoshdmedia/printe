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
import { addToShoppingCart, getVariantPrice } from "../../helper/api_helper";
import Swal from "sweetalert2";
import { ADD_TO_CART } from "../../redux/slices/cart.slice";
import {
  DISCOUNT_HELPER,
  GST_DISCOUNT_HELPER,
} from "../../helper/form_validation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCartOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isGettingVariantPrice } = useSelector((state) => state.publicSlice);

  // Product data constants
  const productType = _.get(data, "type", "Variable Product");
  const availableVariants = data.variants || [];
  const quantityDiscounts = _.get(data, "quantity_discount_splitup", []);
  const dropdownGap = _.get(data, "dropdown_gap", 100);
  const quantityType = _.get(data, "quantity_type", "dropdown");
  const maxQuantity = _.get(data, "max_quantity", 10000);
  const unit = _.get(data, "unit", "Box");
  const productionTime = _.get(data, "Production_time", "");
  const arrangeTime = _.get(data, "Stock_Arrangement_time", "");
  const processingTime = Number(productionTime) + Number(arrangeTime);
  const gst = _.get(data, "GST", 0);

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
  const [needDesignUpload, setNeedDesignUpload] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stock, setStockCount] = useState(0);
  const [designPreviewVisible, setDesignPreviewVisible] = useState(false);
  const [quantityDropdownVisible, setQuantityDropdownVisible] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Checkout state
  const [checkOutState, setCheckOutState] = useState({
    product_image: _.get(data, "images[0].path", _.get(data, "images[0]", "")),
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
  });

  // Helper function to get role-specific quantity
  const getRoleSpecificQuantity = useCallback((item) => {
    if (user?.role === "Dealer") {
      return Number(item.Dealer_quantity || item.quantity || 0);
    } else if (user?.role === "Corporate") {
      return Number(item.Corporate_quantity || item.quantity || 0);
    } else {
      return Number(item.Customer_quantity || item.quantity || 0);
    }
  }, [user?.role]);

  // Helper function to get role-specific discount
  const getRoleSpecificDiscount = useCallback((item) => {
    if (user?.role === "Dealer") {
      return Number(item.Dealer_discount || item.discount || 0);
    } else if (user?.role === "Corporate") {
      return Number(item.Corporate_discount || item.discount || 0);
    } else {
      return Number(item.Customer_discount || item.discount || 0);
    }
  }, [user?.role]);

  // Helper function to get role-specific free delivery
  const getRoleSpecificFreeDelivery = useCallback((item) => {
    if (user?.role === "Dealer") {
      return item.free_delivery_dealer || item.Free_Deliverey || false;
    } else if (user?.role === "Corporate") {
      return item.free_delivery_corporate || item.Free_Deliverey || false;
    } else {
      return item.free_delivery_customer || item.Free_Deliverey || false;
    }
  }, [user?.role]);

  // Helper function to get role-specific recommended stats
  const getRoleSpecificStats = useCallback((item) => {
    if (user?.role === "Dealer") {
      return item.recommended_stats_dealer || item.recommended_stats || "No comments";
    } else if (user?.role === "Corporate") {
      return item.recommended_stats_corporate || item.recommended_stats || "No comments";
    } else {
      return item.recommended_stats_customer || item.recommended_stats || "No comments";
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

      // Set price based on user role
      let price = 0;
      if (user?.role === "Dealer") {
        price = _.get(
          variantData,
          "Deler_product_price",
          _.get(variantData, "price", 0)
        );
      } else if (user?.role === "Corporate") {
        price = _.get(
          variantData,
          "corporate_product_price",
          _.get(variantData, "price", 0)
        );
      } else {
        price = _.get(
          variantData,
          "customer_product_price",
          _.get(variantData, "price", 0)
        );
      }

      setCheckOutState((prevState) => ({
        ...prevState,
        product_price: price,
        product_variants: variantData,
      }));
      setStockCount(
        _.get(variantData, "stock_count", _.get(variantData, "stock", 0))
      );
    },
    [user?.role]
  );

  // Initialize variants and prices
  useEffect(() => {
    if (productType === "Variable Product" && data.variants_price?.length > 0) {
      // Set initial selected variants
      const initialSelectedVariants = {};
      availableVariants.forEach((variant) => {
        if (variant.options?.length > 0) {
          initialSelectedVariants[variant.variant_name] =
            variant.options[0].value;
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
    if (quantityType !== "textbox" && quantityDiscounts.length > 0) {
      // Get the first available quantity for the current user role
      const firstAvailableItem = quantityDiscounts.find(item => 
        getRoleSpecificQuantity(item) > 0
      ) || quantityDiscounts[0];

      if (firstAvailableItem) {
        const initialQuantity = getRoleSpecificQuantity(firstAvailableItem);
        const initialDiscount = getRoleSpecificDiscount(firstAvailableItem);
        const initialFreeDelivery = getRoleSpecificFreeDelivery(firstAvailableItem);

        setQuantity(initialQuantity);
        setDiscountPercentage({
          uuid: _.get(firstAvailableItem, "uniqe_id", ""),
          percentage: initialDiscount,
        });
        setFreeDelivery(initialFreeDelivery);
        setCheckOutState((prev) => ({
          ...prev,
          product_quantity: initialQuantity,
        }));
      }
    } else {
      setDiscountPercentage({ uuid: "", percentage: 0 });
      setFreeDelivery(false);
      setQuantity(null);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: 0,
      }));
    }
  }, [quantityType, quantityDiscounts, user?.role, maxQuantity, getRoleSpecificQuantity, getRoleSpecificDiscount, getRoleSpecificFreeDelivery]);

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
    [
      selectedVariants,
      findMatchingVariantPrice,
      updateVariantData,
      onVariantChange,
    ]
  );

  // Memoized calculations
  const unitPrice = useMemo(
    () =>
      DISCOUNT_HELPER(
        discountPercentage.percentage,
        Number(_.get(checkOutState, "product_price", 0))
      ),
    [discountPercentage.percentage, checkOutState.product_price]
  );

  const totalPrice = useMemo(
    () => (quantity ? Number(unitPrice * quantity).toFixed(2) : 0),
    [unitPrice, quantity]
  );

  const mrpTotalPrice = useMemo(
    () =>
      quantity ? Number(checkOutState.product_price * quantity).toFixed(2) : 0,
    [checkOutState.product_price, quantity]
  );

  const savings = useMemo(
    () => (quantity ? (mrpTotalPrice - totalPrice).toFixed(2) : 0),
    [mrpTotalPrice, totalPrice, quantity]
  );

  const mrpSavings = useMemo(() => {
    const mrpPrice = Number(_.get(currentPriceSplitup, "MRP_price", 0));
    const currentPrice = Number(_.get(checkOutState, "product_price", 0));
    const savingsPerUnit = mrpPrice - currentPrice;
    const allSavings = savingsPerUnit * (quantity || 0);
    return Math.max(0, allSavings).toFixed(2);
  }, [currentPriceSplitup, checkOutState.product_price, quantity]);

  const totalSavings = useMemo(
    () => (Number(savings) + Number(mrpSavings)).toFixed(2),
    [savings, mrpSavings]
  );

  // Render variant selector based on variant type
  const renderVariantSelector = useCallback(
    (variant) => {
      const { variant_name, variant_type, options } = variant;

      if (!options || options.length === 0) return null;

      // For image variants (like colors)
      if (variant_type === "image_variant") {
        return (
          <div className="w-full space-y-3">
            <Text strong className="block text-gray-800">
              {variant_name}:
            </Text>
            <div className="flex flex-wrap gap-3">
              {options.map((option, index) => (
                <Tooltip key={index} title={option.value}>
                  <div
                    className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-1 ${
                      selectedVariants[variant_name] === option.value
                        ? "ring-2 ring-blue-500 rounded-lg"
                        : "border border-gray-200 rounded-lg hover:border-blue-300"
                    }`}
                    onClick={() =>
                      handleVariantChange(variant_name, option.value)
                    }
                  >
                    <div
                      className="w-16 h-16 rounded-md overflow-hidden bg-gray-100"
                      style={{
                        backgroundImage: option.image_names?.[0]
                          ? `url(${option.image_names[0].path})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {!option.image_names?.[0] && (
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

      // For text variants (like sizes)
      if (variant_type === "text_box_variant") {
        return (
          <div className="w-full space-y-3">
            <Text strong className="block text-gray-800">
              {variant_name}:
            </Text>
            <div className="flex flex-wrap gap-2">
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 border rounded-lg transition-all duration-200 font-medium ${
                    selectedVariants[variant_name] === option.value
                      ? "bg-blue-500 text-white border-blue-500 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                  onClick={() =>
                    handleVariantChange(variant_name, option.value)
                  }
                >
                  {option.value}
                </button>
              ))}
            </div>
          </div>
        );
      }

      // Default dropdown for other variants
      return (
        <div className="w-full space-y-3">
          <Text strong className="block text-gray-800">
            {variant_name}:
          </Text>
          <Select
            value={selectedVariants[variant_name]}
            onChange={(value) => handleVariantChange(variant_name, value)}
            className="w-full"
            placeholder={`Select ${variant_name}`}
            size="large"
          >
            {options.map((option, index) => (
              <Select.Option key={index} value={option.value}>
                <div className="flex items-center justify-between">
                  <span className="capitalize">{option.value}</span>
                  {option.additional_price > 0 && (
                    <span className="text-green-600 text-sm">
                      +₹{option.additional_price}
                    </span>
                  )}
                </div>
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
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.pageYOffset;
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

  const handleQuantityDetails = useCallback(
    (stock, quantity) => {
      try {
        return _.get(data, "stocks_status", "") === "Don't Track Stocks"
          ? true
          : Number(stock) >= Number(quantity);
      } catch (err) {
        return false;
      }
    },
    [data]
  );

  // Format price functions
  const formatPrice = useCallback((price) => {
    return `₹${parseFloat(price || 0).toFixed(2)}`;
  }, []);

  const formatMRPPrice = useCallback((price) => {
    return `MRP ₹${parseFloat(price || 0).toFixed(2)}`;
  }, []);

  // Generate quantity options based on user role
  const quantityOptions = useMemo(() => {
    if (quantityType === "textbox") {
      const options = [];
      for (let i = dropdownGap; i <= maxQuantity; i += dropdownGap) {
        options.push({ value: i, label: i.toString() });
      }
      return options;
    } else {
      // Filter and map quantity discounts based on user role
      return quantityDiscounts
        .filter(item => getRoleSpecificQuantity(item) > 0) // Only show items with valid quantity for this role
        .map((item) => ({
          value: getRoleSpecificQuantity(item),
          label: `${getRoleSpecificQuantity(item)}`,
          Free_Delivery: getRoleSpecificFreeDelivery(item),
          discount: getRoleSpecificDiscount(item),
          uuid: item.uniqe_id,
          stats: getRoleSpecificStats(item),
        }))
        .sort((a, b) => a.value - b.value); // Sort by quantity ascending
    }
  }, [quantityType, dropdownGap, maxQuantity, quantityDiscounts, user?.role, getRoleSpecificQuantity, getRoleSpecificDiscount, getRoleSpecificFreeDelivery, getRoleSpecificStats]);

  const handleQuantitySelect = useCallback(
    (selectedQuantity) => {
      if (quantityType === "textbox") {
        // For textbox type, find the best matching discount based on quantity
        const selectedDiscount = quantityDiscounts
          .filter((item) => getRoleSpecificQuantity(item) <= selectedQuantity)
          .sort((a, b) => getRoleSpecificQuantity(b) - getRoleSpecificQuantity(a))[0];

        setQuantity(selectedQuantity);
        setCheckOutState((prev) => ({
          ...prev,
          product_quantity: selectedQuantity,
        }));

        if (selectedDiscount) {
          setDiscountPercentage({
            uuid: selectedDiscount.uniqe_id,
            percentage: getRoleSpecificDiscount(selectedDiscount),
          });
          setFreeDelivery(getRoleSpecificFreeDelivery(selectedDiscount));
        } else {
          setDiscountPercentage({ uuid: "", percentage: 0 });
          setFreeDelivery(false);
        }
      } else {
        // For dropdown type, find the exact matching item
        const selectedDiscount = quantityDiscounts.find(
          (item) => getRoleSpecificQuantity(item) === selectedQuantity
        );

        setQuantity(selectedQuantity);
        setCheckOutState((prev) => ({
          ...prev,
          product_quantity: selectedQuantity,
        }));

        if (selectedDiscount) {
          setDiscountPercentage({
            uuid: selectedDiscount.uniqe_id,
            percentage: getRoleSpecificDiscount(selectedDiscount),
          });
          setFreeDelivery(getRoleSpecificFreeDelivery(selectedDiscount));
        }
      }
      setQuantityDropdownVisible(false);
    },
    [quantityType, quantityDiscounts, user?.role, getRoleSpecificQuantity, getRoleSpecificDiscount, getRoleSpecificFreeDelivery]
  );

  // Quantity dropdown render
  const quantityDropdownRender = useCallback(
    (menu) => (
      <div
        className="p-2 rounded-lg shadow-xl bg-white"
        onMouseLeave={() => setQuantityDropdownVisible(false)}
      >
        <div className="overflow-y-auto max-h-80 space-y-3">
          {quantityOptions.map((item) => {
            const itemUnitPrice = DISCOUNT_HELPER(
              item.discount,
              Number(checkOutState.product_price)
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

                  <div className="flex gap-2">
                    {item.discount > 0 && (
                      <span className="text-green-600 text-sm font-medium inline-flex items-center mt-1">
                        <CheckCircleOutlined className="mr-1" />
                        {item.discount}% discount
                      </span>
                    )}
                    {item.Free_Delivery && (
                      <span className="text-blue-600 text-sm font-medium inline-flex items-center mt-1">
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
      </div>
    ),
    [
      quantityOptions,
      checkOutState.product_price,
      quantity,
      unit,
      handleQuantitySelect,
      formatPrice,
    ]
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

      const updatedCheckoutState = {
        ...checkOutState,
        sgst: Number(gst / 2),
        cgst: Number(gst / 2),
        MRP_savings: mrpSavings,
        TotalSavings: totalSavings,
        FreeDelivery: freeDelivery,
        final_total: Number(
          checkOutState.product_price * checkOutState.product_quantity
        ),
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
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  // Custom Popover component
  const CustomPopover = ({ open, onClose, className, children }) => {
    if (!open) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`absolute top-full right-0 mt-2 ${className}`}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <Spin
      spinning={loading}
      indicator={
        <IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />
      }
    >
      <div className="font-primary w-full space-y-6 relative">
        {/* Product Header */}
        <div className="space-y-1 flex md:flex-row flex-col justify-between items-end">
          <div className="flex-1">
            <h1 className="text-gray-900 font-bold text-xl md:text-2xl lg:text-3xl leading-tight">
              {data.name}
            </h1>
          </div>
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
        <div className="">
          <h2 className="!text-md font-semibold w-[70%]">
            {_.get(data, "product_description_tittle", "")}
          </h2>
          <ul className="grid grid-cols-1 my-2 gap-2 text-md list-disc pl-5 ">
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

        <div className="p-4 bg-gray-50 rounded-lg">
          {/* Dynamic Variants Section */}
          {availableVariants.length > 0 &&
            availableVariants.some(
              (v) => v.options && v.options.length > 0
            ) && (
              <div className="w-full space-y-6 ">
                {availableVariants.map((variant, index) => (
                  <div key={index}>{renderVariantSelector(variant)}</div>
                ))}
              </div>
            )}

          {/* Selected Variants Summary */}
          {Object.keys(selectedVariants).length > 0 && (
            <Card size="small" className="!bg-transparent border-none">
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
        </div>

        {/* Quantity Section */}
        <div className="space-y-3">
          <Text strong className="block text-gray-800">
            Quantity:
          </Text>
          <Select
            value={quantity}
            onChange={handleQuantitySelect}
            options={quantityOptions}
            className="w-full max-w-md"
            placeholder="Select quantity"
            dropdownRender={quantityDropdownRender}
            open={quantityDropdownVisible}
            onDropdownVisibleChange={setQuantityDropdownVisible}
            size="large"
          />
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
                 {formatPrice(_.get(currentPriceSplitup, "MRP_price", 0))}
                </Text>
                <Title level={4} className="!m-0 !text-green-600">
                  {quantity
                    ? formatPrice(totalPrice)
                    : formatMRPPrice(totalPrice)}
                </Title>
              </div>
            </div>

            {/* Savings Alerts */}
            <div className="space-y-2">
              {mrpSavings > 0 && (
                <Alert
                  message={
                    <div>
                      <div>You saved {formatPrice(mrpSavings)} </div>
                      {quantity && savings > 0 && (
                        <div className="mt-1">
                          <div>
                            Additionally you saved {formatPrice(savings)} (
                            {discountPercentage.percentage}% quantity discount)
                          </div>
                          <div className="font-bold text-lg mt-1">
                            Total Savings: {formatPrice(totalSavings)}
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
                  (<Text strong>{formatPrice(unitPrice)}</Text>/ piece)
                </h1>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full justify-between mt-4">
            <div className="flex items-center gap-2">
              <Text strong className="text-gray-700">
                Production Time:
              </Text>
              <span className="font-bold">{processingTime} days</span>
            </div>
          </div>
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
                onClick={handleBuy}
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
        </div>
      </div>
    </Spin>
  );
};

export default ProductDetailVarient;