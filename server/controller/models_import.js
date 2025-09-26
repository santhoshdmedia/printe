const User = require("../modals/user.modal");
const MainCategory = require("../modals/maincategory.modals");
const SubCategory = require("../modals/subcategory.modal");
const AdminUsers = require("../modals/adminusers.modals");
const SubProductcategory = require("../modals/subproductcategory");
const Product = require("../modals/product.models");
const { Order, order_delivery_timeline } = require("../modals/orderdetails.modals");
const bannerModals = require("../modals/banner.modals");
const bannerTextModals = require("../modals/bannerTextmodel");
const reviewModals = require("../modals/review.modals");
const blogMoidals = require("../modals/blog.moidals");
const vendorModal = require("../modals/vendor.models");
const resetPasswordModals = require("../modals/resetPassword.modals");
const userenquireModals = require("../modals/userenquire.modals");
const customerSection = require("../modals/customer_section.models");
const shopping_cart_model = require("../modals/cart.modals");
const product_description = require("../modals/productdescription.models");
const VendorProduct = require("../modals/vendorProduct.model");
const BulkOrder =require('../modals/bulkOrder.model')


module.exports = {
  UserSchema: User,
  MainCategorySchema: MainCategory,
  SubcategorySchema: SubCategory,
  AdminUsersSchema: AdminUsers,
  SubProductcategorySchema: SubProductcategory,
  ProductSchema: Product,
  OrderDetailsSchema: Order,
  orderdeliverytimelineSchema: order_delivery_timeline,
  BannerSchemas: bannerModals,
  BannerTextSchemas: bannerTextModals,
  ReviewSchemas: reviewModals,
  BlogSchema: blogMoidals,
  VendorSchemas: vendorModal,
  ResetPasswordSchema: resetPasswordModals,
  EnquiresSchema: userenquireModals,
  CustomerSectionSchema: customerSection,
  ShoppingCardSchema: shopping_cart_model,
  ProdutDescriptionSchema: product_description,
  ProductVendorSchema: VendorProduct,
  BulkOrderSchem:BulkOrder
};
