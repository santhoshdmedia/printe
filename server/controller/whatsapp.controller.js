const axios = require("axios");

// ─────────────────────────────────────────────
// Digitell Configuration
// ─────────────────────────────────────────────
const DIGITELL_BASE_URL = "https://official.digitellagency.in/api";
const DIGITELL_VENDOR_UID = "ef46f737-df5f-4f12-bfe6-0bb3b8aa2bda";
const DIGITELL_TOKEN = "JLVPyHpuyOP1vDfi99Uoe9JdjtsYFlRQK4blX96HlHAw38ryIOfzzT29qq6fjFII";

const DEFAULT_TEMPLATE_NAME = "user_auth_code";
const DEFAULT_TEMPLATE_LANGUAGE = "en";

// In-memory OTP storage (replace with Redis in production)
const otpStorage = new Map();

// ─────────────────────────────────────────────
// Debug Logger
// ─────────────────────────────────────────────

const debug = (section, data) => {
  console.log("\n========================================");
  console.log(`[Digitell DEBUG] ${section}`);
  console.log("----------------------------------------");
  console.log(JSON.stringify(data, null, 2));
  console.log("========================================\n");
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const cleanPhoneNumber = (phone) => String(phone).replace(/\D/g, "");

const digitellUrl = (path) =>
  `${DIGITELL_BASE_URL}/${DIGITELL_VENDOR_UID}/${path}?token=${DIGITELL_TOKEN}`;

const digitellHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${DIGITELL_TOKEN}`,
});

// ─────────────────────────────────────────────
// Core: Send Authentication Template (OTP)
// ─────────────────────────────────────────────

const sendOtpTemplateMessage = async (phoneNumber, otp) => {
  const templateName = process.env.OTP_TEMPLATE_NAME || DEFAULT_TEMPLATE_NAME;
  const templateLanguage = process.env.OTP_TEMPLATE_LANGUAGE || DEFAULT_TEMPLATE_LANGUAGE;
  const url = digitellUrl("contact/send-template-message");

const payload = {
  phone_number: phoneNumber,
  template_name: templateName,
  template_language: templateLanguage,
  field_1: otp,       // OTP in message body {{1}}
  button_0: otp,      // ← ADD THIS: OTP in Copy Code button
};

  // 🔍 DEBUG: Log everything being sent to Digitell
  debug("REQUEST → Digitell", {
    url,
    headers: digitellHeaders(),
    payload,
  });

  try {
    const response = await axios.post(url, payload, { headers: digitellHeaders() });

    // 🔍 DEBUG: Log full Digitell response
    debug("RESPONSE ← Digitell", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    // 🔍 DEBUG: Log full error from Digitell
    debug("ERROR ← Digitell", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      requestPayload: payload,
    });
    throw error;
  }
};

// ─────────────────────────────────────────────
// Core: Send Any Template Message via Digitell
// ─────────────────────────────────────────────

const sendTemplateMessage = async (
  phoneNumber,
  templateName,
  templateLanguage = DEFAULT_TEMPLATE_LANGUAGE,
  fields = {},
  contact = null
) => {
  const payload = {
    phone_number: phoneNumber,
    template_name: templateName,
    template_language: templateLanguage,
    ...fields,
  };

  if (contact) {
    payload.contact = contact;
  }

  debug("REQUEST → Digitell (Generic Template)", { payload });

  try {
    const response = await axios.post(
      digitellUrl("contact/send-template-message"),
      payload,
      { headers: digitellHeaders() }
    );

    debug("RESPONSE ← Digitell (Generic Template)", {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    debug("ERROR ← Digitell (Generic Template)", {
      message: error.message,
      status: error.response?.status,
      responseData: error.response?.data,
    });
    throw error;
  }
};

// ─────────────────────────────────────────────
// Core: Send a Plain Text Message via Digitell
// ─────────────────────────────────────────────

const sendTextMessage = async (phoneNumber, message) => {
  const response = await axios.post(
    digitellUrl("contact/send-message"),
    { phone_number: phoneNumber, message },
    { headers: digitellHeaders() }
  );
  return response.data;
};

// ─────────────────────────────────────────────
// OTP Handlers
// ─────────────────────────────────────────────

const sendWhatsAppOtpHandler = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    debug("INCOMING REQUEST → sendWhatsAppOtp", { body: req.body });

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: "Phone number is required" });
    }

    const cleanPhone = cleanPhoneNumber(phoneNumber);
    debug("PHONE CLEANED", { original: phoneNumber, cleaned: cleanPhone, length: cleanPhone.length });

    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: "Invalid phone number" });
    }

    const otp = generateOTP();
    debug("OTP GENERATED", { otp, phone: cleanPhone });

    otpStorage.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    const result = await sendOtpTemplateMessage(cleanPhone, otp);

    debug("OTP SEND RESULT", { result });

    console.log(`[Digitell] ✅ OTP sent to ${cleanPhone}`);

    return res.json({
      success: true,
      message: "OTP sent via WhatsApp successfully",
    });
  } catch (error) {
    console.error("[Digitell] ❌ sendWhatsAppOtpHandler error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────

const verifyWhatsAppOtpHandler = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    debug("INCOMING REQUEST → verifyWhatsAppOtp", { body: req.body });

    if (!phoneNumber || !otp) {
      return res.status(400).json({ success: false, error: "Phone number and OTP are required" });
    }

    const cleanPhone = cleanPhoneNumber(phoneNumber);
    const stored = otpStorage.get(cleanPhone);

    debug("OTP LOOKUP", {
      phone: cleanPhone,
      storedOtp: stored?.otp || "NOT FOUND",
      expiresAt: stored?.expiresAt ? new Date(stored.expiresAt).toISOString() : "N/A",
      now: new Date().toISOString(),
      expired: stored ? Date.now() > stored.expiresAt : "N/A",
    });

    if (!stored) {
      return res.status(400).json({ success: false, error: "OTP not found or already used" });
    }

    if (Date.now() > stored.expiresAt) {
      otpStorage.delete(cleanPhone);
      return res.status(400).json({ success: false, error: "OTP has expired" });
    }

    if (stored.otp !== otp) {
      debug("OTP MISMATCH", { expected: stored.otp, received: otp });
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }

    otpStorage.delete(cleanPhone);
    debug("OTP VERIFIED ✅", { phone: cleanPhone });

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("[Digitell] ❌ verifyWhatsAppOtpHandler error:", error.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// ─────────────────────────────────────────────

const resendWhatsAppOtpHandler = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    debug("INCOMING REQUEST → resendWhatsAppOtp", { body: req.body });

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: "Phone number is required" });
    }

    const cleanPhone = cleanPhoneNumber(phoneNumber);

    otpStorage.delete(cleanPhone);
    const otp = generateOTP();

    debug("NEW OTP GENERATED FOR RESEND", { otp, phone: cleanPhone });

    otpStorage.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    const result = await sendOtpTemplateMessage(cleanPhone, otp);

    debug("RESEND RESULT", { result });

    console.log(`[Digitell] ✅ OTP resent to ${cleanPhone}`);

    return res.json({
      success: true,
      message: "New OTP sent via WhatsApp successfully",
    });
  } catch (error) {
    console.error("[Digitell] ❌ resendWhatsAppOtpHandler error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────
// Generic Template Message Handler
// ─────────────────────────────────────────────

const sendTemplateMessageHandler = async (req, res) => {
  try {
    const {
      phoneNumber,
      templateName,
      templateLanguage = DEFAULT_TEMPLATE_LANGUAGE,
      fields = {},
      contact = null,
    } = req.body;

    if (!phoneNumber || !templateName) {
      return res.status(400).json({
        success: false,
        error: "phoneNumber and templateName are required",
      });
    }

    const cleanPhone = cleanPhoneNumber(phoneNumber);

    const result = await sendTemplateMessage(
      cleanPhone,
      templateName,
      templateLanguage,
      fields,
      contact
    );

    return res.json({
      success: true,
      message: "Template message sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("[Digitell] ❌ sendTemplateMessageHandler error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────
// Contact Lookup
// ─────────────────────────────────────────────

const getContactHandler = async (req, res) => {
  try {
    const { phoneNumber } = req.query;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: "phoneNumber query param is required" });
    }

    const response = await axios.get(digitellUrl("contact"), {
      headers: digitellHeaders(),
      params: { phone_number_or_email: phoneNumber },
    });

    debug("CONTACT LOOKUP RESULT", { data: response.data });

    return res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("[Digitell] ❌ getContactHandler error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────

module.exports = {
  sendWhatsAppOtpHandler,
  verifyWhatsAppOtpHandler,
  resendWhatsAppOtpHandler,
  sendTemplateMessageHandler,
  getContactHandler,
};