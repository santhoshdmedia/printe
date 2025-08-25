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
  Rate
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
import { HeartOutlined, PlusOutlined, MinusOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { CiFaceSmile } from "react-icons/ci";
import { CgSmileSad } from "react-icons/cg";

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
        setError("Please upload your design file first");
        return;
      }

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

  return (
    <Spin
      spinning={loading}
      indicator={
        <IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />
      }
    >
      <div className="font-primary w-full space-y-6">
         <div className="">
           {_.get(data, "stocks_status", "") !== "Out of Stock" ? (
              <div  className="!m-0 text-xl font-bold bg-transparent flex w-fit items-center gap-2 text-green-500">
                <CiFaceSmile />In Stock
              </div>
            ) : (
              <div  className="!m-0 text-xl font-bold bg-transparent flex w-fit items-center gap-2 text-red-500">
                <CgSmileSad/>Out of Stock
              </div>
            )}
            <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Rate 
                disabled 
                defaultValue={averageRatingCount} 
                className="!text-yellow-400 !text-sm" 
              />
              <Text className="ml-2 text-gray-600">
                ({rate.length} Reviews)
              </Text>
            </div>
            
          
          </div>
         </div>
        {/* Product Header - Porterhouse Style */}
        <div className="space-y-4">
          <Title level={1} className="!mb-2 !text-gray-900 !font-bold">
            {data.name}
          </Title>
          
          
          
          <Title level={2} className="!my-4 !text-gray-900 !font-normal">
            {formatPrice(
              DISCOUNT_HELPER(
                discountPercentage.percentage,
                Number(_.get(checkOutState, "product_price", 0))
              )
            )}
          </Title>
        </div>

        <Divider className="!my-6" />

        {/* Product Description */}
        <div className="space-y-4">
          <Paragraph className="text-gray-700 text-base leading-relaxed">
            <div
              dangerouslySetInnerHTML={{
                __html: _.get(data, "short_description", ""),
              }}
            />
          </Paragraph>
        </div>

         {/* Variants Selection (Hidden by default, shows when product has variants) */}
        {product_type !== "Single Product" &&
          !_.isEmpty(currentPriceSplitup) && (
            <Card size="small" title="Product Options" className="mt-6 !bg-transparent !border-none">
              <div className="flex flex-col w-full space-y-6">
                {_.get(data, "variants", []).map((variant, index) => {
                  return (
                    <div
                      className="flex items-center gap-0 w-full justify-between"
                      key={index}
                    >
                      <label className="line-clamp-1 text-2xl font-medium py-1 text-gray-700 w-[8%]">
                        {variant.variant_name}
                      </label>
                      <div className="w-[100%] center_div min-h-[40px]">
                        {variant.variant_type != "image_variant" ? (
                          <Select
                            disabled={variant.options.length === 1}
                            className="flex-1 !w-full !h-[50px] !rounded-lg border-gray-300"
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
                          <div className="flex items-center gap-x-3 flex-wrap w-full py-2">
                            {_.get(variant, "options", []).map(
                              (data, index2) => {
                                return (
                                  <div
                                    key={index}
                                    className="flex flex-col items-center gap-y-1"
                                  >
                                    <div
                                      key={index2}
                                      onClick={() =>
                                        handleOnChangeSelectOption(
                                          data.value,
                                          index
                                        )
                                      }
                                      className={`!size-[60px] border-2 ${
                                        variant.options.length === 1
                                          ? "!cursor-not-allowed"
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
                                        className="!size-[40px] !object-contain"
                                      />
                                    </div>
                                    <h1 className="text-sm mt-1">
                                      {data.value}
                                    </h1>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

        {/* File Upload Section - Porterhouse Style */}
        <div className="space-y-4">
          <Text strong className="block mb-2 text-gray-800">
            Upload Your Design
          </Text>
          
          {needDesignUpload ? (
            <>
              <UploadFileButton
                handleUploadImage={handleUploadImage}
                buttonText="Drag & Drop Files Here or Browse Files"
                className="w-full h-40 border-1  border-dotted  rounded-lg flex flex-col items-center justify-center   transition-colors"
                icon={<div className="text-3xl mb-2 text-gray-400">+</div>}
              />
              
              {checkOutState.product_design_file && (
                <div className="mt-4">
                  <Checkbox
                    checked={checked}
                    onChange={(e) => {
                      setChecked(e.target.checked);
                      setError("");
                    }}
                  >
                    I confirm this design
                  </Checkbox>
                  {error && (
                    <Text type="danger" className="block mt-1">{error}</Text>
                  )}
                </div>
              )}
            </>
          ) : (
            <Alert 
              message="Our Designing Team contact within 24 Hours After Booking" 
              type="info" 
              showIcon 
            />
          )}
          
          <div className="flex items-center gap-2 mt-2">
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

        <Divider className="!my-6" />

        {/* Total Price Section - Added back */}
        <Card className="bg-blue-50 rounded-lg border-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text strong className="text-gray-800">Total Price:</Text>
              <div className="text-right">
                {calculateSavings() > 0 && (
                  <Text delete className="text-lg text-gray-500 mr-2">
                    {formatPrice(calculateOriginalPrice())}
                  </Text>
                )}
                <Title level={3} className="!m-0 !text-green-600">
                  {formatPrice(calculateTotalPrice())}
                </Title>
              </div>
            </div>
            
            {calculateSavings() > 0 && (
              <Alert 
                message={`You save ${formatPrice(calculateSavings())}`}
                type="success"
                showIcon
              />
            )}
            
            <div className="text-sm text-gray-600">
              <Text>
                Inclusive of all taxes for{" "}
                <Text strong>{quantity}</Text> Qty (
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
          <div className="flex flex-col w-full justify-between mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Text strong className="text-gray-700">
                  Processing Time 
                </Text>
                <Tooltip title="Learn more about processing time">
                  <Button 
                    type="text" 
                    icon={<IconHelper.QUESTION_MARK />} 
                    size="small"
                    onClick={() => setIsModalOpen(true)}
                  />
                </Tooltip>
                <span className="text-xl font-bold">{processing_item} business days</span>
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
                      days do not include Sundays and National Holidays, and orders 
                      made after 12 p.m. are counted from the next Business Day.
                    </li>
                  </ul>
                  <Paragraph className="mt-4">
                    In case you still have any questions, let's connect? Contact us
                    on WhatsApp, call us at +91-9876543210, or email business@printe.in.
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
              className="mt-2"
            >
              <Text strong className="block mb-2 text-gray-700">
                Estimated Delivery
              </Text>
              <motion.div whileHover={{ scale: 1.01 }} className="my-2">
                <Input className="h-12 rounded-lg" value={639001} />
              </motion.div>
              <motion.div
                className="text-gray-700 pt-2 flex gap-2 items-center"
                whileHover={{ x: 5 }}
              >
                <IconHelper.DELIVERY_TRUCK_ICON className="text-blue-500" />
                Standard Delivery by
                <Text strong>{calculateDeliveryDate(processing_item)}</Text>
                <Divider type="vertical" />
                <Text type="success" strong>₹ 75</Text>
              </motion.div>
            </motion.div>
        </Card>

        <Divider className="!my-6" />

        {/* Add to Cart Section - Porterhouse Style */}
        <div className="space-y-6">
          {isGettingVariantPrice ? (
            <div className="center_div py-10">
              <Spin size="large" />
            </div>
          ) : (
            handleQuantityDetails(stock, quantity) && (
              <div className="text-gray-600 text-md flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <Button 
                      type="text" 
                      icon={<MinusOutlined />}
                      onClick={() => setQuantity(prev => Math.max(100, prev - 100))}
                      className=""
                    />
                    <InputNumber
                      min={100}
                      value={quantity}
                      onChange={handleTextboxQuantityChange}
                      className=" !text-center !border-x !border-0 [&_.ant-input-number-input]:!text-center"
                      controls={false}
                    />
                    <Button 
                      type="text" 
                      icon={<PlusOutlined />}
                      onClick={() => setQuantity(prev => prev + 100)}
                      className=""
                    />
                  </div>
                  
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    className="!h-12 !px-6 !bg-yellow-400 text-black hover:!text-black font-semibold flex-1"
                    onClick={handlebuy}
                    loading={loading}
                  >
                    Add To Cart
                  </Button>
                </div>
                
                {/* {_.get(data, "stocks_status", "") != "Don't Track Stocks" && (
                  <Text
                    className={`!text-[14px] mt-2 ${
                      handleQuantityDetails(stock, quantity)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {handleQuantityDetails(stock, quantity)
                      ? `Available Stock: ${Number(stock) - Number(quantity)} units`
                      : "(Out-of-Stock)"}
                  </Text>
                )} */}
              </div>
            )
          )}
        </div>

        <Divider className="!my-6" />

        {/* Product Meta Information - Porterhouse Style */}
        <div className="space-y-3">
          <div className="flex items-center">
            <Text strong className="!text-gray-800 !w-24">Categories:</Text>
            <Text className="text-gray-600">
              {_.get(data, "category_details.main_category_name", "")}
              {_.get(data, "sub_category_details.sub_category_name", "") && 
                `, ${_.get(data, "sub_category_details.sub_category_name", "")}`
              }
            </Text>
          </div>
          
          {/* <div className="flex items-center">
            <Text strong className="!text-gray-800 !w-24">Tags:</Text>
            <Text className="text-gray-600">
              {_.get(data, "label", []).join(", ")}
            </Text>
          </div> */}
        </div>

       

    
      </div>
    </Spin>
  );
};

export default ProductDetails;