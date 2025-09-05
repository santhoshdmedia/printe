import { Checkbox, Collapse, Divider, message, Modal, Radio, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { IconHelper } from "../../helper/IconHelper";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PaymentMethod from "../../components/CheckOut/PaymentMethod";
import CheckOutProduct from "../../components/CheckOut/CheckOutProduct";
import DeliveryAddress from "../../components/CheckOut/DeliveryAddress";
import { useDispatch, useSelector } from "react-redux";
import TextArea from "antd/es/input/TextArea";
import { ImageHelper } from "../../helper/ImageHelper";
import Confetti from "react-confetti";
import { setCreatingOrderSuccessModal } from "../../redux/slices/publicSlice";
import AddressModal from "../../components/Account/AddressModal";
import { EnvHelper } from "../../helper/EnvHelper";
import Razorpay from "react-razorpay/dist/razorpay";
import { craeteOrderId } from "../../helper/api_helper";
import _ from "lodash";

const CheckOut = () => {
  const location = useLocation();
  const { checkOutState } = location.state || {};

  //config
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //redux
  const { user, isAuth, isAuthenicating } = useSelector((state) => state.authSlice);
  const { isCreatingOrder, creatingOrderSuccessModal } = useSelector((state) => state.publicSlice);
  const { addresses = [] } = user;

  //state
  const initialCreateOrderState = {
    products: checkOutState,
    user_id: user._id ?? "",
    delivery_address: {
      name: "",
      mobileNumber: "",
      street: "",
      locality: "",
      city: "",
      state: "",
      addressType: "",
      pincode: "",
    },
    payment_method: "cash-on-payment",
    notes: "",
    cgst: 0,
    sgst: 0,
    delivery_price: 100,
    total_price: 0,
  };
  const [createOrder, setCreateOrder] = useState(initialCreateOrderState);
  const [teamsAndConditionsBox, setTeamsAndConditionsBox] = useState(false);
  const [teamsAndConditionsBoxError, setTeamsAndConditionsBoxError] = useState(false);
  const [designVerificationStatus, setDesignVerificationStatus] = useState(false);
  const [designVerificationError, setDesignVerificationError] = useState(false);
  const [isDeliveryAddressModalOpen, setIsDeliveryAddressModalOpen] = useState(false);

  //Mount
  useEffect(() => {
    const product_price = checkOutState?.product_price ?? 0;
    const cgst = Number(((product_price / 100) * 0.4).toFixed(2));
    const sgst = Number(((product_price / 100) * 0.4).toFixed(2));
    const delivery = Number((100).toFixed(2));
    const total_price = Number((product_price + cgst + sgst + createOrder.delivery_price).toFixed(2));

    setCreateOrder((prev) => ({
      ...prev,
      cgst,
      sgst,
      total_price,
    }));
  }, [checkOutState]);

  useEffect(() => {
    if (user) setCreateOrder((prev) => ({ ...prev, user_id: user?._id ?? "" }));
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isAuth) navigate("/login");
  }, [isAuth]);

  //function
  const handleOnChangeTeamAndConditionBox = (e) => {
    const { checked } = e.target;
    setTeamsAndConditionsBox(checked);
    if (checked) setTeamsAndConditionsBoxError(false);
  };
  const handleOnChangeDesignVerificationStatus = (e) => {
    const { checked } = e.target;
    setDesignVerificationStatus(checked);
    if (checked) setDesignVerificationError(false);
  };

  const handleViewOrder = () => {
    navigate("/account/my-orders", { replace: true });
    dispatch(setCreatingOrderSuccessModal(false));
  };

  const handleContinueShopping = () => {
    navigate("/", { replace: true });
    dispatch(setCreatingOrderSuccessModal(false));
  };

  const handleCancelAddDeliveryAddressModal = () => {
    setIsDeliveryAddressModalOpen(false);
  };

  const handleOnlinePayment = async () => {
    try {
      const order_ids = await craeteOrderId({ payment: _.get(createOrder, "total_price", 0) * 100 });

      const options = {
        key: EnvHelper.RAZORPAY_KEY,
        key_secret: EnvHelper.RAZORPAY_SECRET_KEY,
        amount: _.get(createOrder, "total_price", 0) * 100,
        currency: "INR",
        order_id: _.get(order_ids, "data.data.id", ""),
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvf98n7jLZJebG67Y-eQCfBHpalvx8BGydzQ&s",
        handler: async () => {
          dispatch({ type: "CREATE_ORDER", data: { order: createOrder } });
        },
        name: "PRINTE",
        prefill: {
          name: _.get(user, "name", ""),
          email: _.get(user, "email", ""),
          contact: _.get(user, "addresses[0].mobileNumber", ""),
        },
        theme: {
          color: "green",
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.log(err);
    }
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    // console.log(teamsAndConditionsBox);
    if (!designVerificationStatus) {
      setDesignVerificationError(true);
      message.warning("Please verify the product design");
    }

    if (!teamsAndConditionsBox) {
      setTeamsAndConditionsBoxError(true);
      message.warning("Please read and agree to the website Teams & Conditions");
    }

    if (teamsAndConditionsBox && designVerificationStatus) {
      if (createOrder.payment_method === "online-payment") handleOnlinePayment();
      else dispatch({ type: "CREATE_ORDER", data: { order: createOrder } });
    }
  };

  //rendering data

  return (
    <>
      <div className="flex gap-5 py-5 px-40 ">
        <div className="flex-1">
          <Spin spinning={isCreatingOrder}>
            <form onSubmit={handleOnSubmit} className="flex flex-col flex-1 gap-5 ">
              <Collapse
                className="!rounded-none"
                defaultActiveKey={["1"]}
                items={[
                  {
                    key: "1",
                    label: <h1 className="sub_title">Delivery Address</h1>,
                    children: <DeliveryAddress userAddresses={addresses} setCreateOrder={setCreateOrder} setIsDeliveryAddressModalOpen={setIsDeliveryAddressModalOpen} />,
                    showArrow: false,
                    extra: <Checkbox checked={true} />,
                  },
                ]}
              />
              <Collapse
                className="!rounded-none "
                defaultActiveKey={["1"]}
                items={[
                  {
                    key: "1",
                    label: <h1 className="sub_title ">Verifying Product Details</h1>,
                    children: <CheckOutProduct products={checkOutState} />,
                    showArrow: false,
                    extra: (
                      <div className="flex gap-2">
                        <Checkbox checked={designVerificationStatus} onChange={handleOnChangeDesignVerificationStatus} />
                        <h1 className={`${designVerificationError ? "block animate-bounce" : "hidden"} bg-red-500 border rounded-md p-1`}>Please verify</h1>
                      </div>
                    ),
                  },
                ]}
              />
              <Collapse
                className="!rounded-none"
                defaultActiveKey={["1"]}
                items={[
                  {
                    key: "1",
                    label: <h1 className="sub_title"> Payment Method</h1>,
                    children: <PaymentMethod setCreateOrder={setCreateOrder} />,
                    showArrow: false,
                    extra: <Checkbox checked={true} />,
                  },
                ]}
              />
              <Collapse
                className="!rounded-none"
                defaultActiveKey={["1"]}
                items={[
                  {
                    key: "1",
                    label: <h1 className="sub_title">Addition Information</h1>,
                    children: (
                      <TextArea
                        placeholder="Additional Information for your order (Optional)"
                        onChange={(e) =>
                          setCreateOrder((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                      />
                    ),
                    showArrow: false,
                    extra: (
                      <button type="button">
                        <IconHelper.PLUS_ICON />
                      </button>
                    ),
                  },
                ]}
              />
              <div className="flex flex-col gap-3">
                <Checkbox checked={teamsAndConditionsBox} onChange={handleOnChangeTeamAndConditionBox} className={`${teamsAndConditionsBoxError ? "animate-bounce" : ""}`}>
                  I have read and agree to the website{" "}
                  <Link to={"/terms-&-conditions"} className="text-primary">
                    {" "}
                    Terms And Conditions
                  </Link>
                </Checkbox>
                <button className="button" type="submit">
                  Place Order
                </button>
              </div>
            </form>
          </Spin>
        </div>

        <div className="borded sticky top-20 w-[24rem] flex h-fit flex-col gap-5 shadow-md rounded-md p-5">
          <h1 className="text-primary sub_title">Price Details</h1>
          <Divider variant="dashed" className="!m-0" style={{ backgroundColor: "#6B21A8" }} />

          <ul className="flex flex-col gap-2 para">
            <li className="flex gap-3 justify-between items-center">
              <h5> Product Price</h5>
              <span>Rs. {checkOutState?.product_price ?? 0}</span>
            </li>
            <li className="flex gap-3 justify-between items-center">
              <h5> CGST (4%)</h5>
              <span>Rs. {createOrder.cgst}</span>
            </li>
            <li className="flex gap-3 justify-between items-center">
              <h5> SGST (4%)</h5>
              <span>Rs. {createOrder.sgst}</span>
            </li>
            <li className="flex gap-3 justify-between items-center">
              <h5> Delivery Amount</h5>
              <span>Rs. {createOrder.delivery_price}</span>
            </li>
          </ul>
          <Divider variant="dashed" className="!m-0" style={{ backgroundColor: "#6B21A8" }} />
          <div className=" sub_title gap-3 flex justify-between items-center">
            <h1 className="">Total Amount</h1>
            <span>Rs. {createOrder?.total_price ?? 0}</span>
          </div>
          <Divider variant="dashed" className="!m-0" style={{ backgroundColor: "#6B21A8" }} />
        </div>
      </div>
      {creatingOrderSuccessModal && <Confetti style={{ zIndex: 9999, height: "100%", width: "100%" }} friction={0.99} />}
      <Modal open={creatingOrderSuccessModal} footer={false} closable={false}>
        <div className="flex flex-col items-center justify-center space-y-6 p-6 bg-gray-50">
          <div className="h-80 w-80">
            <img src={ImageHelper.ORDER_SUCCESS} alt="Order Successful Illustration" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Thank You for Your Order!</h1>
          <p className="text-center text-gray-600">We appreciate your business. Your order has been placed successfully. A confirmation email will be sent shortly.</p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-primary text-white font-medium rounded-md shadow hover:bg-primary-dark" onClick={handleViewOrder}>
              View Order
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-md shadow hover:bg-gray-200" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      </Modal>
      {isDeliveryAddressModalOpen && <AddressModal handleCancel={handleCancelAddDeliveryAddressModal} modalType={"Delivery"} />}
    </>
  );
};

export default CheckOut;
