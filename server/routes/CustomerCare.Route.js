const express = require("express");
const router = express.Router();
const {addCustomerCare,deleteCustomerCare,getCustomerCare,updateCustomerCare,customerCareLogin,getCustomerCarebyId} = require("../controller/Customercare.controller");
// Create a new lead
router.post("/", addCustomerCare);

// Get all leads
router.get("/", getCustomerCare);
router.get("/:id", getCustomerCarebyId);
router.post("/Login", customerCareLogin);

router.put("/update_customerCare/:id",updateCustomerCare);
router.delete("/delete_customerCare/:id",deleteCustomerCare);



module.exports = router;
