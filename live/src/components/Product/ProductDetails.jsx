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
  const [designPreviewVisible, setDesignPreviewVisible] = useState(false);
  // geo locaton
  const [pincode, setPincode] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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

  const calculateDeliveryDate = (days) => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + (Number(days) + 1));

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

  // Format price with Indian Rupee symbol
  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    const unitPrice = DISCOUNT_HELPER(
      discountPercentage.percentage,
      Number(_.get(checkOutState, "product_price", 0))
    );
    return Number(unitPrice * quantity).toFixed(2);
  };

  // Calculate original price (before discount)
  const calculateOriginalPrice = () => {
    return Number(
      Number(_.get(checkOutState, "product_price", 0)) * quantity
    ).toFixed(2);
  };

  // Calculate savings
  const calculateSavings = () => {
    const original = calculateOriginalPrice();
    const discounted = calculateTotalPrice();
    return (original - discounted).toFixed(2);
  };

  //  handle geolocation
  const getLocationFromBrowser = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          const foundPincode = data.address?.postcode;
          if (foundPincode) {
            setPincode(foundPincode);
            toast.success(`Pincode detected: ${foundPincode}`);
          } else {
            toast.error("Could not detect pincode from your location");
          }
        } catch (error) {
          console.error("Error getting location:", error);
          toast.error("Failed to get location information");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Please allow location access to detect your pincode");
        setIsGettingLocation(false);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      }
    );
  };

  // Generate quantity options for dropdown
  const generateQuantityOptions = () => {
    if (_.get(data, "quantity_type", "") === "textbox") {
      // For textbox type, create options in increments of 100
      const maxQty = _.get(data, "max_quantity", 10000);
      const options = [];
      for (let i = 100; i <= maxQty; i += 100) {
        options.push({ value: i, label: i.toString() });
      }
      return options;
    } else {
      // For predefined quantities
      return _.get(data, "quantity_discount_splitup", []).map((item) => ({
        value: item.quantity,
        label: `${item.quantity} (${item.discount}% off)`,
      }));
    }
  };

  const quantityOptions = generateQuantityOptions();
  const [isClicked, setIsClicked] = useState(false);
  const handleClick = () => {
    setIsClicked(!isClicked); // Toggle the clicked state
  };

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
            animate={{ scale: [1, 1.1, 1] }} // Scale up and down
            transition={{
              duration: 0.6,
              repeat: Infinity, // Repeat indefinitely
              repeatType: "loop", // Loop the animation
              ease: "easeInOut", // Easing function for smooth animation
            }}
            className="bg-green-100 border border-green-300 rounded-lg p-3 shadow-lg text-right"
          >
            <Title level={4} className="!m-0 !text-green-600">
              {formatPrice(
                DISCOUNT_HELPER(
                  discountPercentage.percentage,
                  Number(_.get(checkOutState, "product_price", 0))
                )
              )}
            </Title>
          </motion.div>
        </div>

        {/* Product Description */}
        <div>
          <Paragraph className="text-gray-700 text-base leading-relaxed !mb-0">
            <div
              dangerouslySetInnerHTML={{
                __html: _.get(data, "short_description", ""),
              }}
            />
          </Paragraph>
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
                  onChange={(value) => handleTextboxQuantityChange(value)}
                  options={quantityOptions}
                  className="w-full"
                  placeholder="Select Quantity"
                />
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
            {/* Button for Individual Box */}
            <Col
              xs={24}
              md={product_type !== "Single Product" ? 8 : 24}
              className="flex items-center justify-center "
            >
              <Button
                onClick={handleClick}
                style={{
                  backgroundColor: isClicked ? "#f9c114" : "#000", // Change color on click
                  color: isClicked ? "#000" : "#fff", // Change text color on click
                  border: "none",
                  transition: "background-color 0.3s ease", // Smooth transition
                  padding: "10px 20px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                }}
                className="w-[100%] text-md text-wrap py-5 lg:h-[50px] h-full"
              >
                Individual Box for 100 Cards
              </Button>
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
                {calculateSavings() > 0 && (
                  <Text delete className="text-md text-gray-500 mr-2">
                    {formatPrice(calculateOriginalPrice())}
                  </Text>
                )}
                <Title level={4} className="!m-0 !text-green-600">
                  {formatPrice(calculateTotalPrice())}
                </Title>
              </div>
            </div>

            {calculateSavings() > 0 && (
              <Alert
                message={`You save ${formatPrice(calculateSavings())}`}
                type="success"
                showIcon
                className="!py-2"
              />
            )}

            <div className="text-sm text-gray-600">
              <Text>
                Inclusive of all taxes for <Text strong>{quantity}</Text> Qty (
                <Text strong>
                  {formatPrice(
                    DISCOUNT_HELPER(
                      discountPercentage.percentage,
                      Number(_.get(checkOutState, "product_price", 0))
                    )
                  )}
                </Text>{" "}
                / piece)
              </Text>
            </div>
          </div>

          <div className="flex flex-col w-full justify-between mt-3">
            <div className="flex items-center gap-2 ">
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
              <span className="font-bold">
                {processing_item} days + Production 1day{" "}
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
                  us on WhatsApp, call us at +91-9876543210, or email
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
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter Pincode"
              />
              <button
                onClick={getLocationFromBrowser}
                className="absolute right-0 top-0 text-white p-3 bg-black h-full"
              >
                Get Pincode
              </button>
            </motion.div>
            <motion.div
              className="text-gray-700 flex gap-2 items-center"
              whileHover={{ x: 5 }}
            >
              <IconHelper.DELIVERY_TRUCK_ICON className="text-blue-500" />
              Standard Delivery by
              <Text strong>{calculateDeliveryDate(processing_item)}</Text>
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
            handleQuantityDetails(stock, quantity) && (
              <div className="text-gray-600">
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
              </div>
            )
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
