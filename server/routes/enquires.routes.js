const { addenquires, getenquires, getsinglnquires } = require("./controller_import");

const router = require("express").Router();

router.post("/enquire_detals", addenquires);
router.get("/get_enquires", getenquires);
router.get("/get_single_enquires/:id", getsinglnquires);

module.exports = router;
