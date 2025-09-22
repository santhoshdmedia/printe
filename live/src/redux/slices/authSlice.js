import { createSlice } from "@reduxjs/toolkit";
import { message } from "antd";

const initialState = {
  isAuth: false,
  isAuthenicating: true,
  isUserUpdating: false,
  isUserDeleting: false,
  user: {
    _id: null,
    email: "",
    role: "",
    name: "",
    wish_list: [],
  },
  wish_list: {
    loading: false,
    data: [],
  },
  my_orders: {
    loading: false,
    data: [],
  },
  order_details: {
    loading: false,
    data: {
      _id: "",
      user_id: "",
      products: {
        product_image: "",
        product_design_file: "",
        product_name: "",
        product_price: 0,
        product_variants: {
          Type: "",
          Finish: "",
          Material: "",
          Lamination: "",
        },
        product_quantity: 0,
      },
      deliveryAddress: {
        name: "",
        mobileNumber: "",
        street: "",
        locality: "",
        city: "",
        state: "",
        addressType: "",
        pincode: "",
        _id: "",
      },
      sgst: 0,
      cgst: 0,
      invoice_no: "",
      delivery_price: "",
      order_status: "",
      notes: " ",
      total_price: 0,
      payment_method: "",
      createdAt: "",
    },
  },
  isSigningUp: false,
  isLogingIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authenticatingStarted: (state) => {
      state.isAuthenicating = true;
    },
    authenticatingSuccess: (state, action) => {
      state.isAuthenicating = false;
      state.isAuth = true;
      state.user = action.payload;
    },
    authenticatingFailed: (state) => {
      state.isAuthenicating = false;
    },
    isLogInStarted: (state) => {
      state.isLogingIn = true;
    },
    isLogInSuccess: (state, action) => {
      state.isAuth = true;
      state.isLogingIn = false;
      state.user = action.payload.data;
      message.success({
        key: "login",
        content: action.payload.message,
      });
    },
    isLogInFailed: (state, action) => {
      state.isLogingIn = false;
      message.error({
        key: "login",
        content: action.payload,
        duration: 0,
        onClick(e) {
          message.destroy("login");
        },
      });
    },
    isSignUpStarted: (state) => {
      state.isSigningUp = true;
    },
 isSignUpSuccess: (state, action) => {
  state.isAuth = true;
  state.isSigningUp = false;
  state.user = action.payload.data._doc;
  // Save token if present
  if (action.payload.data.token) {
    saveTokenToLocalStorage(action.payload.data.token);
  }
  message.success("...");
},
    isSignUpFailed: (state, action) => {
      state.isSigningUp = false;
      message.error({
        key: "sign-up",
        content: action.payload,
        duration: 0,
        onClick(e) {
          message.destroy("sign-up");
        },
      });
    },
    logoutSuccess: (state) => {
      state.user = {
        _id: null,
        email: "",
        role: "",
        name: "",
        wish_list: [],
      };
      state.isAuth = false;
    },
    updatingUserStarted: (state) => {
      state.isUserUpdating = true;
    },
    updatingUserSuccess: (state, action) => {
      state.isUserUpdating = false;
      state.user = action.payload.data;
      message.success({
        key: "user-updating",
        content: action.payload.message,
      });
    },
    updatingUserFailed: (state, action) => {
      state.isUserUpdating = false;
      message.error({
        key: "user-updating",
        content: action.payload.message,
        duration: 0,
        onClick(e) {
          message.destroy("user-updating");
        },
      });
    },
    deletingUserStarted: (state) => {
      state.isUserDeleting = true;
    },
    deletingUserSuccess: (state, action) => {
      state.isUserDeleting = false;
      message.success({
        key: "user-deleting",
        content: action.payload.message,
      });
    },
    deletingUserFailed: (state, action) => {
      state.isUserDeleting = false;
      message.error({
        key: "user-deleting",
        content: action.payload.message,
        duration: 0,
        onClick(e) {
          message.destroy("user-deleting");
        },
      });
    },
    gettingWishListStarted: (state) => {
      state.wish_list.loading = true;
    },
    gettingWishListSuccess: (state, action) => {
      state.wish_list = {
        loading: false,
        data: action.payload,
      };
    },
    gettingWishListFailed: (state) => {
      state.wish_list.loading = false;
    },
    gettingMyOrdersStarted: (state) => {
      state.my_orders.loading = true;
    },
    gettingMyOrdersSuccess: (state, action) => {
      state.my_orders = {
        loading: false,
        data: action.payload,
      };
    },
    gettingMyOrdersFailed: (state) => {
      state.my_orders.loading = false;
    },
    gettingOrderDetailsStated: (state) => {
      state.order_details.loading = false;
    },
    gettingOrderDetailsSuccess: (state, action) => {
      state.order_details = {
        loading: false,
        data: action.payload,
      };
    },
    gettingOrderDetailsFailed: (state, ) => {
      state.order_details.loading = false;
      message.error({
        key: "order-details",
        content: "Some thing went wrong please try again",
        duration: 3,
      });
    },
  },
});

export default authSlice.reducer;
export const {
  isLogInFailed,
  isLogInStarted,
  isLogInSuccess,
  isSignUpFailed,
  isSignUpStarted,
  isSignUpSuccess,
  authenticatingFailed,
  authenticatingStarted,
  authenticatingSuccess,
  gettingWishListFailed,
  gettingWishListStarted,
  gettingWishListSuccess,
  updatingUserFailed,
  updatingUserStarted,
  updatingUserSuccess,
  deletingUserFailed,
  deletingUserStarted,
  deletingUserSuccess,
  logoutSuccess,
  gettingMyOrdersFailed,
  gettingMyOrdersStarted,
  gettingMyOrdersSuccess,
  gettingOrderDetailsFailed,
  gettingOrderDetailsStated,
  gettingOrderDetailsSuccess,
} = authSlice.actions;
