const router = require("express").Router();

const { UploadImage } = require("../controller/shared.controller");
const { upload } = require("../helper/multer.helper");
const { VerfiyToken } = require("../helper/shared.helper");


const { auth_routes, category_routes, admin_routers, user_routers, product_routers, order_routers, dashboard_routers, banner_routes, review_routes, blog_routes, vendor_routes, mail_routes, enquires_routes, section_routes, shopping_cart,teamRoutes,banner_Text_routes } = require("../routes/routes_import");

//Admin EndPoints
router.use("/auth", auth_routes);
router.use("/category", category_routes);
router.use("/admin", admin_routers);
router.use("/product", product_routers);
router.use("/dashboard", dashboard_routers);
router.use("/order", VerfiyToken, order_routers);
router.use("/banner", VerfiyToken, banner_routes);
router.use("/banner_text", banner_Text_routes);
router.use("/review", VerfiyToken, review_routes);
router.use("/blog", blog_routes);
router.use("/vendor", VerfiyToken, vendor_routes);

//Client EndPoints
router.use("/client_user", user_routers);
router.use("/client_banner", banner_routes);
router.use("/client_banner_text", banner_routes);
router.use("/client_review", review_routes);

//Image Upload EndPoints
router.post("/upload_images", upload.single("image"), UploadImage);

// mail
router.use("/mail", mail_routes);

// help
router.use("/help", enquires_routes);

// section

router.use("/customer_section", VerfiyToken, section_routes);
router.use("/home", section_routes);

// cart
router.use("/shopping", VerfiyToken, shopping_cart);

// team

router.use('/team',teamRoutes)

//clone

module.exports = router;
