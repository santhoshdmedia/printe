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
  Form,
  message,
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
import toast from "react-hot-toast";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";

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
      checkOutState.sgst = Number((checkOutState?.product_price * 4) / 100);
      checkOutState.cgst = Number((checkOutState?.product_price * 4) / 100);
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
    return (mrpPrice - currentPrice).toFixed(2);
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
        discount: Number(item.discount),
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
      className="p-2 rounded-lg shadow-xl bg-white"
      onMouseLeave={() => setQuantityDropdownVisible(false)}
    >
      <div className="overflow-y-auto max-h-80 space-y-3">
        {quantityOptions.map((item) => {
          const unitPrice = DISCOUNT_HELPER(
            quantityType === "dropdown" ? item.discount : discountPercentage.percentage,
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
                  <span className={`text-base font-medium ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                    {item.value} {unit}
                  </span>
                  {item.stats && item.stats !== "No comments" && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                      {item.stats}
                    </span>
                  )}
                </div>

                {quantityType === "dropdown" && item.discount > 0 && (
                  <span className="text-green-600 text-sm font-medium inline-flex items-center mt-1">
                    <CheckCircleOutlined className="mr-1" />
                    {item.discount}% discount
                  </span>
                )}
              </div>

              <div className="text-right">
                <p className={`font-semibold ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
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
      console.log('Bulk order submitted:', values);
      message.success('Bulk order inquiry submitted successfully!');
      setShowBulkOrderForm(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to submit bulk order inquiry');
    }
  };

  const PincodeDeliveryCalculator = ({ Production }) => {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Enter pincode"
            maxLength={6}
            className="flex-1"
          />
          <Button type="primary">Check</Button>
        </div>
        <Text type="secondary" className="text-sm">
          Enter pincode to check delivery date
        </Text>
      </div>
    );
  };

  return (
    <Spin spinning={loading} indicator={<IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />}>
      <div className="font-primary w-full space-y-2 relative">
        {/* Product Header */}
        <div className="space-y-1 flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-gray-900 font-bold mb-2 text-3xl md:text-4xl lg:text-5xl">
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

            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl z-10 p-2 border border-gray-200"
              >
                <p className="text-xs text-gray-500 font-semibold p-2">Share via</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => shareProduct("facebook")} className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 transition-all">
                    <FacebookIcon size={35} round />
                    <span className="text-xs mt-1">Facebook</span>
                  </button>
                  <button onClick={() => shareProduct("whatsapp")} className="flex flex-col items-center justify-center p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-500 transition-all">
                    <WhatsappIcon size={35} round />
                    <span className="text-xs mt-1">WhatsApp</span>
                  </button>
                </div>
              </motion.div>
            )}

            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-md px-3 py-2 shadow-md text-right h-fit w-fit absolute top-16 right-0"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-white/70 text-xs line-through">
                  ₹{_.get(data, "MRP_price", 0) || Number(_.get(checkOutState, "product_price", 0)) + 50}
                </span>
                <h3 className="text-white text-base font-semibold">
                  {quantity ? formatPrice(Number(_.get(checkOutState, "product_price", 0))) : "Select Qty"}
                </h3>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Description */}
        <div>
          <h2 className="text-xl font-semibold">{_.get(data, "product_description_tittle", "")}</h2>
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

        {/* Quantity and Variants Section */}
        <div className="w-full">
          <Row gutter={[16, 16]} align="bottom" className="w-full">
            <Col xs={24} md={product_type !== "Stand Alone Product" ? 8 : 12}>
              <div className="flex flex-col">
                <Text strong className="block mb-2">Quantity:</Text>
                <Select
                  value={quantity}
                  onChange={handleQuantitySelect}
                  options={quantityOptions}
                  className="w-full"
                  placeholder="Select quantity"
                  dropdownRender={quantityDropdownRender}
                  open={quantityDropdownVisible}
                  onDropdownVisibleChange={setQuantityDropdownVisible}
                />
              </div>
            </Col>

            {product_type !== "Stand Alone Product" && !_.isEmpty(currentPriceSplitup) && (
              <>
                {_.get(data, "variants", []).map((variant, index) => (
                  <Col xs={24} md={8} key={index}>
                    <div className="flex flex-col">
                      <Text strong className="block mb-2">{variant.variant_name}:</Text>
                      {variant.variant_type !== "image_variant" ? (
                        <Select
                          defaultValue={_.get(currentPriceSplitup, `[${variant.variant_name}]`, "")}
                          options={variant.options.map((opt) => ({ value: opt.value, label: opt.value }))}
                          onChange={(value) => handleOnChangeSelectOption(value, index)}
                          placeholder={`Select ${variant.variant_name}`}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {variant.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex flex-col items-center">
                              <div
                                onClick={() => handleOnChangeSelectOption(option.value, index)}
                                className={`cursor-pointer border-2 p-1 rounded transition duration-200 ${
                                  _.get(currentPriceSplitup, `[${variant.variant_name}]`, "") === option.value
                                    ? "border-blue-500 shadow-md"
                                    : "border-gray-300 hover:border-blue-400"
                                }`}
                                style={{ width: "50px", height: "50px" }}
                              >
                                <img src={option.image_name} className="w-full h-full object-contain" alt={option.value} />
                              </div>
                              <Text className="text-xs mt-1 text-center">{option.value}</Text>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Col>
                ))}
              </>
            )}

            {_.get(data, "name", "") === "Matt Finish" && (
              <Col xs={24} md={24}>
                <Checkbox checked={individualBox} onChange={(e) => setIndividualBox(e.target.checked)}>
                  Individual Box for 100 Cards
                </Checkbox>
              </Col>
            )}
          </Row>
        </div>

        {/* Total Price Section */}
        <Card className="bg-blue-50 rounded-lg border-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Text strong className="text-gray-800">Total Price:</Text>
              <div className="text-right flex items-baseline">
                <Text delete className="text-md text-gray-500 mr-2">
                  MRP {formatPrice(_.get(data, "MRP_price", 0))}
                </Text>
                <Title level={4} className="!m-0 !text-green-600">
                  {quantity ? formatPrice(calculateTotalPrice()) : formatMRPPrice(calculateTotalPrice())}
                </Title>
              </div>
            </div>

            {/* Savings Alerts */}
            <div className="space-y-2">
              {calculateMRPSavings() > 0 && (
                <Alert
                  message={`You saved ${formatPrice(calculateMRPSavings())} on MRP`}
                  type="success"
                  showIcon
                  className="!py-2"
                />
              )}

              {quantity && calculateSavings() > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    message={`Congratulations! Additionally you saved ${formatPrice(calculateSavings())} (${discountPercentage.percentage}% quantity discount)`}
                    type="info"
                    showIcon
                    className="!py-2"
                  />
                </motion.div>
              )}
            </div>

            {quantity && (
              <div className="text-sm text-gray-600">
                <Text>
                  Exclusive of all taxes for <Text strong>{quantity}</Text> Qty (
                  <Text strong>
                    {formatPrice(DISCOUNT_HELPER(discountPercentage.percentage, Number(_.get(checkOutState, "product_price", 0))))}
                  </Text>
                  / piece)
                </Text>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full justify-between mt-4">
            <div className="flex items-center gap-2">
              <Text strong className="text-gray-700">Production Time:</Text>
              <Tooltip title="Learn more about processing time">
                <Button type="text" icon={<IconHelper.QUESTION_MARK />} size="small" onClick={() => setIsModalOpen(true)} />
              </Tooltip>
              <span className="font-bold">{processing_item} days</span>
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
                <Paragraph>The printing time determines how long it takes us to complete your order.</Paragraph>
                <Paragraph>While we strive to complete the order within the committed timeframes, the timings also depend on the following factors:</Paragraph>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>We will provide the proof file for approval before printing. Faster approval will guarantee speedy processing.</li>
                  <li>We need 300 dpi CMYK resolution artwork uploaded along the order.</li>
                  <li>Production time does not include the shipping time.</li>
                </ul>
              </div>
            </Modal>
          </div>

          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} className="mt-4">
            <Text strong className="block mb-2 text-gray-700">Estimated Delivery</Text>
            <PincodeDeliveryCalculator Production={processing_item} />
          </motion.div>
        </Card>

        {/* File Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Text strong className="text-gray-800">Upload Your Design</Text>
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
          </div>

          {needDesignUpload ? (
            <>
              <UploadFileButton
                handleUploadImage={handleUploadImage}
                buttonText="Drag & Drop Files Here or Browse Files"
                className="w-full border-dotted rounded-lg flex flex-col items-center justify-center transition-colors"
              />

              {checkOutState.product_design_file && (
                <div className="mt-2 flex items-center justify-between">
                  <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
                    I confirm this design
                  </Checkbox>
                  <Button type="link" icon={<EyeOutlined />} onClick={() => setDesignPreviewVisible(true)}>
                    View Design
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Alert message="Our Designing Team will contact you within 24 Hours After Booking" type="info" showIcon />
          )}

          <Modal
            title="Design Preview"
            open={designPreviewVisible}
            onCancel={() => setDesignPreviewVisible(false)}
            footer={[<Button key="close" onClick={() => setDesignPreviewVisible(false)}>Close</Button>]}
            width={700}
          >
            <div className="flex justify-center">
              <Image src={checkOutState.product_design_file} alt="Design Preview" style={{ maxHeight: "400px" }} />
            </div>
          </Modal>
        </div>

        {/* Instructions Section */}
        <div>
          <div className="flex gap-3 mb-2">
            <Text className="text-gray-800 font-bold">Instructions</Text>
            <Switch checked={instructionsVisible} onChange={setInstructionsVisible} />
          </div>
          {instructionsVisible && (
            <TextArea
              rows={4}
              placeholder="Please provide the instructions for this product. Your response should be clear, concise, and must not exceed 180 words"
              maxLength={180}
              onChange={(e) => setCheckOutState(prev => ({ ...prev, instructions: e.target.value }))}
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
              {!quantity ? "Select quantity first" : !handleQuantityDetails(stock, quantity) ? "Out of stock" : "Add To Cart"}
            </Button>
          )}
        </div>

        <Divider className="!my-4" />

        {/* Bulk Order Modal */}
        <Modal
          title="Bulk Order Inquiry"
          open={showBulkOrderForm}
          onCancel={() => setShowBulkOrderForm(false)}
          footer={null}
          centered
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleBulkOrderSubmit}>
            <div className="space-y-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Product Code" name="product_code" initialValue={_.get(data, "product_code", "")}>
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Product Name" name="product_name" initialValue={_.get(data, "name", "")}>
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: 'Please enter quantity' }]}>
                <InputNumber min={1} className="w-full" addonAfter={unit} />
              </Form.Item>

              <Form.Item label="Email Address" name="email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Invalid email' }]}>
                <Input placeholder="your@email.com" />
              </Form.Item>

              <Form.Item label="Mobile Number" name="mobile" rules={[{ required: true, message: 'Please enter mobile number' }]}>
                <Input placeholder="+91 12345 67890" />
              </Form.Item>

              <Form.Item label="Additional Requirements" name="additional_requirements">
                <TextArea rows={3} placeholder="Any special requirements or notes..." />
              </Form.Item>

              <div className="flex gap-3">
                <Button onClick={() => setShowBulkOrderForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" className="flex-1">
                  Submit Inquiry
                </Button>
              </div>
            </div>
          </Form>
        </Modal>

        {/* Product Meta Information */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Text strong className="!text-gray-800 !w-20">Categories:</Text>
            <Text className="text-gray-600">
              {_.get(data, "category_details.main_category_name", "")}
              {_.get(data, "sub_category_details.sub_category_name", "") && `, ${_.get(data, "sub_category_details.sub_category_name", "")}`}
            </Text>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default ProductDetails;