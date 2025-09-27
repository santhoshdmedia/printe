import axios from "axios";
import { authToken } from "../redux/middleware";
import { EnvHelper } from "./EnvHelper";
const baseURL = EnvHelper.BASE_API_URL;
export const PUBLIC_URL = EnvHelper.CUSTOMER_URL;

const custom_axios = axios.create();

custom_axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(authToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllBlogs = async () => {
  return await custom_axios.get(`${baseURL}/client_user/get_all_blogs`);
};

export const sendForgetPassowrdMail = async (formData) => {
  return await axios.post(`${baseURL}/mail/send_forgetpassoword_mail`, formData);
};
export const googleLogin = async (formData) => {
  try {
    const response = await axios.post(`${baseURL}/client_user/google_login`, formData);
    return response;
  } catch (error) {
    console.error("Google login API error:", error);
    throw error;
  }
};

export const resetPassword = async (formdata) => {
  return await axios.post(`${baseURL}/mail/reset_password`, formdata);
};

export const verfiyLink = async (id) => {
  return await axios.get(`${baseURL}/mail/verfiy_link/${id}`);
};

// category products

export const getAllCategoryProducts = async (id) => {
  return await axios.get(`${baseURL}/category/get_all_product_category/${id}`);
};

export const getAllSubCategoryProducts = async (id) => {
  return await axios.get(`${baseURL}/category/get_all_sub_category_product/${id}`);
};

// help center
export const helpcenter = async (formdata) => {
  return await axios.post(`${baseURL}/help/enquire_detals`, formdata);
};

// review api
export const deleteMyReview = async (id) => {
  return await custom_axios.delete(`${baseURL}/review/delete_my_review/${id}`);
};

export const updateMyReview = async (id, formData) => {
  return await custom_axios.put(`${baseURL}/review/update_my_review/${id}`, formData);
};

// order id
export const craeteOrderId = async (formdata) => {
  return await axios.post(`${baseURL}/mail/order_id`, formdata);
};

// similar products
export const getRelateProducts = async (id) => {
  return await axios.get(`${baseURL}/product/get_similar_products/${id}`);
};

// custom home page
export const getCustomHomeSections = async (id = "null") => {
  return await custom_axios.get(`${baseURL}/home/get_all_customerSection/${id}`);
};

// add to history
export const addTohistory = async (formData) => {
  return await custom_axios.post(`${baseURL}/client_user/add_to_history`, formData);
};

export const getHistoryProducts = async () => {
  return await custom_axios.get(`${baseURL}/product/get_history_products`);
};

export const getBannerProducts = async (id) => {
  return await custom_axios.get(`${baseURL}/product/get_banner_products/${id}`);
};

// cart
export const addToShoppingCart = async (cartData) => {
  return await custom_axios.post(`${baseURL}/shopping/add_to_cart`, cartData);
};

export const getMyShoppingCart = async () => {
  return await custom_axios.get(`${baseURL}/shopping/get_my_cart`);
};

export const mergeCart=async (cartData)=>{
  return await custom_axios.post(`${baseURL}/shopping/merge_cart`, cartData);
}

export const removeMyShoppingCart = async (data) => {
  // Handle both cases: single ID string or array of IDs
  const requestData = typeof data === 'string' ? { ids: [data] } : data;
  return await custom_axios.post(`${baseURL}/shopping/remove_my_cart`, requestData);
};

// order
export const createOrder = async (formData) => {
  return await custom_axios.post(`${baseURL}/order/create_order`, formData);
};


// bulk
export const bulkOrder = async (formData) => {
  return await custom_axios.post(`${baseURL}/bulk/add_bulk`, formData);
};
// products descriptions
export const getProductDescription = async (id) => {
  return await axios.get(`${baseURL}/product/get_product_descriptions/${id}`);
};

export const getVariantPrice = async (id, key) => {

  return await axios.post(`${baseURL}/product/get_variant_price/${id}`, key);
};

export const getsubcat = async () => {
  return await axios.get(`${baseURL}/category/get_sub_category`);
};

//payment
export const createOrderId = (data) => {
  return axios.post('/api/razorpay/create-order', data);
};

export const verifyPayment = (data) => {
  return axios.post('/api/razorpay/verify-payment', data);
};