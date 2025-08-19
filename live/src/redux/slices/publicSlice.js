import { createSlice } from "@reduxjs/toolkit";
import { message } from "antd";

const initialState = {
  isGettingAllCategory: false,
  isGettingNewLaunchProduct: false,
  isGettingOnlyForTodayProduct: false,
  isGettingPopularProduct: false,
  isGettingProduct: false,
  isGettingVariantPrice: false,
  isGettingMenu: false,
  isGettingSubCategoryProducts: false,
  isCreatingOrder: false,
  isSearchingProducts: false,
  isUploadingFile: false,
  isDeletingFile: false,
  isGettingBanners: false,
  isGettingProductList: false,
  banners: [],
  searchingProducts: [],
  creatingOrderSuccessModal: false,
  addingRateAndReviewSuccess: false,
  menu: [],
  allCategoryData: [],
  newLaunchProduct: [],
  popularProduct: [],
  onlyForTodayProduct: [],
  product: {
    _id: "",
    name: "",
    images: [],
    description: "",
    variants: [
      {
        variant_name: "",
        options: [
          {
            value: "",
          },
        ],
      },
    ],
    variants_price: [{}],
  },
  productRateAndReview: {
    loading: false,
    data: [],
  },
  subCategoryProducts: {
    _id: "",
    sub_category_name: "",
    sub_product_category_details: [
      {
        _id: "",
        sub_product_name: "",
        sub_product_image: "",
        products: [],
      },
    ],
  },
  productList: [],
};

const publicSlice = createSlice({
  name: "public",
  initialState,
  reducers: {
    gettingAllCategoryStated: (state) => {
      state.isGettingAllCategory = true;
    },
    gettingAllCategorySuccess: (state, action) => {
      state.isGettingAllCategory = false;
      state.allCategoryData = action.payload.data;
    },
    gettingAllCategoryFailed: (state, action) => {
      state.isGettingAllCategory = false;
      message.error({
        key: "all-category",
        content: action.payload,
        duration: 0,
        onClick() {
          message.destroy("all-category");
        },
      });
    },
    gettingNewLaunchProductStarted: (state) => {
      state.isGettingNewLaunchProduct = true;
    },
    gettingNewLaunchProductSuccess: (state, action) => {
      state.isGettingNewLaunchProduct = false;
      state.newLaunchProduct = action.payload;
    },
    gettingNewLaunchProductFailed: (state) => {
      state.isGettingNewLaunchProduct = false;
    },
    gettingPopularProductStarted: (state) => {
      state.isGettingPopularProduct = true;
    },
    gettingPopularProductSuccess: (state, action) => {
      state.isGettingPopularProduct = false;
      state.popularProduct = action.payload;
    },
    gettingPopularProductFailed: (state) => {
      state.isGettingPopularProduct = false;
    },
    gettingProductStarted: (state) => {
      state.isGettingProduct = true;
    },
    gettingProductSuccess: (state, action) => {
      state.isGettingProduct = false;
      state.product = action.payload;
    },
    gettingProductFailed: (state) => {
      state.isGettingProduct = false;
    },
    gettingVariantPriceStarted: (state) => {
      state.isGettingVariantPrice = true;
    },
    gettingVariantPriceSuccess: (state, action) => {
      state.isGettingVariantPrice = false;
      state.product.variants_price[0] = action.payload;
    },
    gettingVariantPriceFailed: (state) => {
      state.isGettingVariantPrice = false;
    },
    gettingMenuStarted: (state) => {
      state.isGettingMenu = true;
    },
    gettingMenuSuccess: (state, action) => {
      state.isGettingMenu = false;
      state.menu = action.payload;
    },
    gettingMenuFailed: (state) => {
      state.isGettingMenu = false;
    },
    gettingSubCategoryProductsStarted: (state) => {
      state.isGettingSubCategoryProducts = true;
    },
    gettingSubCategoryProductsSuccess: (state, action) => {
      state.isGettingSubCategoryProducts = false;
      state.subCategoryProducts = action.payload;
    },
    gettingSubCategoryProductsFailed: (state) => {
      state.isGettingSubCategoryProducts = false;
    },
    creatingOrderStarted: (state) => {
      state.isCreatingOrder = true;
    },
    creatingOrderSuccess: (state) => {
      state.isCreatingOrder = false;
      state.creatingOrderSuccessModal = true;
    },
    creatingOrderFailed: (state, action) => {
      state.isCreatingOrder = false;
      message.error({
        key: "create-order",
        content: action.payload.message,
        duration: 0,
        onClick(e) {
          message.destroy("create-order");
        },
      });
    },
    setCreatingOrderSuccessModal: (state, action) => {
      state.creatingOrderSuccessModal = action.payload;
    },
    searchingProductsStarting: (state) => {
      state.isSearchingProducts = true;
    },
    searchingProductsSuccess: (state, action) => {
      state.isSearchingProducts = false;
      state.searchingProducts = action.payload;
    },
    searchingProductsFailed: (state) => {
      state.isSearchingProducts = false;
    },
    uploadingFileStarted: (state) => {
      state.isUploadingFile = true;
      message.loading({
        key: "uploading-file",
        content: "Uploading File Uploading",
      });
    },
    uploadingFileSuccess: (state) => {
      state.isUploadingFile = false;
      message.success({
        key: "uploading-file",
        content: "File Uploaded Successfully",
      });
    },
    uploadingFileFailed: (state) => {
      state.isUploadingFile = false;
      message.error({
        key: "uploading-file",
        content: "Uploading File Failed",
        duration: 3,
      });
    },
    deletingFileStarted: (state) => {
      state.isDeletingFile = true;
      message.loading({
        key: "uploading-file",
        content: "Uploading File Uploading",
      });
    },
    deletingFileSuccess: (state) => {
      state.isDeletingFile = false;
      message.success({
        key: "uploading-file",
        content: "File Uploaded Successfully",
      });
    },
    deletingFileFailed: (state) => {
      state.isDeletingFile = false;
      message.error({
        key: "uploading-file",
        content: "Uploading File Failed",
        duration: 3,
      });
    },
    gettingBannersStarted: (state) => {
      state.isGettingBanners = true;
    },
    gettingBannersSucess: (state, action) => {
      state.isGettingBanners = false;
      state.banners = action.payload;
    },
    gettingBannersFailed: (state) => {
      state.isGettingBanners = false;
    },
    gettingProductListStarted: (state) => {
      state.isGettingProductList = true;
    },
    gettingProductListSuccess: (state, action) => {
      state.isGettingProductList = false;
      state.productList = action.payload;
    },
    gettingProductListFailed: (state) => {
      state.isGettingProductList = false;
    },
    gettingProductRateAndReviewStarted: (state) => {
      state.productRateAndReview.loading = true;
      state.addingRateAndReviewSuccess = false;
    },
    gettingProductRateAndReviewSuccess: (state, action) => {
      state.productRateAndReview = {
        loading: false,
        data: action.payload,
      };
    },
    gettingProductRateAndReviewFailed: (state) => {
      state.productRateAndReview.loading = false;
    },
    gettingOnlyForTodayProductStarted: (state) => {
      state.addingRateAndReviewSuccess = false;
    },
    gettingOnlyForTodayProductSuccess: (state, action) => {
      state.isGettingOnlyForTodayProduct = false;
      state.onlyForTodayProduct = action.payload;
    },
    gettingOnlyForTodayProductFailed: (state) => {
      state.isGettingOnlyForTodayProduct = false;
    },
    addingProductRateAndReviewStarted: (state) => {
      message.loading({
        key: "rate-and-review-adding",
        content: "Adding Your Review",
      });
    },
    addingProductRateAndReviewSuccess: (state) => {
      state.addingRateAndReviewSuccess = true;
      message.success({
        key: "rate-and-review-adding",
        content: "Your Review Added Succussfully",
      });
    },
    addingProductRateAndReviewFailed: (state, action) => {
      message.error({
        key: "rate-and-review-adding",
        content: action.payload,
      });
    },
  },
});

