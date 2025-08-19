const { sendForgetPasswordMail, resetPassword, verfiyLink, craeteOrderId } = require("./controller_import");

const router = require("express").Router();

router.post("/send_forgetpassoword_mail", sendForgetPasswordMail);
router.post("/reset_password", resetPassword);

router.get("/verfiy_link/:id", verfiyLink);

router.post("/order_id", craeteOrderId);


module.exports = router;
