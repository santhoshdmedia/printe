const { getAllBannerProducts, addBanners, editBanner, getAllBanners, deleteBanner,reorderBanners,  getBannerStats,getVisibleBanners,toggleBannerVisibility } = require("./controller_import");

const router = require("express").Router();

router.post("/add_banner", addBanners);
router.get("/getproducts_forbanner", getAllBannerProducts);
router.get("/get_all_banners/:id?", getAllBanners);
router.put("/edit_banner/:id", editBanner);
router.put("/reorder", reorderBanners);
// Statistics route
router.get('/stats', getBannerStats);
router.put('/:id/toggle-visibility',toggleBannerVisibility);
// Get visible banners only (for public/frontend)
router.get('/banners/visible', getVisibleBanners);
router.delete("/delete_banner/:id", deleteBanner);

module.exports = router;
