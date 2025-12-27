
const {
  login,
  changePasswrod,
  checkloginstatus,
} = require("../controller/auth.controller");
const {
  addmain,
  getmain,
  editMain,
  deleteMain,
  getAllCategory, getMainCategoryProductsBySlug
} = require("../controller/maincategory.controller");
const {
  addsub,
  getsub,
  deletesubcategory,
  getAllSubProduct, editsubcategory, getSubcategoryBySlug, getSubcategoryProductsBySlug,
} = require("../controller/subcategory.controller");
const {
  addAdmin,
  getAdmin,
  deleteAdmin,
  updateAdmin,
} = require("../controller/admin.controller");
const {
  clientLogin,
  clientgoogleLogin,
  clientSignup,
  getAllCustomUsers,
  customSignup,
  clientCheckloginstatus,
  getAllClientUsers,
  updateClientUser,
  deleteClientUser,
  getSingleClient,
  addtoHistory,
  BNISignup
} = require("../controller/user.controller");
const {
  addSubProductCategory,
  editSubproductCategroy,
  deleteSubproductCategory,
  getSubProductCategory,
} = require("../controller/subproduct.controller");
const {
  getProduct,
  addProduct,
  deleteProduct,
  editProduct,
  getProductVariantPrice,
  getHistoryProducts,
  getBannerProducts,
  addProductDescription,
  getProductDescription,
  updateProductDescription,
  deleteProductDescription,
  getAllProductsSimple
} = require("../controller/product.controller");
const {
  CreateOrder,
  CollectAllOrder,
  CollectMyOrders,
  UpdateOrderStatus,
  getOrderStates,
  UpdateOrderDesign,
  UpdateOrderVendor,
  acceptOrderByVendor, completeOrderByVendor
} = require("../controller/order.controller");
const { getAllDashbardCounts } = require("../controller/dashboard.controller");
const {
  getAllBannerProducts,
  addBanners,
  editBanner,
  getAllBanners,
  deleteBanner,
} = require("../controller/banner.controller");
const {
  addTextBanners,
  getBannersText,
  editTextBanner,
  deleteTextBanner,
} = require("../controller/bannerTextcontroller");
const {
  addReview,
  getreveiewbyproduct,
  getmyreviewall,
  getadminsideReview,
  deleteMyReview,
  updateMyReview,
} = require("../controller/review.controller");
const {
  addblog,
  getblog,
  editblog,
  deleteblog,
} = require("../controller/blog.controller");
const {
  addVendors,
  editVendor,
  getAllVendors,
  deleteVendor,
  getSingleVendor,
  getSingleVendorName,
  VendorLogin,
  VendorGetProfile,
} = require("../controller/vendor.controller");
const {
  sendForgetPasswordMail,
  resetPassword,
  verfiyLink,
  craeteOrderId,
  sendDealerPasswordMail
} = require("../controller/mail.controller");
const {
  getAllCategoryProducts,
  getAllSubCategoryProducts,
} = require("../controller/categoryproduct.controller");
const {
  addenquires,
  getenquires,
  getsinglnquires,
} = require("../controller/enquires.controllers");
const {
  addCutomerSection,
  editCustomerSection,
  getAllCustomerSections,
  deleteBannerCustomerSections,
} = require("../controller/customersection.controller");
const {
  addToShoppingCart,
  getMyShoppingCart,
  removeMyShoppingCart,
  mergeCartsAfterLogin,
} = require("../controller/shoppingcart.controller");
const {
  createvendorProduct,
  updatevendorProduct,
  deletevendorProduct,
  togglevendorProductStatus,
  getvendorProductStats,
  getAllVendorProduct,
  getSingleVendorProduct,
} = require("../controller/vendorProduct");
const {
  addBulkOrder,
  getBulkOrder,
} = require("../controller/bulkOrder.controler");

