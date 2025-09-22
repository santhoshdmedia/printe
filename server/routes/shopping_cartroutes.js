const { addToShoppingCart, getMyShoppingCart, removeMyShoppingCart,mergeCartsAfterLogin } = require("./controller_import");

const router = require("express").Router();

router.post("/add_to_cart", addToShoppingCart);
router.post("/merge_cart", mergeCartsAfterLogin);
router.get("/get_my_cart", getMyShoppingCart);
router.post("/remove_my_cart", removeMyShoppingCart);

module.exports = router;
