const { editsubcategory, getAllSubProduct } = require("../controller/subcategory.controller");
const { addmain, getmain, editMain, deleteMain, addsub, getsub, deletesubcategory, addSubProductCategory, deleteSubproductCategory, editSubproductCategroy, getSubProductCategory, getAllCategory, getAllCategoryProducts, getAllSubCategoryProducts } = require("../routes/controller_import");

const router = require("express").Router();

router.post("/main_category_name", addmain);
router.get("/all_main_category_name", getmain);
router.put("/edit_main_category_name/:categoryId", editMain);
router.delete("/delete_main_category_name/:categoryId", deleteMain);
router.get("/get_all_category", getAllCategory);

router.post("/sub_category_name", addsub);
router.get("/get_sub_category", getsub);
router.delete("/delete_sub_category/:id", deletesubcategory);
router.put("/edit_sub_category/:id", editsubcategory);
router.get("/get_all_sub_product_category/:id?", getAllSubProduct);

router.post("/add_sub_product_categrory", addSubProductCategory);
router.get("/get_sub_product_category", getSubProductCategory);
router.delete("/delete_sub_product_category/:id", deleteSubproductCategory);
router.put("/edit_sub_product_category/:id", editSubproductCategroy);

// client products
router.get("/get_all_product_category/:id", getAllCategoryProducts);
router.get("/get_all_sub_category_product/:id", getAllSubCategoryProducts);

module.exports = router;
