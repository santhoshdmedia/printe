import { call, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import { authenticatingFailed, authenticatingStarted, authenticatingSuccess, deletingUserFailed, deletingUserStarted, deletingUserSuccess, gettingMyOrdersFailed, gettingMyOrdersStarted, gettingMyOrdersSuccess, gettingOrderDetailsFailed, gettingOrderDetailsStated, gettingOrderDetailsSuccess, gettingWishListFailed, gettingWishListStarted, gettingWishListSuccess, isLogInFailed, isLogInStarted, isLogInSuccess, isSignUpFailed, isSignUpStarted, isSignUpSuccess, logoutSuccess, updatingUserStarted, updatingUserSuccess } from "./slices/authSlice";
import axios from "axios";
import { addingProductRateAndReviewFailed, addingProductRateAndReviewStarted, addingProductRateAndReviewSuccess, creatingOrderFailed, creatingOrderStarted, creatingOrderSuccess, deletingFileFailed, deletingFileStarted, deletingFileSuccess, gettingAllCategoryFailed, gettingAllCategoryStated, gettingAllCategorySuccess, gettingBannersFailed, gettingBannersStarted, gettingBannersSucess, gettingMenuFailed, gettingMenuStarted, gettingMenuSuccess, gettingNewLaunchProductFailed, gettingNewLaunchProductStarted, gettingNewLaunchProductSuccess, gettingOnlyForTodayProductFailed, gettingOnlyForTodayProductStarted, gettingOnlyForTodayProductSuccess, gettingPopularProductFailed, gettingPopularProductStarted, gettingPopularProductSuccess, gettingProductFailed, gettingProductListStarted, gettingProductListSuccess, gettingProductRateAndReviewFailed, gettingProductRateAndReviewStarted, gettingProductRateAndReviewSuccess, gettingProductStarted, gettingProductSuccess, gettingSubCategoryProductsFailed, gettingSubCategoryProductsStarted, gettingSubCategoryProductsSuccess, gettingVariantPriceFailed, gettingVariantPriceStarted, gettingVariantPriceSuccess, searchingProductsFailed, searchingProductsStarting, searchingProductsSuccess, uploadingFileFailed, uploadingFileStarted, uploadingFileSuccess } from "./slices/publicSlice";
import _ from "lodash";
import { EnvHelper } from "../helper/EnvHelper";

const baseURL = EnvHelper.BASE_API_URL;
const UPLOAD_BASE_URL = EnvHelper.UPLOAD_BASE_API_URL;
export const authToken = "authToken";

const saveTokenToLocalStorage = (token) => {
  localStorage.setItem(authToken, token);
};

const custom_request = axios.create();

custom_request.interceptors.request.use((config) => {
  const token = localStorage.getItem(authToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function* logIn(action) {
  try {
    yield put(isLogInStarted());
    const res = yield call(axios.post, `${baseURL}/client_user/login`, action.data);
    yield call(saveTokenToLocalStorage, _.get(res, "data.data.token", ""));
    yield put(isLogInSuccess(res.data));
  } catch (err) {
    yield put(isLogInFailed(err.response.data.message));
    console.log(err);
  }
}

function* signUp(action) {
  try {
    yield put(isSignUpStarted());
    const res = yield call(axios.post, `${baseURL}/client_user/signup`, action.data);

    yield call(saveTokenToLocalStorage, _.get(res, "data.data.token", ""));
    yield put(isSignUpSuccess(_.get(res, "data", { _doc: {}, message: "" })));
  } catch (err) {
    yield put(isSignUpFailed(_.get(err, "response.data.message", "")));
    console.log(err);
  }
}

function* checkLogin() {
  try {
    yield put(authenticatingStarted());
    const res = yield call(custom_request.get, `${baseURL}/client_user/check_login`);    
    const user = _.get(res, "data.data", {});
    
    if (_.isEmpty(user)) {
      localStorage.removeItem(authToken);
    } else {
      // Store user data in localStorage when available
      localStorage.setItem('userData', JSON.stringify(user.role));
    }
    
    yield put(authenticatingSuccess(user));
  } catch (err) {
    console.log(err);
    localStorage.removeItem(authToken);
    // Also clear user data on error
    localStorage.removeItem('userData');
    yield put(authenticatingFailed());
  }
}

function* logOut() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  sessionStorage.removeItem("reloaded");
  yield put(logoutSuccess());
}

function* updateUser(action) {
  const { form, type = "", message = "" } = action.data;
  const { user } = yield select((state) => state.authSlice);
  try {
    yield put(updatingUserStarted());
    const res = yield call(axios.put, `${baseURL}/client_user/update_client_user/${user._id}`, form);
    if (type === "custom")
      yield put(
        updatingUserSuccess({
          message,
          data: { ...user, ...form },
        })
      );
    else
      yield put(
        updatingUserSuccess({
          message: "User Updated",
          data: _.get(res, "data.data", {}),
        })
      );
  } catch (error) {
    console.log(error);
  }
}

function* deleteUser(action) {
  const { password } = action.data;
  try {
    yield put(deletingUserStarted());
    const res = yield call(custom_request.post, `${baseURL}/client_user/delete_client_user`, { password });
    localStorage.removeItem("authToken");
    yield put(deletingUserSuccess(_.get(res, "data", { message: "" })));
    yield put(logoutSuccess());
  } catch (error) {
    console.log(error);
    yield put(deletingUserFailed(_.get(error, "response.data", { message: "" })));
  }
}

function* getMenu() {
  try {
    yield put(gettingMenuStarted());
    const res = yield call(axios.get, `${baseURL}/category/get_all_category`);
    yield put(gettingMenuSuccess(_.get(res, "data.data", [])));
  } catch (error) {
    console.log(error);
    yield put(gettingMenuFailed());
  }
}

function* getAllCategory() {
  try {
    yield put(gettingAllCategoryStated());
    const result = yield call(axios.get, `${baseURL}/category/get_sub_category`);

    yield put(gettingAllCategorySuccess(result.data));
  } catch (error) {
    console.log(error);
    yield put(gettingAllCategoryFailed(error.message));
  }
}

function* getHighlightedProducts(action) {
  const { newArrival = false, popular = false, onlyForToday = false } = action.data;
  const isNewLaunch = newArrival ? "NewLaunch" : popular ? "Popular" : onlyForToday ? "OnlyForToday" : null;

  try {
    if (isNewLaunch) {
      yield put(
        {
          NewLaunch: gettingNewLaunchProductStarted,
          Popular: gettingPopularProductStarted,
          OnlyForToday: gettingOnlyForTodayProductStarted,
        }[isNewLaunch]()
      );
    }

    const result = yield call(axios.get, `${baseURL}/product/get_product`, {
      params: action.data,
    });

    const data = _.get(result, "data.data", []);
    if (isNewLaunch) {
      yield put(
        {
          NewLaunch: gettingNewLaunchProductSuccess,
          Popular: gettingPopularProductSuccess,
          OnlyForToday: gettingOnlyForTodayProductSuccess,
        }[isNewLaunch](data)
      );
    }
  } catch (error) {
    if (isNewLaunch) {
      yield put(
        {
          NewLaunch: gettingNewLaunchProductFailed,
          Popular: gettingPopularProductFailed,
          OnlyForToday: gettingOnlyForTodayProductFailed,
        }[isNewLaunch]()
      );
    }
  }
}

function* getProduct(action) {
  const { type = "", id_list, id = "", search = "" } = action.data;
  try {
    if (type === "wish_list") yield put(gettingWishListStarted());
    else if (type === "product_list") yield put(gettingProductListStarted());
    else if (type === "search_products") yield put(searchingProductsStarting());
    else yield put(gettingProductStarted());

    const res = yield call(axios.get, `${baseURL}/product/get_product/${id}`, {
      params: {
        search,
        id_list: JSON.stringify(id_list),
      },
    });
    if (type === "wish_list") yield put(gettingWishListSuccess(_.get(res, "data.data", [])));
    else if (type === "product_list") yield put(gettingProductListSuccess(_.get(res, "data.data", [])));
    else if (type === "search_products") yield put(searchingProductsSuccess(_.get(res, "data.data", [])));
    else yield put(gettingProductSuccess(_.get(res, "data.data[0]", {})));
  } catch (error) {
    console.log(error);
    if (type === "wish_list") yield put(gettingWishListFailed());
    else if (type === "search_products") yield put(searchingProductsFailed());
    else yield put(gettingProductFailed());
  }
}

function* getVariantPrice(action) {
  const { key, _id } = action.data;
  try {
    yield put(gettingVariantPriceStarted());
    const res = yield call(axios.get, `${baseURL}/product/get_variant_price/${_id}`, {
      params: { key },
    });
    yield put(gettingVariantPriceSuccess(_.get(res, "data.data", { price: "N/A" })));
  } catch (error) {
    yield put(gettingVariantPriceFailed());
  }
}

function* getSubCategoryProducts(action) {
  const { id } = action.data;
  try {
    yield put(gettingSubCategoryProductsStarted());
    const res = yield call(axios.get, `${baseURL}/category/get_all_sub_product_category/${id}`);
    yield put(gettingSubCategoryProductsSuccess(_.get(res, "data.data[0]", [])));
  } catch (error) {
    console.log(error);
    yield put(gettingSubCategoryProductsFailed());
  }
}

function* uploadImage(action) {
  const { file, handleUploadImage } = action.data;
  const formData = new FormData();
  formData.append("image", file);
  try {
    yield put(uploadingFileStarted());
    const res = yield call(axios.post, `${UPLOAD_BASE_URL}/upload_images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    handleUploadImage(_.get(res, "data.data.url", ""));
    yield put(uploadingFileSuccess());
  } catch (error) {
    console.log(error);
    yield put(uploadingFileFailed());
  }
}

function* deleteImage(action) {
  const { imageId, handleDeleteImage } = action.data;
  try {
    yield put(deletingFileStarted());

    const res = yield call(axios.delete, `${UPLOAD_BASE_URL}/images/${imageId}`);

    if (res.status === 200) {
      handleDeleteImage(imageId);
      yield put(deletingFileSuccess());
    } else {
      yield put(deletingFileFailed());
    }
  } catch (error) {
    console.log(error);
    yield put(deletingFileFailed());
  }
}

function* createOrder(action) {
  const { order } = action.data;
  try {
    yield put(creatingOrderStarted());
    const result = yield call(custom_request.post, `${baseURL}/order/create_order`, order);
    yield put(creatingOrderSuccess());
  } catch (error) {
    yield put(creatingOrderFailed(_.get(error, "response.data", { message: "" })));
  }
}

function* getMyOrder() {
  try {
    yield put(gettingMyOrdersStarted());
    const res = yield call(custom_request.get, `${baseURL}/order/collect_my_orders`);
    yield put(gettingMyOrdersSuccess(_.get(res, "data.data", [])));
  } catch (error) {
    console.log(error);
    yield put(gettingMyOrdersFailed());
  }
}

function* getOrderDetail(action) {
  const filter = JSON.stringify(action.data);

  try {
    yield put(gettingOrderDetailsStated());
    const result = yield call(custom_request.get, `${baseURL}/order/collect_all_orders/${filter}`);

    yield put(gettingOrderDetailsSuccess(_.get(result, "data.data[0]", {})));
  } catch (error) {
    console.log(error);
    yield put(gettingOrderDetailsFailed(_.get(error, "response.data.message", "")));
  }
}

function* getBanners() {
  try {
    yield put(gettingBannersStarted());
    const res = yield call(axios.get, `${baseURL}/client_banner/get_all_banners`);

    yield put(gettingBannersSucess(_.get(res, "data.data", [])));
  } catch (error) {
    console.log(error);
    yield put(gettingBannersFailed());
  }
}

function* getProductReview(action) {
  const { id } = action.data;
  try {
    yield put(gettingProductRateAndReviewStarted());
    const res = yield call(axios.get, `${baseURL}/client_review/get_productreview/${id}`);
    yield put(gettingProductRateAndReviewSuccess(_.get(res, "data.data", [])));
    console.log(res);
  } catch (error) {
    console.log(error);
    yield put(gettingProductRateAndReviewFailed());
  }
}

function* addProductReview(action) {
  try {
    yield put(addingProductRateAndReviewStarted());
    yield call(custom_request.post, `${baseURL}/client_review/add_review`, action.data);
    // console.log("success");
    yield put(addingProductRateAndReviewSuccess());
  } catch (error) {
    console.log(error);
    yield put(addingProductRateAndReviewFailed(_.get(error, "response.data.message", "Some thing went wrong. Please try again")));
  }
}

function* rootSaga() {
  yield takeLatest("LOGIN", logIn);
  yield takeLatest("SIGNUP", signUp);
  yield takeLatest("CHECK_LOGIN", checkLogin);
  yield takeLatest("LOGOUT", logOut);
  yield takeLatest("UPDATE_USER", updateUser);
  yield takeLatest("DELETE_USER", deleteUser);
  yield takeLatest("UPLOAD_IMAGE", uploadImage);
  yield takeLatest("DELETE_IMAGE", deleteImage);
  yield takeLatest("MENU", getMenu);
  yield takeLatest("GET_ALL_CATEGORY", getAllCategory);
  yield takeEvery("GET_HIGHLIGHTED_PRODUCT", getHighlightedProducts);
  yield takeLatest("GET_PRODUCT", getProduct);
  yield takeLatest("GET_VARIANT_PRICE", getVariantPrice);
  yield takeLatest("GET_SUB_CATEGORY_PRODUCTS", getSubCategoryProducts);
  yield takeLatest("CREATE_ORDER", createOrder);
  yield takeLatest("GET_MY_ORDERS", getMyOrder);
  yield takeLatest("GET_ORDER_DETAILS", getOrderDetail);
  yield takeLatest("GET_BANNERS", getBanners);
  yield takeLatest("GET_PRODUCT_REVIEW", getProductReview);
  yield takeLatest("ADD_PRODUCT_REVIEW", addProductReview);
}

export default rootSaga;
