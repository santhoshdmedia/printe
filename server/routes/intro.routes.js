const {addmain}=require('../controller/intro.controlller')

const router = require("express").Router();


router.post("/", addmain);


module.exports = router;