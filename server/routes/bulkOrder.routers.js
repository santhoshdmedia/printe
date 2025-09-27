const { addBulkOrder,getBulkOrder } = require("./controller_import");

const router = require("express").Router();

router.post("/add_bulk", addBulkOrder);
router.get("/get_all_bulk", getBulkOrder);


module.exports = router;
