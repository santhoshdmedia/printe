const { getAllDashbardCounts } = require("./controller_import");

const router = require("express").Router();

router.get("/get_dashboard_data_count", getAllDashbardCounts);

module.exports = router;
