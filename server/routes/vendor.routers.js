const { addVendors,VendorLogin, editVendor,VendorGetProfile, getAllVendors, deleteVendor, getSingleVendor,getSingleVendorName, } = require("./controller_import");

const router = require("express").Router();

router.post("/add_vendor", addVendors);
router.get("/", VendorGetProfile);
router.post("/Vendor_Login", VendorLogin);
router.get("/get_all_vendors/:id?", getAllVendors);
router.put("/edit_vendor/:id", editVendor);
router.delete("/delete_vendor/:id", deleteVendor);
router.get("/get_single_vendor/:id", getSingleVendor);
router.get("/get_single_vendor_name/:id", getSingleVendorName);

module.exports = router;
