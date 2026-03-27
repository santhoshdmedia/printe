const axios = require("axios");

// ─────────────────────────────────────────────
// Digitell Configuration
// Add this to your .env file:
//   DIGITELL_TOKEN=your_api_token
//   OTP_TEMPLATE_NAME=your_approved_template_name
//   OTP_TEMPLATE_LANGUAGE=en_us
// ─────────────────────────────────────────────
const DIGITELL_BASE_URL = "https://official.digitellagency.in/api";
const DIGITELL_VENDOR_UID = "ef46f737-df5f-4f12-bfe6-0bb3b8aa2bda";
const DIGITELL_TOKEN = "JLVPyHpuyOP1vDfi99Uoe9JdjtsYFlRQK4blX96HlHAw38ryIOfzzT29qq6fjFII";

// In-memory OTP storage (replace with Redis in production)
const otpStorage = new Map();

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const cleanPhoneNumber = (phone) => String(phone).replace(/\D/g, "");

/**
 * Builds the full Digitell endpoint URL.
 * Token is passed both as query param and Bearer Token for compatibility.
 */
const digitellUrl = (path) =>
  `${DIGITELL_BASE_URL}/${DIGITELL_VENDOR_UID}/${path}?token=${DIGITELL_TOKEN}`;

const digitellHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${DIGITELL_TOKEN}`,
});

// ─────────────────────────────────────────────
// Core: Send a Template Message via Digitell
// ─────────────────────────────────────────────

/**
 * Sends a WhatsApp template message via Digitell.
 *
 * @param {string} phoneNumber - Recipient phone (digits only, with country code e.g. 919876543210)
 * @param {string} templateName - Approved template name in Digitell / Meta
 * @param {string} templateLanguage - e.g. "en_us"
 * @param {Object} fields - Body variables: { field_1, field_2, ... } mapped to {{1}}, {{2}} …
 * @param {Object|null} contact - Optional: auto-create contact if it doesn't exist
 */
const sendTemplateMessage = async (
  phoneNumber,
  templateName,
  templateLanguage = "en_us",
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

  const response = await axios.post(
    digitellUrl("contact/send-template-message"),
    payload,
    { headers: digitellHeaders() }
  );

  return response.data;
};

// ─────────────────────────────────────────────
// Core: Send a Plain Text Message via Digitell
// ─────────────────────────────────────────────

/**
 * Sends a free-form text message (only allowed within 24-hour session window).
 *
 * @param {string} phoneNumber - Recipient phone (digits only)
 * @param {string} message - Text content to send
 */
const sendTextMessage = async (phoneNumber, message) => {
  const response = await axios.post(
    digitellUrl("contact/send-message"),
    {
      phone_number: phoneNumber,
      message,
    },
    { headers: digitellHeaders() }
  );

  return response.data;
};

// ─────────────────────────────────────────────
// OTP Handlers
// ─────────────────────────────────────────────

/**
 * Send OTP via WhatsApp.
 *
 * Uses a Digitell/Meta approved template where {{1}} = OTP code.
 * Set OTP_TEMPLATE_NAME in .env (e.g. "otp_verification").
 *
 * Example template body:
 *   "Your OTP is {{1}}. Valid for 5 minutes. Do not share this code."
 *
 * Request body: { "phoneNumber": "919876543210" }
 */
const sendWhatsAppOtpHandler = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: "Phone number is required" });
    }

    const cleanPhone = cleanPhoneNumber(phoneNumber);

    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: "Invalid phone number" });
    }

    const otp = generateOTP();

    // Store OTP with 5-minute expiry
    otpStorage.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendTemplateMessage(
      cleanPhone,
      process.env.OTP_TEMPLATE_NAME || "otp_verification",
      process.env.OTP_TEMPLATE_LANGUAGE || "en_us",
      { field_1: otp }  // field_1 maps to {{1}} in your Meta-approved template
    );

    console.log(`[Digitell] OTP sent to ${cleanPhone}`);

    return res.json({
      success: true,
      message: "OTP sent via WhatsApp successfully",
    });
  } catch (error) {
    console.error("[Digitell] sendWhatsAppOtpHandler error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────

/**
 * Verify OTP submitted by the user.
 *
 * Request body: { "phoneNumber": "919876543210", "otp": "123456" }
 */
const verifyWhatsAppOtpHandler = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ success: false, error: "Phone number and OTP are required" });
    }

    const cleanPhone = cleanPhoneNumber(phoneNumber);
    const stored = otpStorage.get(cleanPhone);

    if (!stored) {
      return res.status(400).json({ success: false, error: "OTP not found or already used" });
    }

    if (Date.now() > stored.expiresAt) {
      otpStorage.delete(cleanPhone);
      return res.status(400).json({ success: false, error: "OTP has expired" });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }

    otpStorage.delete(cleanPhone);

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("[Digitell] verifyWhatsAppOtpHandler error:", error.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// ─────────────────────────────────────────────

/**
 * Resend a fresh OTP to the same number.
 *
 * Request body: { "phoneNumber": "919876543210" }
 */
const resendWhatsAppOtpHandler = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: "Phone number is required" });
    }

    const cleanPhone = cleanPhoneNumber(phoneNumber);

    otpStorage.delete(cleanPhone); // clear old OTP
    const otp = generateOTP();

    otpStorage.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendTemplateMessage(
      cleanPhone,
      process.env.OTP_TEMPLATE_NAME || "otp_verification",
      process.env.OTP_TEMPLATE_LANGUAGE || "en_us",
      { field_1: otp }
    );

    console.log(`[Digitell] OTP resent to ${cleanPhone}`);

    return res.json({
      success: true,
      message: "New OTP sent via WhatsApp successfully",
    });
  } catch (error) {
    console.error("[Digitell] resendWhatsAppOtpHandler error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────
// Generic Template Message Handler
// ─────────────────────────────────────────────

/**
 * Send any approved template message.
 *
 * Request body:
 * {
 *   "phoneNumber": "919876543210",
 *   "templateName": "order_confirmation",
 *   "templateLanguage": "en_us",
 *   "fields": { "field_1": "John", "field_2": "#ORD123" },
 *   "contact": {
 *     "first_name": "John", "last_name": "Doe",
 *     "email": "john@example.com", "country": "india",
 *     "language_code": "en", "groups": "group1,group2"
 *   }
 * }
 */
const sendTemplateMessageHandler = async (req, res) => {
  try {
    const {
      phoneNumber,
      templateName,
      templateLanguage = "en_us",
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
    console.error("[Digitell] sendTemplateMessageHandler error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────
// Contact Lookup
// ─────────────────────────────────────────────

/**
 * Look up a contact by phone number or email.
 * Query param: ?phoneNumber=919876543210
 */
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

    return res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("[Digitell] getContactHandler error:", error.response?.data || error.message);
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