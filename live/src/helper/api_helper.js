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

export const generateGuestId = () => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getGuestId = () => {
  let guestId = localStorage.getItem('guestId');
  
  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem('guestId', guestId);
  }
  
  return guestId;
};

export const clearGuestId = () => {
  localStorage.removeItem('guestId');
};

// Shopping Cart APIs
export const addToShoppingCart = async (cartData) => {
  const guestId = getGuestId();
  const payload = {
    ...cartData,
    guestId: guestId
  };
  
  return await custom_axios.post(`${baseURL}/shopping/add_to_cart`, payload);
};

export const getMyShoppingCart = async () => {
  const guestId = getGuestId();
  return await custom_axios.get(`${baseURL}/shopping/get_my_cart`, {
    params: { guestId }
  });
};

export const mergeCart = async (cartData) => {
  const guestId = getGuestId();
  const payload = {
    ...cartData,
    guestId: guestId
  };
  
  return await custom_axios.post(`${baseURL}/shopping/merge_cart`, payload);
};

export const removeMyShoppingCart = async (data) => {
  const guestId = getGuestId();
  const requestData = typeof data === 'string' ? { ids: [data] } : data;
  
  return await custom_axios.post(`${baseURL}/shopping/remove_my_cart`, {
    ...requestData,
    guestId: guestId
  });
};

export const updateCartItemQuantity = async (itemId, quantity) => {
  const guestId = getGuestId();
  return await custom_axios.post(`${baseURL}/shopping/update_cart_quantity`, {
    itemId,
    quantity,
    guestId
  });
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
// otp
export const sendOtp = async (formdata) => {
  return await axios.post(`${baseURL}/otp/send_otp`, formdata);
};

export const verifyOtp = async (formdata) => {
  return await axios.post(`${baseURL}/otp/verify_otp`, formdata);
};
export const resendOtp = async (formdata) => {
  return await axios.post(`${baseURL}/otp/resend_otp`, formdata);
};

// whatsapp
export const sendWhatsAppOtp = async (formdata) => {
  return await axios.post(`${baseURL}/whatsapp/send_otp`, formdata);
}
export const verifyWhatsAppOtp = async (formdata) => {
  return await axios.post(`${baseURL}/whatsapp/verify_otp`, formdata);
}
export const resendWhatsAppOtp = async (formdata) => {
  return await axios.post(`${baseURL}/whatsapp/resend_otp`, formdata);
}

// coupen
export const applyCouponCode = async (formdata) => {
  return await axios.post(`${baseURL}/coupen/apply`, formdata);
}
export const getAvailableCoupons = async (formdata) => {
  return await axios.get(`${baseURL}/whatsapp/resend_otp`, formdata);
}
// ========== CATEGORY APIs ==========
export const getSubcategoryBySlug = async (slug) => {
  try {
    const response = await custom_axios.get(`${baseURL}/category/client/sub-category/${slug}`);
    return response;
  } catch (error) {
    console.error("Error fetching subcategory by slug:", error);
    throw error;
  }
};

export const getSubcategoryProductsBySlug = async (slug) => {
  try {
    const response = await custom_axios.get(`${baseURL}/category/client/sub-category/${slug}/products`);
    return response;
  } catch (error) {
    console.error("Error fetching subcategory products by slug:", error);
    throw error;
  }
};

export const getSubcategoriesByMainCategorySlug = async (mainCategorySlug) => {
  try {
    const response = await custom_axios.get(`${baseURL}/category/client/main-category/${mainCategorySlug}/products`);
    return response;
  } catch (error) {
    console.error("Error fetching subcategories by main category slug:", error);
    throw error;
  }
};



export const getAllCategories = async () => {
  try {
    const response = await custom_axios.get(`${baseURL}/category/client/main-categories`);
    return response;
  } catch (error) {
    console.error("Error fetching all categories:", error);
    throw error;
  }
};

export const getCategoryBySlug = async (slug) => {
  try {
    const response = await custom_axios.get(`${baseURL}/category/client/main-category/${slug}`);
    return response;
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    throw error;
  }
};











//payment
export const createOrderId = (data) => {
  return axios.post('/api/razorpay/create-order', data);
};

export const verifyPayment = (data) => {
  return axios.post('/api/razorpay/verify-payment', data);
};