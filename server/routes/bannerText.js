const { addTextBanners,getBannersText, editTextBanner,  deleteTextBanner } = require("./controller_import");

const router = require("express").Router();

router.post("/add_banner_text", addTextBanners);
router.get("/get_all_banners/:id?", getBannersText);
router.put("/edit_banner_text/:id", editTextBanner);
router.delete("/delete_banner_text/:id", deleteTextBanner); 

module.exports = router