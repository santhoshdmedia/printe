const { getAllBannerProducts, addBanners, editBanner, getAllBanners, deleteBanner } = require("./controller_import");

const router = require("express").Router();

router.post("/add_banner", addBanners);
router.get("/getproducts_forbanner", getAllBannerProducts);
router.get("/get_all_banners/:id?", getAllBanners);
router.put("/edit_banner/:id", editBanner);
router.delete("/delete_banner/:id", deleteBanner);

module.exports = router;
