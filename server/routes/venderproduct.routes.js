const { createvendorProduct,
updatevendorProduct,
deletevendorProduct,
togglevendorProductStatus,
getvendorProductStats,getAllVendorProduct,getSingleVendorProduct } = require("./controller_import");

const router = require("express").Router();


router.post('/', createvendorProduct); 
router.get('/', getAllVendorProduct); 
router.get('/:id', getSingleVendorProduct); 
router.put('/:id', updatevendorProduct);
router.delete('/:id', deletevendorProduct);
router.patch('/:id/status', togglevendorProductStatus);


module.exports = router;
