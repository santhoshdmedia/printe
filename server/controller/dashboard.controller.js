const { successResponse } = require("../helper/response.helper");
const { ProductSchema, UserSchema, MainCategorySchema, SubcategorySchema, SubProductcategorySchema, AdminUsersSchema, OrderDetailsSchema, orderdeliverytimelineSchema, BannerSchemas, VendorSchemas } = require("./models_import");

const getAllDashbardCounts = async (req, res) => {
  try {
    const productCount = await ProductSchema.countDocuments();
    const customersCount = await UserSchema.countDocuments();
    const mainCategoryCount = await MainCategorySchema.countDocuments();
    const subCategoryCount = await SubcategorySchema.countDocuments();
    const vendorcount = await VendorSchemas.countDocuments();
    const adminUsersCount = await AdminUsersSchema.countDocuments();
    const orderDetailsCount = await OrderDetailsSchema.countDocuments();
    const bannercount = await BannerSchemas.countDocuments();

    // group
    const productTypesCount = await ProductSchema.aggregate([
      {
        $group: {
          _id: { type: "$type" },
          total_products: { $sum: 1 },
        },
      },
    ]);
    const adminusersTypeCount = await AdminUsersSchema.aggregate([
      {
        $group: {
          _id: { type: "$role" },
          total_products: { $sum: 1 },
        },
      },
    ]);

    const orderTimelineCount = await orderdeliverytimelineSchema.aggregate([
      {
        $group: {
          _id: { type: "$order_status" },
          total_products: { $sum: 1 },
        },
      },
    ]);

    let combineAllCounts = [
      {
        name: "Products",
        count: productCount,
      },
      {
        name: "Customers",
        count: customersCount,
      },
      {
        name: "Main Categories",
        count: mainCategoryCount,
      },
      {
        name: "Sub Categories",
        count: subCategoryCount,
      },
      {
        name: "Vendors Count",
        count: vendorcount,
      },
      {
        name: "Admin Users",
        count: adminUsersCount,
      },
      {
        name: "Orders",
        count: orderDetailsCount,
      },
      {
        name: "Banners",
        count: bannercount,
      },
      {
        name: "Product Types",
        count: productTypesCount,
        multiple: true,
      },
      {
        name: "Admin User Types",
        count: adminusersTypeCount,
        multiple: true,
      },
      {
        name: "Order Timeline",
        count: orderTimelineCount,
        multiple: true,
      },
    ];

    successResponse(res, "", combineAllCounts);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getAllDashbardCounts };
