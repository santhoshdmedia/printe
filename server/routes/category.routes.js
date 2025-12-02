const router = require("express").Router();
const { 
  getAllSubProduct, 
  addmain, 
  getmain, 
  editMain, 
  deleteMain, 
  addsub, 
  getsub, 
  deletesubcategory, 
  addSubProductCategory, 
  deleteSubproductCategory, 
  editSubproductCategroy, 
  getSubProductCategory, 
  getAllCategory, 
  getAllCategoryProducts, 
  getAllSubCategoryProducts,
  editsubcategory,
  getSubcategoryBySlug,
  getSubcategoryProductsBySlug ,
  getMainCategoryProductsBySlug
} = require("./controller_import");

// Main Category Routes
router.post("/main_category_name", addmain);
router.get("/all_main_category_name", getmain);
router.put("/edit_main_category_name/:categoryId", editMain);
router.delete("/delete_main_category_name/:categoryId", deleteMain);
router.get("/get_all_category", getAllCategory);

// Sub Category Routes
router.post("/sub_category_name", addsub);
router.get("/get_sub_category", getsub);
router.delete("/delete_sub_category/:id", deletesubcategory);
router.put("/edit_sub_category/:id", editsubcategory);
router.get("/get_all_sub_product_category/:id?", getAllSubProduct);

// Sub Product Category Routes
router.post("/add_sub_product_categrory", addSubProductCategory);
router.get("/get_sub_product_category", getSubProductCategory);
router.delete("/delete_sub_product_category/:id", deleteSubproductCategory);
router.put("/edit_sub_product_category/:id", editSubproductCategroy);

// Slug-based Routes
router.get("/client/sub-category/:slug/products", getSubcategoryBySlug);
router.get("/client/sub-category/:slug", getSubcategoryProductsBySlug);

// Client Routes (Mixed ID and Slug support)
router.get("/client/main-categories", getAllCategory);
router.get("/client/main-category/:slug/products", getMainCategoryProductsBySlug);

// Unified Routes with both ID and Slug support
router.get("/get_all_product_category/:id", getAllCategoryProducts); // Supports both ID and slug
router.get("/get_all_sub_category_product/:id", getAllSubCategoryProducts); // Supports both ID and slug

module.exports = router;