const { 
  sendWhatsAppOtpHandler, 
  verifyWhatsAppOtpHandler, 
  resendWhatsAppOtpHandler,
  checkWhatsAppStatusHandler,
  sendAudioHandler,
    sendDocumentHandler,
    sendImageHandler,
    sendVideoHandler
} = require("../controller/whatsapp.controller");

const express = require('express');
const router = express.Router();

router.post("/send_otp", sendWhatsAppOtpHandler);
router.post("/verify_otp", verifyWhatsAppOtpHandler);
router.post("/resend_otp", resendWhatsAppOtpHandler);
router.get("/status", checkWhatsAppStatusHandler); 
router.post("/send_audio", sendAudioHandler);
router.post("/send_document", sendDocumentHandler);
router.post("/send_image", sendImageHandler);
router.post("/send_video", sendVideoHandler);

module.exports = router;