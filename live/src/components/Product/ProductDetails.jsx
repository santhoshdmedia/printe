/* eslint-disable no-empty */
/* eslint-disable react/prop-types */
import {
  Checkbox,
  Divider,
  Input,
  InputNumber,
  Modal,
  Popover,
  Select,
  Spin,
  Tag,
  Tooltip,
  Switch,
  Button,
  Card,
  Badge,
  Progress,
  Collapse,
  Alert
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
  TelegramIcon,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { RiTwitterXFill } from "react-icons/ri";
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

const { Panel } = Collapse;

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
  const [quantity, setQuantity] = useState(100);
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
    product_quantity: 100,
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
  const [activeTab, setActiveTab] = useState("details");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isGettingVariantPrice, product, productRateAndReview } = useSelector(
    (state) => state.publicSlice
  );
  const { user } = useSelector((state) => state.authSlice);

  useEffect(() => {
    if (_.get(data, "quantity_type", "") != "textbox") {
      setDiscountPercentage({
        uuid: _.get(data, "quantity_discount_splitup[0].uniqe_id", ""),
        percentage: _.get(data, "quantity_discount_splitup[0].discount", ""),
      });
      const initialQuantity = _.get(
        data,
        "quantity_discount_splitup[0].quantity",
        100
      );
      setQuantity(initialQuantity);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: initialQuantity,
      }));
    } else {
      if (
        Number(_.get(data, "quantity_discount_splitup[0].quantity", "")) === 1
      ) {
        setDiscountPercentage({
          uuid: _.get(data, "quantity_discount_splitup[0].uniqe_id", ""),
          percentage: _.get(data, "quantity_discount_splitup[0].discount", ""),
        });
      } else {
        setDiscountPercentage({ uuid: "", percentage: 0 });
      }
      setMaimumQuantity(_.get(data, "max_quantity", ""));
      setQuantity(100);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: 100,
      }));
    }
  }, [_.get(data, "quantity_discount_splitup[0].discount", "")]);

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
      if (needDesignUpload && !checked) {
        setError("Please Confirm Your Designs");
        return;
      }
      
      if (_.isEmpty(user)) {
        localStorage.setItem("redirect_url", _.get(data, "seo_url", ""));
        CUSTOM_ERROR_NOTIFICATION("Please Login");
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
      CUSTOM_SUCCESS_SWALFIRE_NOTIFICATION({
        title: "Product Added To Cart",
        text: "Choose an option: Go to the shopping cart page or stay here.",
        icon: "success",
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
        CUSTOM_ERROR_NOTIFICATION("login to place order ");
        navigate("/sign-up");
      } else {
        ERROR_NOTIFICATION(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryDate = (days) => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + Number(days));
    
    return deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
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

  const handleQuantityChnage = (id) => {
    try {
      let filter_data = _.get(data, "quantity_discount_splitup", "").filter(
        (res) => {
          return res.uniqe_id === id;
        }
      );
      const newQuantity = Number(_.get(filter_data, "[0].quantity", 100));
      setQuantity(newQuantity);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: newQuantity,
      }));
      setDiscountPercentage({
        uuid: Number(_.get(filter_data, "[0].uniqe_id", 100)),
        percentage: Number(_.get(filter_data, "[0].discount", 100)),
      });
    } catch (err) {}
  };

  const handleTextboxQuantityChange = (value) => {
    if (value < 100) {
      value = 100;
    }
    
    const result = _.get(data, "quantity_discount_splitup", []).filter(
      (res) => {
        return Number(res.quantity) <= Number(value);
      }
    );

    if (!_.isEmpty(result)) {
      let favoriteone = _.get(result, `[${result?.length - 1}]`, []);
      setDiscountPercentage({
        uuid: _.get(favoriteone, "uniqe_id", ""),
        percentage: _.get(favoriteone, "discount", ""),
      });
    } else {
      setDiscountPercentage({ uuid: 0, percentage: 0 });
    }
    setQuantity(value);
    setCheckOutState((prev) => ({
      ...prev,
      product_quantity: value,
    }));
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

  // Calculate savings
  const calculateSavings = () => {
    return Math.abs(
      Number(
        Number(_.get(checkOutState, "product_price", 0)) * quantity
      ) -
        Number(
          DISCOUNT_HELPER(
            discountPercentage.percentage,
            Number(_.get(checkOutState, "product_price", 0))
          ) * Number(quantity)
        )
    ).toFixed(2);
  };

  // Get stock status
  const getStockStatus = () => {
    if (data.stocks_status === "In Stock") {
      return { text: "In Stock", color: "green", icon: "●" };
    } else if (data.stocks_status === "Low Stock") {
      return { text: "Limited Stock", color: "orange", icon: "⚠" };
    } else if (data.stocks_status === "Out of Stock") {
      return { text: "Out of Stock", color: "red", icon: "✕" };
    } else if (data.stocks_status === "Don't Track Stocks") {
      return { text: "Available", color: "green", icon: "●" };
    } else {
      return { text: "Stock Unknown", color: "gray", icon: "?" };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Spin
      spinning={loading}
      indicator={
        <IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />
      }
    >
      <div className="flex-1 font-primary w-full space-y-8">
        {/* Product Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <Badge.Ribbon 
              text={stockStatus.text} 
              color={stockStatus.color}
              placement="start"
            >
              <div className="w-3 h-3"></div> {/* Spacer for the ribbon */}
            </Badge.Ribbon>
            
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
              <Tag color="blue" className="flex gap-1 items-center m-0">
                {averageRatingCount}
                <IconHelper.STAR_ICON className="text-yellow-400" />
              </Tag>
              <span className="text-sm text-gray-600">
                {rate.length} Ratings & {review.length} Reviews
              </span>
            </div>
          </div>

          <h1 className="title text-gray-900 text-3xl font-bold mb-3">
            {data.name}
          </h1>

          <div className="mb-4">
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: _.get(data, "short_description", ""),
              }}
            />
          </div>

          {/* Product Labels */}
          {data.label && data.label.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {data.label.map((label, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {["details", "options", "pricing", "delivery"].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-1 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Details Tab */}
          {activeTab === "details" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-800">Product Details</h3>
              <div
                className="text-gray-600 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: _.get(data, "desc", "") }}
              />
            </motion.div>
          )}

          {/* Options Tab */}
          {activeTab === "options" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Variants Selection */}
              {product_type !== "Single Product" && !_.isEmpty(currentPriceSplitup) && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">Customization Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {_.get(data, "variants", []).map((variant, index) => (
                      <Card 
                        key={index} 
                        className="shadow-sm hover:shadow-md transition-shadow"
                        title={variant.variant_name}
                      >
                        {variant.variant_type !== "image_variant" ? (
                          <Select
                            disabled={variant.options.length === 1}
                            className="w-full h-12 rounded-lg"
                            defaultValue={_.get(
                              currentPriceSplitup,
                              `[${variant.variant_name}]`,
                              ""
                            )}
                            options={variant.options}
                            onChange={(value) =>
                              handleOnChangeSelectOption(value, index)
                            }
                          />
                        ) : (
                          <div className="flex flex-wrap gap-3 py-2">
                            {_.get(variant, "options", []).map((data, index2) => (
                              <div
                                key={index2}
                                className="flex flex-col items-center"
                              >
                                <div
                                  onClick={() =>
                                    variant.options.length !== 1 &&
                                    handleOnChangeSelectOption(data.value, index)
                                  }
                                  className={`size-16 border-2 ${
                                    variant.options.length === 1
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer hover:border-blue-400 transition-all"
                                  } center_div rounded-lg p-1 ${
                                    _.get(
                                      currentPriceSplitup,
                                      `[${variant.variant_name}]`,
                                      ""
                                    ) === data.value
                                      ? "border-blue-500 shadow-md"
                                      : "border-gray-300"
                                  }`}
                                >
                                  <img
                                    src={data.image_name}
                                    className="size-10 object-contain"
                                    alt={data.value}
                                  />
                                </div>
                                <span className="text-xs mt-1 text-center">{data.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Design Upload Section */}
              <Card title="Design Requirements" className="shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">I need to upload my design</span>
                    <Switch 
                      checked={needDesignUpload} 
                      onChange={(checked) => {
                        setNeedDesignUpload(checked);
                        if (!checked) {
                          setCheckOutState(prev => ({
                            ...prev,
                            product_design_file: ""
                          }));
                        }
                      }}
                    />
                  </div>

                  {needDesignUpload && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      {checkOutState.product_design_file ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Design File</span>
                            <div className="flex gap-2">
                              <a
                                href={checkOutState.product_design_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View
                              </a>
                              <button
                                onClick={() => {
                                  setCheckOutState(prevState => ({
                                    ...prevState,
                                    product_design_file: "",
                                  }));
                                }}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={checked}
                              onChange={(e) => {
                                setChecked(e.target.checked);
                                setError("");
                              }}
                            >
                              I confirm this design is correct
                            </Checkbox>
                            {error && (
                              <span className="text-red-500 text-sm">{error}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <UploadFileButton
                          handleUploadImage={handleUploadImage}
                          buttonText="Upload Design File"
                          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                        />
                      )}
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-800">Quantity & Pricing</h3>
              
              <Card className="shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity (Minimum: 100)
                    </label>
                    
                    {_.get(data, "quantity_type", "") === "textbox" ? (
                      <InputNumber
                        min={100}
                        type="number"
                        className="w-full h-12"
                        value={quantity}
                        onChange={handleTextboxQuantityChange}
                      />
                    ) : (
                      <Select
                        defaultValue={discountPercentage?.uuid}
                        onChange={handleQuantityChnage}
                        className="w-full h-12"
                        placeholder="Select Quantity"
                        disabled={
                          _.get(data, "quantity_discount_splitup", []).length === 1
                        }
                      >
                        {_.get(data, "quantity_discount_splitup", []).map(
                          (dis, index) => (
                            <Select.Option key={index} value={dis.uniqe_id}>
                              <div className="flex items-center justify-between">
                                <span>{dis.quantity} units</span>
                                <span className="text-green-600">
                                  ({dis.discount}% off)
                                </span>
                                {_.get(dis, "recommended_stats", "") !==
                                  "Not Recommended" && (
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    Recommended
                                  </span>
                                )}
                              </div>
                            </Select.Option>
                          )
                        )}
                      </Select>
                    )}
                  </div>

                  {_.get(data, "stocks_status", "") !== "Don't Track Stocks" && (
                    <div className={`text-sm ${
                      handleQuantityDetails(stock, quantity)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                      {handleQuantityDetails(stock, quantity)
                        ? `Available Stock: ${Number(stock) - Number(quantity)} units`
                        : "Out of Stock"}
                    </div>
                  )}
                </div>
              </Card>

              {/* Price Display */}
              {isGettingVariantPrice ? (
                <div className="center_div py-10">
                  <Spin size="large" />
                </div>
              ) : (
                handleQuantityDetails(stock, quantity) && (
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-md">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="text-lg font-semibold">
                          Rs. {Number(_.get(checkOutState, "product_price", 0)).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{quantity}</span>
                      </div>

                      {discountPercentage.percentage > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Discount:</span>
                          <span className="text-green-600 font-semibold">
                            {discountPercentage.percentage}%
                          </span>
                        </div>
                      )}

                      <Divider className="my-2" />

                      <div className="flex items-center justify-between text-xl font-bold">
                        <span>Total:</span>
                        <div className="flex flex-col items-end">
                          {discountPercentage.percentage > 0 && (
                            <span className="text-gray-400 line-through text-sm">
                              Rs. {(
                                Number(_.get(checkOutState, "product_price", 0)) * quantity
                              ).toFixed(2)}
                            </span>
                          )}
                          <span className="text-blue-600">
                            Rs. {(
                              DISCOUNT_HELPER(
                                discountPercentage.percentage,
                                Number(_.get(checkOutState, "product_price", 0))
                              ) * quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {calculateSavings() > 0 && (
                        <div className="bg-green-100 text-green-800 p-3 rounded-lg">
                          You save Rs. {calculateSavings()} on this order!
                        </div>
                      )}

                      <Button
                        type="primary"
                        size="large"
                        className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700"
                        onClick={handlebuy}
                        disabled={needDesignUpload && !checkOutState.product_design_file}
                      >
                        {needDesignUpload && !checkOutState.product_design_file
                          ? "Upload Design to Continue"
                          : "Add to Cart"}
                      </Button>
                    </div>
                  </Card>
                )
              )}
            </motion.div>
          )}

          {/* Delivery Tab */}
          {activeTab === "delivery" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-800">Delivery Information</h3>
              
              <Card className="shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Processing Time</span>
                    <span className="font-semibold">{processing_item} business days</span>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <IconHelper.DELIVERY_TRUCK_ICON className="text-blue-500 text-xl" />
                      <span className="font-medium">Estimated Delivery</span>
                    </div>
                    <p className="text-gray-700">
                      Your order will be delivered by{" "}
                      <span className="font-semibold text-blue-600">
                        {calculateDeliveryDate(Number(processing_item) + 3)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      (Processing: {processing_item} days + Shipping: 3 days)
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <IconHelper.INFO_ICON className="text-yellow-500 text-xl" />
                      <span className="font-medium">Important Notes</span>
                    </div>
                    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Business days exclude weekends and holidays</li>
                      <li>Production time starts after design approval</li>
                      <li>Delivery times may vary based on your location</li>
                    </ul>
                  </div>

                  <Button 
                    type="text" 
                    className="text-blue-600 p-0"
                    onClick={() => setIsModalOpen(true)}
                  >
                    View detailed processing information
                  </Button>
                </div>
              </Card>

              <Modal
                title="Processing Time Details"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={700}
              >
                <div className="max-h-96 overflow-y-auto p-1">
                  <p className="text-gray-700 mb-4">
                    The printing time determines how long it takes us to complete
                    your order. You may pick your preferred production time from the
                    list.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <p>
                        We will provide the proof file for approval before
                        printing. Faster approval will guarantee speedy processing.
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <p>
                        We need 300 dpi CMYK resolution artwork uploaded along the order.
                        Preferred file types include CDR, AI, PSD, and High-Res Images
                        with text and components converted to vector where needed.
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <p>
                        Production time does not include the shipping time. Business
                        days do not include Sundays and National Holidays, and orders
                        made after 12 p.m. are counted from the next Business Day.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <p className="text-gray-700">
                        Need more information? Contact us:
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <a href="#" className="text-blue-600 hover:underline">
                          WhatsApp Support
                        </a>
                        <a href="tel:+919876543210" className="text-blue-600 hover:underline">
                          +91-9876543210
                        </a>
                        <a href="mailto:business@printe.in" className="text-blue-600 hover:underline">
                          business@printe.in
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Modal>
            </motion.div>
          )}
        </div>

        {/* Social Sharing */}
        <Card title="Share this product" className="shadow-sm">
          <div className="flex flex-wrap gap-4">
            {shareicon.map((res) => (
              <motion.div
                key={res.id}
                whileHover={{ scale: 1.1, y: -2 }}
                className="cursor-pointer"
              >
                <Tooltip title={`Share on ${res.name}`}>
                  {res.com}
                </Tooltip>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </Spin>
  );
};

export default ProductDetails;