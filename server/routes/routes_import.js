const auth_routes = require("./auth.routes");
const category_routes = require("./category.routes");
const admin_routers = require("./admin.routers");
const user_routers = require("./user.routers");
const product_routers = require("./product.routers");
const order_routers = require("./order.routes");
const dashboard_routers = require("./dashboard.routes");
const banner_routes = require("./banner.routes");
const banner_Text_routes = require("./bannerText");
const review_routes = require("./review.routes");
const blog_routes = require("./blog.routes");
const vendor_routes = require("./vendor.routers");
const mail_routes = require("./mail.routes");
const enquires_routes = require("./enquires.routes");
const section_routes = require("./customersection.routes");
const shopping_cart = require("./shopping_cartroutes");
const teamRoutes = require("./GetteamRoute");
const vendorProductRoutes = require("./venderproduct.routes");
const BulkOrderRoutes = require("./bulkOrder.routers");
const OtpRoutes = require("./Otp.routes");
const whatsappRoutes = require("./whatsapp.routes");
const coupenRoutes= require("./coupen.route");
const warentyRoutes=require("./warrenty.route")

const paymentRoutes=require('./Payment.route')
const RewardRoutes=require('./reward.router')
const IntroRoutes=require('./intro.routes')
const LeadRoutes=require('./lead.routes')
const CustomerRoutes=require('./CustomerCare.Route')
const CustomerSettingsRoutes=require('./customercaresettings.route')
const QuotationRoutes=require('./Quotation.routes')





module.exports = {
  auth_routes,
  category_routes,
  admin_routers,
  user_routers,
  product_routers,
  order_routers,
  dashboard_routers,
  banner_routes,
  banner_Text_routes,
  review_routes,
  vendor_routes,
  blog_routes,
  mail_routes,
  enquires_routes,
  section_routes,
  shopping_cart,
  teamRoutes,
  vendorProductRoutes,
  BulkOrderRoutes,
  OtpRoutes,
  whatsappRoutes,
  coupenRoutes,
  paymentRoutes,
  warentyRoutes,
  RewardRoutes,
  IntroRoutes,
  LeadRoutes,
  CustomerRoutes,
  CustomerSettingsRoutes,
  QuotationRoutes
};
