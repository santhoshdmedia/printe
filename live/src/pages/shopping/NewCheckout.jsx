import { useEffect, useRef, useState } from "react";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import _ from "lodash";
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
  Switch,
} from "antd";
import { emailValidation, formValidation } from "../../helper/form_validation";
import { IconHelper } from "../../helper/IconHelper";
import {
  CUSTOM_ERROR_NOTIFICATION,
  CUSTOM_SUCCESS_SWALFIRE_NOTIFICATION,
  ERROR_NOTIFICATION,
  SUCCESS_NOTIFICATION,
} from "../../helper/notification_helper";
import {
  craeteOrderId,
  createOrder,
  getMyShoppingCart,
  removeMyShoppingCart,
} from "../../helper/api_helper";
import { useSelector } from "react-redux";
import Confetti from "react-confetti";
import Razorpay from "react-razorpay/dist/razorpay";
import { EnvHelper } from "../../helper/EnvHelper";
import Information from "../Information/Information";
import { termsAndConditions } from "../../../data";
import { ImageHelper } from "../../helper/ImageHelper";

const NewCheckout = () => {
  const { user } = useSelector((state) => state.authSlice);
  const location = useLocation();
  const selectedProducts = location.state?.selectedProducts || [];

  const [isEditable, setIsEditable] = useState(false);
  const [gstNo, setGstNo] = useState(user.gst_no || "");
  const navigation = useNavigate();

  console.log(user);
  useEffect(() => {
    if (user.name == "") {
      navigation("/login");
    }
  }, []);
  const PAYMENT_TYPE = [
    {
      id: 2,
      name: "Online Payment",
      icon: <IconHelper.ONLINE_PAYMENT className="!text-3xl" />,
    },
  ];

  const [paymentType, setPaymentType] = useState(PAYMENT_TYPE[0].name);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [termsClick, setTermsClick] = useState(false);
  const [designModalVisible, setDesignModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentOption, setPaymentOption] = useState("full"); // 'full' or 'half'

  const gstin_ref = useRef();

  const [form] = Form.useForm();

  const [cardData, setCardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [gstRate, setGstRate] = useState(0);

  // Custom validation rules
  const mobileValidation = () => ({
    validator(_, value) {
      if (!value) {
        return Promise.reject(new Error("Please enter mobile number"));
      }

      // Remove any non-digit characters
      const cleanValue = value.replace(/\D/g, "");

      if (cleanValue.length !== 10) {
        return Promise.reject(
          new Error("Mobile number must be exactly 10 digits")
        );
      }

      return Promise.resolve();
    },
  });

  const emailValidationEnhanced = () => ({
    validator(_, value) {
      if (!value) {
        return Promise.reject(new Error("Please enter email address"));
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return Promise.reject(new Error("Please enter a valid email address"));
      }

      if (!value.endsWith("@gmail.com")) {
        return Promise.reject(new Error("Email must end with @gmail.com"));
      }

      return Promise.resolve();
    },
  });

  const pincodeValidation = () => ({
    validator(_, value) {
      if (!value) {
        return Promise.reject(new Error("Please enter pincode"));
      }

      // Remove any non-digit characters
      const cleanValue = value.replace(/\D/g, "");

      if (cleanValue.length !== 6) {
        return Promise.reject(new Error("Pincode must be exactly 6 digits"));
      }

      return Promise.resolve();
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getMyShoppingCart();
      const allCartItems = _.get(result, "data.data", []);
      const gst = Number(_.get(result, "data.data[0].sgst", 0)) * 2;
      setGstRate(gst / 100);
      console.log(gstRate, "5455");

      if (selectedProducts.length > 0) {
        const selectedIds = selectedProducts.map((p) => p._id);
        const filteredItems = allCartItems.filter((item) =>
          selectedIds.includes(item._id)
        );
        setCardData(filteredItems);
      } else {
        setCardData(allCartItems);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDesign = (product) => {
    setSelectedProduct(product);
    setDesignModalVisible(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "Product",
      dataIndex: "product_image",
      key: "image",
      render: (image, record) => (
        <div className="flex items-center">
          <Tooltip title={"View Product"}>
            <Link
              to={`/product/${_.get(record, "product_seo_url", "")}`}
              target="_blank"
            >
              <img
                src={image}
                alt={record.product_name}
                className="!h-[80px] !w-[80px] object-contain"
              />
            </Link>
          </Tooltip>
          <div className="ml-4">
            <Link
              to={`/product/${_.get(record, "product_seo_url", "")}`}
              target="_blank"
              className="text-blue-600 hover:text-yellow-500"
            >
              {record.product_name}
            </Link>
          </div>
        </div>
      ),
      width: "60%",
    },
    {
      title: "Price",
      dataIndex: "product_price",
      key: "product_price",
      render: (price) => (
        <span className="font-medium">₹{Number(price).toFixed(2)}</span>
      ),
      align: "right",
      width: "15%",
    },
    {
      title: "Qty",
      dataIndex: "product_quantity",
      key: "product_quantity",
      align: "center",
      width: "10%",
    },
    {
      title: "Total",
      dataIndex: "final_total",
      key: "final_total",
      render: (final_total) => (
        <span className="font-bold">₹{Number(final_total).toFixed(2)}</span>
      ),
      align: "right",
      width: "15%",
    },
  ];

  const  GET_SUB_TOTAL = () => {
    return _.sum(
      cardData.map((res) => {
        return Number(res.final_total);
      })
    );
  };

  const GET_TAX_TOTAL = () => {
    // console.log(_.get(result, "data.data.[0].sgst", 0),)
    return _.sum(
      cardData.map((res) => {
        // Calculate 18% tax on the product total
        return Number(res.final_total) * gstRate;
      })
    );
  };

  const GET_Mrp_savings = () => {
    // console.log(_.get(result, "data.data.[0].sgst", 0),)
    return _.sum(
      cardData.map((res) => {
        // Calculate 18% tax on the product total
        return Number(res.MRP_savings);
      })
    );
  };
  const GET_additonal_savings = () => {
    // console.log(_.get(result, "data.data.[0].sgst", 0),)
    return _.sum(
      cardData.map((res) => {
        // Calculate 18% tax on the product total
        return Number(res.TotalSavings);
      })
    );
  };

  const GET_TOTAL_AMOUNT = () => {
    return GET_SUB_TOTAL() + GET_TAX_TOTAL() + 100;
  };
  const get_delivery_Fee = () => {
    const freeDelivery = cardData.every((item) => item.FreeDelivery);
    console.log(freeDelivery, "freeDelivery");
    
    return freeDelivery ? 0 : 100;
  };

  const GET_PAYABLE_AMOUNT = () => {
    const total = GET_TOTAL_AMOUNT();
    return paymentOption === "half" ? Math.ceil(total * 0.5) : total;
  };

  const handlePlaceOrder = async (values) => {
    try {
      setLoading(true);

      const formValues = await form.validateFields();

      // Determine payment mode from Razorpay response
      const paymentModeMap = {
        card: "card",
        netbanking: "netbanking",
        upi: "upi",
        wallet: "wallet",
      };

      // This would come from the Razorpay response in a real implementation
      // For now, we'll default to 'card' for demo purposes
      const paymentMode = "card"; // Replace with actual payment mode from response

      const invoiceNumber = `INV-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      const orderData = {
        delivery_address: {
          name: formValues.name,
          email: formValues.email,
          mobile_number: formValues.mobile_number,
          alternateMobileNumber: formValues.Alternate_mobile_number,
          street: formValues.street_address,
          pincode: formValues.pincode,
        },
        payment_type: paymentType,
        cart_items: cardData,
        total_price: GET_TOTAL_AMOUNT(),
        gst_no: gstNo,
        payment_id: values.payment_id,
        transaction_id: values.transaction_id,
        payment_status: paymentOption === "full" ? "completed" : "advance_paid",
        payment_amount: values.payment_amount,
        remaining_amount:
          paymentOption === "half"
            ? GET_TOTAL_AMOUNT() - values.payment_amount
            : 0,
        payment_mode: paymentMode,
        invoice_no: invoiceNumber,
      };

      await createOrder(orderData);

      await removeMyShoppingCart({
        ids: cardData.map((item) => item._id),
      });

      CUSTOM_SUCCESS_SWALFIRE_NOTIFICATION({
        title: `Your order has been successfully placed with ${
          paymentOption === "full" ? "full" : "50%"
        } payment`,
        icon: "success",
        confirmButtonText: "My orders",
        cancelButtonText: "Continue Shopping",
      }).then((result) => {
        if (result.isConfirmed) {
          navigation("/account/my-orders");
          window.location.reload();
        } else {
          navigation("/");
          window.location.reload();
        }
      });
      setOrderSuccess(true);
    } catch (err) {
      ERROR_NOTIFICATION(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (values) => {
    try {
      if (!acceptTerms) {
        return CUSTOM_ERROR_NOTIFICATION(
          "Please confirm you have accept our terms and condition"
        );
      }
      if (gstNo && gstNo.length !== 15) {
        return CUSTOM_ERROR_NOTIFICATION("Please Enter Valid GST Number");
      } else if (isEditable) {
        return CUSTOM_ERROR_NOTIFICATION("Please Enter Valid GST Number");
      }

      setLoading(true);

      const payableAmount = Math.round(GET_PAYABLE_AMOUNT() * 100);

      const orderIds = await craeteOrderId({
        payment: payableAmount,
      });

      console.log(orderIds, "order");

      const options = {
        key: EnvHelper.RAZORPAY_KEY,
        key_secret: EnvHelper.RAZORPAY_SECRET_KEY,
        amount: payableAmount,
        currency: "INR",
        order_id: _.get(orderIds, "data.data.id", ""),
        image: ImageHelper.FULL_LOGO,
        handler: async (response) => {
          try {
            if (response.razorpay_payment_id) {
              // Get payment method from response
              const paymentMethod = response.method || "card"; // Default to card if not specified

              const formValues = await form.validateFields();
              await handlePlaceOrder({
                ...formValues,
                payment_id: response.razorpay_payment_id,
                transaction_id: response.razorpay_order_id,
                payment_amount: GET_PAYABLE_AMOUNT(),
                payment_mode: paymentMethod,
              });
            } else {
              throw new Error("Payment failed or was not completed");
            }
          } catch (err) {
            ERROR_NOTIFICATION(
              "Payment verification failed. Please contact support if amount was deducted."
            );
            console.error(err);
          }
        },
        name: "PRINTE",
        prefill: {
          name: _.get(values, "name", ""),
          email: _.get(values, "email", ""),
          contact: _.get(values, "mobile_number", ""),
        },

        modal: {
          ondismiss: function () {
            CUSTOM_ERROR_NOTIFICATION(
              "Payment window was closed. Please try again if you want to proceed with online payment."
            );
          },
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.log(err);
      ERROR_NOTIFICATION(err);
    } finally {
      setLoading(false);
    }
  };

  const [selectedAddress, setSelectedAddress] = useState(0);
  const addresses = _.get(user, "addresses", []);

  useEffect(() => {
    if (addresses[selectedAddress]) {
      form.setFieldsValue({
        ...addresses[selectedAddress],
        mobile_number: addresses[selectedAddress].mobileNumber,
        Alternate_mobile_number:
          addresses[selectedAddress].alternateMobileNumber,
        email: _.get(user, "email", ""),
        street_address: `${addresses[selectedAddress].street},${addresses[selectedAddress].city},${addresses[selectedAddress].state}`,
      });
    }
  }, [selectedAddress, user]);

  const handleEdit = () => {
    if (isEditable) {
      setIsEditable(false);
    } else {
      setIsEditable(true);
    }
  };

  // Format input values with spaces
  const formatMobileNumber = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      // Format as XXX XX XXX XX
      let formattedValue = value;
      if (value.length > 5) {
        formattedValue = `${value.slice(0, 5)} ${value.slice(5)}`;
      }
      if (value.length > 3) {
        formattedValue = `${value.slice(0, 3)} ${value.slice(3)}`;
      }
      e.target.value = formattedValue;
    }
    return e;
  };

  const formatPincode = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      // Format as XXX XXX
      let formattedValue = value;
      if (value.length > 3) {
        formattedValue = `${value.slice(0, 3)} ${value.slice(3)}`;
      }
      e.target.value = formattedValue;
    }
    return e;
  };

  console.log(cardData, "cardData");
  
  return (
    <Spin
      spinning={loading}
      indicator={
        <IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />
      }
    >
      <div className="w-full min-h-screen bg-gray-100 py-4">
        <div className="max-w-[80vw] mx-auto px-4">
          {/* Header */}
          <div className="mb-4">
            <Breadcrumbs
              title={"Shopping cart"}
              title2={"Checkout"}
              titleto={"/shopping-cart"}
              className="mt-2"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Column - Delivery and Payment */}
            <div className="lg:w-2/3 w-full">
              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">1. Delivery Address</h2>
                  {addresses.length > 1 && (
                    <Select
                      value={selectedAddress}
                      onChange={(value) => setSelectedAddress(value)}
                      className="w-40"
                      size="small"
                    >
                      {addresses.map((addr, index) => (
                        <Select.Option key={index} value={index}>
                          Address {index + 1}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </div>

                <Form form={form} layout="vertical" onFinish={handleFinish}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      label="Name"
                      name="name"
                      rules={formValidation("Please Enter Name")}
                    >
                      <Input placeholder="Full name" size="large" />
                    </Form.Item>
                    <Form.Item
                      label="Mobile Number"
                      name="mobile_number"
                      rules={[mobileValidation()]}
                      normalize={(value) => value.replace(/\D/g, "")}
                    >
                      <Input
                        type="tel"
                        placeholder="123 45 678 90"
                        size="large"
                        maxLength={12}
                        onInput={formatMobileNumber}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[emailValidationEnhanced()]}
                    >
                      <Input
                        type="email"
                        placeholder="example@gmail.com"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      label="Alternate Mobile Number"
                      name="Alternate_mobile_number"
                      required={false}
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();

                            const cleanValue = value.replace(/\D/g, "");
                            if (cleanValue.length !== 10) {
                              return Promise.reject(
                                new Error(
                                  "Alternate mobile number must be exactly 10 digits"
                                )
                              );
                            }

                            return Promise.resolve();
                          },
                        },
                      ]}
                      normalize={(value) => value.replace(/\D/g, "")}
                    >
                      <Input
                        type="tel"
                        placeholder="123 45 678 90(optional)"
                        size="large"
                        maxLength={12}
                        onInput={formatMobileNumber}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Street Address"
                      name="street_address"
                      rules={formValidation("Please Enter Street Address")}
                    >
                      <Input.TextArea placeholder="Full address" rows={2} />
                    </Form.Item>
                    <Form.Item
                      label="Pincode"
                      name="pincode"
                      rules={[pincodeValidation()]}
                      normalize={(value) => value.replace(/\D/g, "")}
                    >
                      <Input
                        type="text"
                        placeholder="123 456"
                        size="large"
                        maxLength={7}
                        onInput={formatPincode}
                      />
                    </Form.Item>
                  </div>
                </Form>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
                <h2 className="text-lg font-bold mb-4">2. Payment Method</h2>
                <div className="space-y-3">
                  {PAYMENT_TYPE.map((res, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-3 border rounded-md cursor-pointer ${
                        paymentType === res.name
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => setPaymentType(res.name)}
                    >
                      <div className="mr-3">{res.icon}</div>
                      <div>
                        <div className="font-medium">{res.name}</div>
                        <div className="text-sm text-gray-600">
                          Pay using Razorpay secure payment gateway
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GST Information */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <h2 className="text-lg font-bold mb-4">
                  3. GST Information (Optional)
                </h2>
                <div className="flex items-center gap-2">
                  <Input
                    ref={gstin_ref}
                    value={gstNo}
                    placeholder="Enter GSTIN number"
                    size="large"
                    disabled={!isEditable}
                    onChange={(e) => setGstNo(e.target.value)}
                    maxLength={15}
                  />
                  <Button
                    type={isEditable ? "primary" : "default"}
                    onClick={handleEdit}
                    size="large"
                  >
                    {isEditable ? "Save" : "Edit"}
                  </Button>
                  {isEditable && (
                    <Button
                      type="default"
                      onClick={() => setIsEditable(false)}
                      size="large"
                    >
                      I don't have GSTIN
                    </Button>
                  )}
                </div>
                {gstNo && gstNo.length !== 15 && (
                  <div className="text-red-500 text-sm mt-2">
                    GST number must be exactly 15 characters long.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:w-1/3 w-full">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 sticky top-4">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>

                {/* Order Items */}
                <div className="mb-4">
                  <Table
                    dataSource={cardData}
                    loading={loading}
                    columns={columns}
                    pagination={false}
                    showHeader={false}
                    bordered={false}
                    className="custom-order-table"
                  />
                </div>

                {/* Order Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span>
                      Subtotal
                      <span className="text-sm text-gray-500">
                        ({cardData.length} items)
                      </span>
                      :
                    </span>
                    <span>₹{Number(GET_SUB_TOTAL()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>
                      Taxes{" "}
                      <span className="text-sm text-gray-500">
                        (including SGST & CGST {gstRate * 100}%)
                      </span>
                      :
                    </span>
                    <span>₹{Number(GET_TAX_TOTAL()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Delivery charges</span>
                    <span>₹{Number(get_delivery_Fee()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
                    <span>Order Total:</span>
                    <span>₹{Number(GET_TOTAL_AMOUNT()).toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span>
                      Savings
                      <span className="text-sm text-gray-500">
                        ({cardData.length} items)
                      </span>
                      :
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Saved from MRP </span>
                    <span>₹{Number(GET_Mrp_savings()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Additonal Savings</span>
                    <span>₹{Number(GET_additonal_savings()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
                    <span>Total Savings:</span>
                    <span>
                      ₹
                      {Number(
                        GET_Mrp_savings() + GET_additonal_savings()
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Payment Options:</h3>
                    <Radio.Group
                      value={paymentOption}
                      onChange={(e) => setPaymentOption(e.target.value)}
                      className="w-full "
                    >
                      <div className="grid grid-cols-2 space-y-2">
                        <Radio
                          value="full"
                          className="!flex !items-center !justify-between h-full !py-2 !px-3 !border !rounded-md"
                        >
                          <div>
                            <span className="font-medium">Full Payment</span>
                            <div className="text-sm text-gray-600">
                              Pay the full amount now
                            </div>
                          </div>
                          <span className="font-bold">
                            ₹{Number(GET_TOTAL_AMOUNT()).toFixed(2)}
                          </span>
                        </Radio>
                        <Radio
                          value="half"
                          className="!flex !items-center !justify-between !py-2 h-full !px-3 !border !rounded-md !m-0"
                        >
                          <div>
                            <span className="font-medium">
                              50% Advance Payment
                            </span>
                            <div className="text-sm text-gray-600">
                              Pay half now, rest before production
                            </div>
                          </div>
                          <span className="font-bold">
                            ₹{Number(GET_TOTAL_AMOUNT() * 0.5).toFixed(2)}
                          </span>
                        </Radio>
                      </div>
                    </Radio.Group>
                  </div>
                </div>

                {/* Terms and Place Order */}
                <div className="mt-6">
                  <div className="flex items-center mb-4">
                    <Checkbox
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                    />
                    <span className="ml-2 text-sm" >
                      I agree to the{" "}
                      <a
                        onClick={() => setTermsClick(true)}
                        className="text-blue-600 hover:text-yellow-500 cursor-pointer"
                      >
                        Terms and Conditions
                      </a>
                    </span>
                  </div>

                  <Button
                    block
                    size="large"
                    onClick={() => form.submit()}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:!from-yellow-500 hover:!to-yellow-700 border-none h-12 font-bold hover:shadow-lg hover:!text-white hover:!bg-gradient-to-r"
                    disabled={!acceptTerms}
                  >
                    {paymentOption === "full"
                      ? "Pay Full Amount"
                      : "Pay 50% Advance"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {orderSuccess && (
          <Confetti
            style={{ zIndex: 9999, height: "100%", width: "100%" }}
            friction={0.99}
          />
        )}
      </div>

      {/* Design View Modal */}
      <Modal
        title="Design Preview"
        visible={designModalVisible}
        onCancel={() => setDesignModalVisible(false)}
        footer={null}
        width="80%"
      >
        {selectedProduct && (
          <div className="flex flex-col items-center">
            <img
              src={selectedProduct.product_design_file}
              alt="Design Preview"
              className="max-w-full max-h-[70vh] object-contain"
            />
            <div className="mt-4">
              <h3 className="font-bold">{selectedProduct.product_name}</h3>
              <p>Quantity: {selectedProduct.product_quantity}</p>
            </div>
          </div>
        )}
      </Modal>

      <Drawer
        width={"100%"}
        open={termsClick}
        title={"Terms and Conditions"}
        onClose={() => {
          setTermsClick(false);
        }}
      >
        <Information
          data={termsAndConditions}
          subHeadingAvailable={true}
          breadcrumbs={true}
        />
      </Drawer>

      <style jsx global>{`
        .custom-order-table .ant-table-tbody > tr > td {
          padding: 12px 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        .custom-order-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none;
        }
        @media (max-width:1290px) {
 .razorpay-container{
   margin-top:60vh;
} 
      }
        /* Razorpay full screen styling */
        .razorpay-container {
          
          height: 100vh !important;
          position: sticky !important;
          top: 0 !important;
          bottom:0 !important;
          left: 0 !important;
          z-index: 9999 !important;
        }
      `}</style>
    </Spin>
  );
};

export default NewCheckout;
