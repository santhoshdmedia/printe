const router = require("express").Router();
const { addProduct, getProduct, deleteProduct, editProduct, getProductVariantPrice, getHistoryProducts, getBannerProducts, addProductDescription, getProductDescription, updateProductDescription, deleteProductDescription } = require("./controller_import");
const { VerfiyToken } = require("../helper/shared.helper");

router.post("/add_product", VerfiyToken, addProduct);
router.get("/get_product/:id?", getProduct);
router.put("/edit_product/:id", VerfiyToken, editProduct);
router.delete("/delete_product/:id", VerfiyToken, deleteProduct);
router.post("/get_variant_price/:id", getProductVariantPrice);
router.get("/get_history_products", VerfiyToken, getHistoryProducts);
router.get("/get_banner_products/:id", getBannerProducts);

// product descriptions
router.post("/add_product_descriptions", VerfiyToken, addProductDescription);
router.get("/get_product_descriptions/:id", getProductDescription);
router.put("/update_product_descriptions/:id", updateProductDescription);
router.delete("/delete_product_descriptions/:id", deleteProductDescription);

module.exports = router;
