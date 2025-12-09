const {sendOtpHandler,verifyOtpHandler,resendOtpHandler,Notify}= require("./controller_import");
const router = require("express").Router();
router.post("/send_otp", sendOtpHandler);
router.post("/verify_otp", verifyOtpHandler);
router.post("/resend_otp", resendOtpHandler);
router.post("/Notify", Notify);

module.exports = router;