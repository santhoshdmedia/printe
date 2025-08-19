const { VerfiyToken } = require("../helper/shared.helper");

const { addReview, getreveiewbyproduct, getmyreviewall, getadminsideReview, deleteMyReview, updateMyReview } = require("./controller_import");

const router = require("express").Router();

router.post("/add_review", VerfiyToken, addReview);
router.get("/get_productreview/:id", getreveiewbyproduct);
router.get("/get_my_review/:id", getmyreviewall);
router.get("/get_all_review/:search", getadminsideReview);
router.delete("/delete_my_review/:id", deleteMyReview);
router.put("/update_my_review/:id", updateMyReview);

module.exports = router;