export default publicSlice.reducer;
export const {
  gettingAllCategoryFailed,
  gettingAllCategoryStated,
  gettingAllCategorySuccess,
  gettingNewLaunchProductFailed,
  gettingNewLaunchProductStarted,
  gettingNewLaunchProductSuccess,
  gettingPopularProductFailed,
  gettingPopularProductStarted,
  gettingPopularProductSuccess,
  gettingProductFailed,
  gettingProductStarted,
  gettingProductSuccess,
  gettingVariantPriceFailed,
  gettingVariantPriceStarted,
  gettingVariantPriceSuccess,
  gettingMenuFailed,
  gettingMenuStarted,
  gettingMenuSuccess,
  gettingSubCategoryProductsFailed,
  gettingSubCategoryProductsStarted,
  gettingSubCategoryProductsSuccess,
  creatingOrderSuccess,
  creatingOrderFailed,
  creatingOrderStarted,
  setCreatingOrderSuccessModal,
  searchingProductsFailed,
  searchingProductsStarting,
  searchingProductsSuccess,
  uploadingFileFailed,
  uploadingFileStarted,
  uploadingFileSuccess,
  gettingBannersFailed,
  gettingBannersStarted,
  gettingBannersSucess,
  gettingProductListFailed,
  gettingProductListStarted,
  gettingProductListSuccess,
  gettingProductRateAndReviewFailed,
  gettingProductRateAndReviewStarted,
  gettingProductRateAndReviewSuccess,
  gettingOnlyForTodayProductFailed,
  gettingOnlyForTodayProductStarted,
  gettingOnlyForTodayProductSuccess,
  addingProductRateAndReviewFailed,
  addingProductRateAndReviewStarted,
  addingProductRateAndReviewSuccess,
  deletingFileStarted,
  deletingFileSuccess,
  deletingFileFailed,
} = publicSlice.actions;
