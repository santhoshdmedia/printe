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
  getAllCategory,
} = require("../controller/maincategory.controller");
const {
  addsub,
  getsub,
  deletesubcategory,
  getAllSubProduct,
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
} = require("../controller/product.controller");
const {
  CreateOrder,
  CollectAllOrder,
  CollectMyOrders,
  UpdateOrderStatus,
  getOrderStates,
  UpdateOrderDesign,
  UpdateOrderVendor,
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
  VendorGetProfile
} = require("../controller/vendor.controller");
const {
  sendForgetPasswordMail,
  resetPassword,
  verfiyLink,
  craeteOrderId,
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
} = require("../controller/shoppingcart.controller");
const {
  createvendorProduct,
  updatevendorProduct,
  deletevendorProduct,
  togglevendorProductStatus,
  getvendorProductStats,
  getAllVendorProduct,
  getSingleVendorProduct
} = require("../controller/vendorProduct");

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

  // sub
  addsub,
  getsub,
  deletesubcategory,
  getAllSubProduct,

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

  // product descriptions
  addProductDescription,
  getProductDescription,
  updateProductDescription,
  deleteProductDescription,

  // clone
};
