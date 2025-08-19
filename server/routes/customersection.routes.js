const { getAllBannerProducts, addBanners, editBanner, getAllBanners, deleteBanner, addCutomerSection, editCustomerSection, getAllCustomerSections, deleteBannerCustomerSections } = require("./controller_import");

const router = require("express").Router();

router.post("/add_customerSection", addCutomerSection);
router.get("/get_all_customerSection/:id?",  getAllCustomerSections);
router.put("/edit_customerSection/:id", editCustomerSection);
router.delete("/delete_customerSection/:id", deleteBannerCustomerSections);

module.exports = router;