const {
  resendOtpHandler,
  sendOtpHandler,
  verifyOtpHandler, Notify
} = require("../controller/mailotp.controller");

const { applyCoupon, createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon } = require("../controller/coupen.controller");

const { redeemReward, getMyRewards, getAvailableRewards,
  getRewardDetails,
  getAdminSideRewards,
  deleteReward,
  updateReward,
  createReward } = require('../controller/reward.controller')

module.exports = {
  login,
  changePasswrod,
  checkloginstatus,

  // main
  addmain,
  getmain,
  editMain,
  deleteMain,
  getAllCategory,
  getMainCategoryProductsBySlug,

  // sub
  addsub,
  getsub,
  deletesubcategory,
  getAllSubProduct,
  editsubcategory,
  getSubcategoryBySlug,
  getSubcategoryProductsBySlug,

  //admin users
  addAdmin,
  getAdmin,
  deleteAdmin,
  updateAdmin,

  // user
  clientLogin,
  clientSignup,
  clientCheckloginstatus,
  getAllClientUsers,
  deleteClientUser,
  updateClientUser,
  getSingleClient,
  addtoHistory,
  clientgoogleLogin,

  // bni
  BNISignup,
  // custom user
  customSignup,
  getAllCustomUsers,
  // sub category product
  addSubProductCategory,
  editSubproductCategroy,
  deleteSubproductCategory,
  getSubProductCategory,

  // product
  getProduct,
  addProduct,
  deleteProduct,
  editProduct,
  getProductVariantPrice,
  getHistoryProducts,
  getBannerProducts,

  // orderDetails
  CreateOrder,
  CollectAllOrder,
  CollectMyOrders,
  UpdateOrderStatus,
  getOrderStates,
  UpdateOrderDesign,
  UpdateOrderVendor,
  acceptOrderByVendor,
  completeOrderByVendor,
  getAllProductsSimple,

  // Dashboard
  getAllDashbardCounts,

  // banner
  getAllBannerProducts,
  addBanners,
  editBanner,
  getAllBanners,
  deleteBanner,

  // bannear text
  getBannersText,
  addTextBanners,
  editTextBanner,
  deleteTextBanner,

  //review
  addReview,
  getreveiewbyproduct,
  getmyreviewall,
  getadminsideReview,
  deleteMyReview,
  updateMyReview,

  //blog
  addblog,
  getblog,
  editblog,
  deleteblog,

  // vendors
  addVendors,
  editVendor,
  getAllVendors,
  deleteVendor,
  getSingleVendor,
  getSingleVendorName,
  VendorLogin,
  VendorGetProfile,

  // vendor product
  createvendorProduct,
  updatevendorProduct,
  deletevendorProduct,
  togglevendorProductStatus,
  getvendorProductStats,
  getAllVendorProduct,
  getSingleVendorProduct,

  // mail
  sendForgetPasswordMail,
  sendDealerPasswordMail,
  craeteOrderId,
  verfiyLink,
  resetPassword,


  // category products
  getAllCategoryProducts,
  getAllSubCategoryProducts,

  //enquires
  addenquires,
  getenquires,
  getsinglnquires,

  // sections
  addCutomerSection,
  editCustomerSection,
  getAllCustomerSections,
  deleteBannerCustomerSections,

  // shopping cart
  addToShoppingCart,
  getMyShoppingCart,
  removeMyShoppingCart,
  mergeCartsAfterLogin,

  // product descriptions
  addProductDescription,
  getProductDescription,
  updateProductDescription,
  deleteProductDescription,

  // clone

  // bulk
  getBulkOrder,
  addBulkOrder,

  // mail otp
  resendOtpHandler,
  sendOtpHandler,
  verifyOtpHandler,
  Notify,

  // coupen
  applyCoupon,
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,

  // reward
  redeemReward, getMyRewards, getAvailableRewards,
  getRewardDetails,
  getAdminSideRewards,
  deleteReward,
  updateReward,
  createReward
};
