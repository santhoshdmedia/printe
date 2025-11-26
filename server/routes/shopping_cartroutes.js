const { 
  addToShoppingCart, 
  getMyShoppingCart, 
  removeMyShoppingCart, 
  mergeCartsAfterLogin,
  updateCartItemQuantity,
  validateGuestId
} = require("../controller/shoppingcart.controller");

const router = require("express").Router();

// Apply guest ID validation to all routes
router.use(validateGuestId);

router.post("/add_to_cart", addToShoppingCart);
router.post("/merge_cart", mergeCartsAfterLogin);
router.get("/get_my_cart", getMyShoppingCart);
router.post("/remove_my_cart", removeMyShoppingCart);
router.post("/update_cart_quantity", updateCartItemQuantity);

module.exports = router;