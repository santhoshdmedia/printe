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

  //state
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
    product_price: 0,
    product_variants: {},
    product_quantity: 1,
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
      setQuantity(1);
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
    if (_.isEmpty(currentPriceSplitup)) {
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
      let stock_count =
        _.get(data, "type", "") === "Single Product"
          ? _.get(data, "stock_count", "")
          : _.get(product, `variants_price[${lowest_price_index}].stock`, {});
      let product_price =
        _.get(data, "type", "") === "Single Product"
          ? _.get(data, "single_product_price", "")
          : _.get(product, `variants_price[${lowest_price_index}].price`, {});

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
  }, [product]);

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
      const newQuantity = Number(_.get(filter_data, "[0].quantity", 1));
      setQuantity(newQuantity);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: newQuantity,
      }));
      setDiscountPercentage({
        uuid: Number(_.get(filter_data, "[0].uniqe_id", 1)),
        percentage: Number(_.get(filter_data, "[0].discount", 1)),
      });
    } catch (err) {}
  };

  const handleTextboxQuantityChange = (value) => {
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

  return (
    <Spin
      spinning={loading}
      indicator={
        <IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />
      }
    >
      <div className="flex-1 font-primary w-full space-y-8">
        {/* Product Header */}
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <h1
              className={`status-label hidden lg:block capitalize text-sm w-fit p-2 rounded-md 
                ${
                  data.stocks_status === "In Stock"
                    ? "bg-green-100 text-green-800"
                    : data.stocks_status === "Low Stock"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-gray-100 text-gray-800"
                }`}
            >
              {data.stocks_status === "In Stock" ? (
                <>
                  <span className="text-green-500">●</span> In Stock
                </>
              ) : data.stocks_status === "Low Stock" ? (
                <>
                  <span className="text-amber-500">●</span> Limited stocks
                </>
              ) : data.stocks_status === "Out of Stock" ? (
                <>
                  <span className="text-red-500">●</span> Out of Stock
                </>
              ) : data.stocks_status === "Don't Track Stocks" ? (
                <>
                  <span className="text-green-500">●</span> In Stock
                </>
              ) : (
                "Stock Unknown"
              )}
            </h1>
            <div className="flex items-start lg:pt-0 pt-4">
              <Tag color="green" className="flex gap-1 items-center">
                {averageRatingCount}
                <IconHelper.STAR_ICON />
              </Tag>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {rate.length} Ratings & {review.length} Reviews
          </p>

          <h1 className="title text-primary hidden lg:block capitalize text-2xl font-bold">
            {data.name}
          </h1>

          <div className="pb-2">
            <span className="text-lg text-gray-700">
              <div
                dangerouslySetInnerHTML={{
                  __html: _.get(data, "short_description", ""),
                }}
              />
            </span>
          </div>
        </div>

        <Divider className="my-6" />

        {/* Variants Selection */}
        {!_.isEmpty(currentPriceSplitup) && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Product Options</h3>
            <div className="flex flex-col w-full space-y-6">
              {product_type !== "Single Product" &&
                _.get(data, "variants", []).map((variant, index) => {
                  return (
                    <div
                      className="flex flex-col w-full justify-between"
                      key={index}
                    >
                      <label className="line-clamp-1 text-md font-medium py-1 text-gray-700">
                        {variant.variant_name}
                      </label>
                      <div className="w-[100%] center_div min-h-[60px]">
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
                            {_.get(variant, "options", []).map((data, index2) => {
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
                                  <h1 className="text-sm mt-1">{data.value}</h1>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <Divider className="my-6" />

        {/* Processing Time */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Processing & Delivery</h3>
          <div className="flex flex-col w-full justify-between">
            <label className="line-clamp-1 flex items-center gap-2 text-md font-medium py-1 text-gray-700">
              Processing Time{" "}
              <div
                className="text-sm cursor-pointer text-blue-500"
                onClick={() => setIsModalOpen(true)}
              >
                <IconHelper.QUESTION_MARK />
              </div>
            </label>

            <div className="w-[100%] center_div border border-gray-200 rounded-lg h-[60px] bg-gray-50">
              <Input
                type="text"
                value={processing_item}
                className="flex-1 !h-[50px] text-lg bg-transparent border-0"
                disabled
              />
            </div>

            <Modal
              title="Processing Time Information"
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              footer={null}
              centered
              className="!max-w-[1000px]"
            >
              <div className="max-w-full max-h-[800px] overflow-y-auto text-lg text-gray-700 p-2">
                <p>
                  The printing time determines how long it takes us to complete
                  your order. You may pick your preferred production time from the
                  list.{" "}
                </p>
                <div className="flex items-start gap-2 mt-2">
                  <p>
                    While we strive to complete the order within the committed
                    timeframes, the timings also depend on the following factors:
                  </p>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <p>
                    ✅ We will provide the proof file for approval before
                    printing. Faster approval will guarantee speedy processing. We
                    need 300 dpi CMYK resolution artwork uploaded along the order.
                    Preferred file types include CDR, AI, PSD, and High-Res Images
                    with text and components converted to vector where needed.
                  </p>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <p>
                    ✅Production time does not include the shipping time. Business
                    days do not include Sundays and National Holidays, and orders
                    made after 12 p.m. are counted from the next Business Day.
                  </p>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <p>
                    In case you still have any questions, let's connect?{" "}
                    <span className="text-primary font-medium text-sm">
                      Click Here to Whatsapp
                    </span>{" "}
                    or{" "}
                    <span className="text-primary font-medium text-sm">
                      call us on 📞+91-9876543210
                    </span>{" "}
                    or{" "}
                    <span className="text-primary font-medium text-sm">
                      📧 business@printe.in.
                    </span>
                  </p>
                </div>
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
            className="mt-6"
          >
            <h3 className="text-md font-medium text-gray-800">Estimated Delivery</h3>
            <motion.div whileHover={{ scale: 1.01 }} className="my-2">
              <Input className="h-12 rounded-lg" value={639001} />
            </motion.div>
            <motion.h3
              className="text-gray-700 pt-2 flex gap-2 items-center"
              whileHover={{ x: 5 }}
            >
              <IconHelper.DELIVERY_TRUCK_ICON className="text-blue-500" />
              Standard Delivery by
              <span className="text-gray-800 font-medium">{calculateDeliveryDate(processing_item)}</span> | 
              <span className="text-green-600 font-medium">₹ 75</span>
            </motion.h3>
          </motion.div>
        </div>

        <Divider className="my-6" />

        {/* Quantity Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Quantity & Pricing</h3>
          <div className="flex flex-col w-full justify-between">
            <label className="line-clamp-1 text-md font-medium py-1 text-gray-700">
              Quantity
            </label>

            <div className="w-[100%] center_div border border-gray-200 rounded-lg h-[60px] bg-gray-50">
              {_.get(data, "quantity_type", "") === "textbox" ? (
                <Input
                  min={100}
                  type="number"
                  className="flex-1 !h-[50px] text-lg bg-transparent border-0"
                  value={quantity}
                  onChange={(e) => {
                    handleTextboxQuantityChange(e.target.value);
                  }}
                />
              ) : (
                <>
                  {_.get(discountPercentage, "uuid", "") && (
                    <Select
                      defaultValue={discountPercentage?.uuid}
                      onChange={handleQuantityChnage}
                      className="flex-1 !h-[50px] text-lg border-0 bg-transparent"
                      placeholder={"Quantity"}
                      disabled={
                        _.get(data, "quantity_discount_splitup", []).length ===
                        1
                      }
                    >
                      {_.get(data, "quantity_discount_splitup", []).map(
                        (dis, index) => {
                          return (
                            <Select.Option key={index} value={dis.uniqe_id}>
                              <div className="flex items-center justify-between">
                                <span>{dis.quantity} units</span>
                                <span className="text-green-600">({dis.discount}% off)</span>
                                {_.get(dis, "recommended_stats", "") !=
                                  "Not Recommended" && (
                                  <Tag color="blue" className="!text-[12px] ml-2">
                                    Recommended
                                  </Tag>
                                )}
                              </div>
                            </Select.Option>
                          );
                        }
                      )}
                    </Select>
                  )}
                </>
              )}
            </div>
          </div>
          {_.get(data, "stocks_status", "") != "Don't Track Stocks" && (
            <span
              className={`!text-[14px] mt-2 ${
                handleQuantityDetails(stock, quantity)
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {handleQuantityDetails(stock, quantity)
                ? `Available Stock: ${Number(stock) - Number(quantity)} units`
                : "(Out-of-Stock)"}
            </span>
          )}
        </div>

        <Divider className="my-6" />

        {/* Pricing & Order Section */}
        {!_.isEmpty(currentPriceSplitup) && (
          <div className="space-y-6 bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl">
            {isGettingVariantPrice ? (
              <div className="center_div py-10">
                <Spin size="large" />
              </div>
            ) : (
              handleQuantityDetails(stock, quantity) && (
                <div className="text-gray-700">
                  {/* Price Display */}
                  <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-3">Price Summary</h3>
                    
                    <div className="center_div gap-x-4 py-2 justify-start">
                      {Number(
                        DISCOUNT_HELPER(
                          discountPercentage?.percentage,
                          Number(_.get(checkOutState, "product_price", 0))
                        ) * Number(quantity)
                      ).toFixed(2) !==
                        Number(
                          Number(_.get(checkOutState, "product_price", 0)) *
                            Number(quantity)
                        ).toFixed(2) && (
                        <span className="text-xl text-gray-500 line-through">
                          ₹{" "}
                          {Number(
                            Number(_.get(checkOutState, "product_price", 0)) *
                              Number(quantity)
                          ).toFixed(2)}
                        </span>
                      )}
                      <span className="text-3xl font-bold text-green-600">
                        ₹{" "}
                        {Number(
                          DISCOUNT_HELPER(
                            discountPercentage.percentage,
                            Number(_.get(checkOutState, "product_price", 0))
                          ) * Number(quantity)
                        ).toFixed(2)}
                      </span>
                    </div>
                    
                    {Math.abs(
                      Number(
                        Number(_.get(checkOutState, "product_price", 0)) *
                          quantity
                      ) -
                        Number(
                          DISCOUNT_HELPER(
                            discountPercentage.percentage,
                            Number(_.get(checkOutState, "product_price", 0))
                          ) * Number(quantity)
                        )
                    ).toFixed(2) > 0 && (
                      <Tag color="green" className="!my-2 !text-sm !py-1">
                        You save ₹{" "}
                        {Math.abs(
                          Number(
                            Number(_.get(checkOutState, "product_price", 0)) *
                              quantity
                          ) -
                            Number(
                              DISCOUNT_HELPER(
                                discountPercentage.percentage,
                                Number(_.get(checkOutState, "product_price", 0))
                              ) * Number(quantity)
                            )
                        ).toFixed(2)}
                      </Tag>
                    )}

                    <div className="pt-3 text-sm text-gray-600">
                      Inclusive of all taxes for{" "}
                      <span className="font-semibold">{quantity}</span> quantity
                      <br />
                      <span className="font-medium">
                        (₹ {Number(
                          DISCOUNT_HELPER(
                            discountPercentage.percentage,
                            Number(_.get(checkOutState, "product_price", 0))
                          )
                        ).toFixed(2)} per unit)
                      </span>
                    </div>
                  </div>

                  {/* Design Upload Toggle */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-md font-medium">I already have a design</span>
                    <Switch
                      checked={needDesignUpload}
                      onChange={(checked) => {
                        setNeedDesignUpload(checked);
                        if (!checked) {
                          setCheckOutState((prev) => ({
                            ...prev,
                            product_design_file: "",
                          }));
                        }
                      }}
                    />
                  </div>

                  {/* Design Upload Section */}
                  <div className="min-h-[100px] transition-all duration-300">
                    {needDesignUpload ? (
                      <div className="py-4 bg-white rounded-lg shadow-sm p-4">
                        {checkOutState.product_design_file ? (
                          <>
                            <div className="hidden lg:block">
                              <div className="center_div justify-between border border-green-200 bg-green-50 px-4 !h-[50px] rounded-lg gap-x-4 w-full">
                                <Tooltip title={checkOutState.product_design_file}>
                                  <span className="line-clamp-1 text-green-700 max-w-[200px] overflow-hidden font-medium">
                                    {checkOutState.product_design_file}
                                  </span>
                                </Tooltip>
                                <div className="center_div gap-x-3">
                                  <a
                                    href={checkOutState.product_design_file}
                                    target="_blank"
                                    className="!text-blue-500 !font-medium hover:underline"
                                  >
                                    View
                                  </a>
                                  <Divider type="vertical" />
                                  <div
                                    className="!text-[14px] cursor-pointer text-red-500 hover:text-red-700"
                                    onClick={() => {
                                      setCheckOutState((prevState) => ({
                                        ...prevState,
                                        product_design_file: "",
                                      }));
                                    }}
                                  >
                                    Remove
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="lg:hidden block bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center py-2">
                                <Tooltip title={checkOutState.product_design_file}>
                                  <span className="line-clamp-1 text-[14px] text-green-700 max-w-[200px] overflow-hidden font-medium">
                                    {checkOutState.product_design_file}
                                  </span>
                                </Tooltip>
                              </div>
                              <hr className="border-green-200 my-2" />
                              <div className="flex justify-between px-4 gap-x-3 text-sm">
                                <a
                                  href={checkOutState.product_design_file}
                                  target="_blank"
                                  className="text-blue-500 font-medium hover:underline"
                                >
                                  View
                                </a>
                                <Divider type="vertical" />
                                <div
                                  className="text-[14px] cursor-pointer text-red-500 hover:text-red-700"
                                  onClick={() => {
                                    setCheckOutState((prevState) => ({
                                      ...prevState,
                                      product_design_file: "",
                                    }));
                                  }}
                                >
                                  Remove
                                </div>
                              </div>
                            </div>
                            <div className="lg:py-3 py-4">
                              <div className="flex items-center gap-x-2">
                                <Checkbox
                                  checked={checked}
                                  onChange={(e) => {
                                    setChecked(e.target.checked);
                                    setError("");
                                  }}
                                >
                                  <span className="text-sm">I confirm this design is correct</span>
                                </Checkbox>
                              </div>
                              {error && (
                                <p className="text-red-500 text-xs mt-1">{error}</p>
                              )}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full my-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 !h-[50px] rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                              onClick={handlebuy}
                            >
                              Add To Shopping Cart
                            </motion.button>
                          </>
                        ) : (
                          <UploadFileButton
                            handleUploadImage={handleUploadImage}
                            buttonText={`Upload your Design file or pencil sketch`}
                            className={`${
                              checkOutState.product_design_file
                                ? "!bg-white !text-primary border border-primary"
                                : "!bg-blue-500 !text-white hover:bg-blue-600"
                            } !rounded-lg !h-[50px] !font-medium`}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="py-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full my-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 !h-[50px] rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                          onClick={handlebuy}
                        >
                          Add To Shopping Cart
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        <Divider className="my-6" />

        {/* Social Sharing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Share this product</h3>
          <div className="center_div gap-x-4 justify-start">
            {shareicon.map((res, index) => (
              <Tooltip title={`Share on ${res.name}`} key={index}>
                <motion.div 
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="cursor-pointer group border size-[45px] transition-all duration-300 center_div rounded-full shadow-sm hover:shadow-md"
                >
                  {res.com}
                </motion.div>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default ProductDetails;