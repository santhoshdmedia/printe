const axios = require("axios");

// Green API configuration
const GREEN_API_URL = "https://7105.api.greenapi.com";
const INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID;
const API_TOKEN = process.env.GREEN_API_TOKEN;

// In-memory storage for WhatsApp OTPs (separate from email OTPs)
const whatsappOtpStorage = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send WhatsApp message via Green API
const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    const response = await axios.post(
      `${GREEN_API_URL}/waInstance${INSTANCE_ID}/sendMessage/${API_TOKEN}`,
      {
        chatId: `${phoneNumber}@c.us`,
        message: message,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Green API Error:", error.response?.data || error.message);
    throw new Error("Failed to send WhatsApp message");
  }
};

// Send WhatsApp OTP Handler
const sendWhatsAppOtpHandler = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validation
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    // Basic phone validation
    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with expiration (5 minutes)
    whatsappOtpStorage.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 300000, // 5 minutes
    });

    console.log(whatsappOtpStorage);

    // Create WhatsApp message
    const message = `🔐 *OTP Verification*\n\nYour OTP code is: *${otp}*\n\nThis OTP is valid for 5 minutes. Do not share this code with anyone.\n\nThank you for choosing our service!`;

    // Send WhatsApp message
    const result = await sendWhatsAppMessage(cleanPhone, message);

    if (result.idMessage) {
      console.log(`WhatsApp OTP ${otp} sent to ${cleanPhone}`);
      res.json({
        success: true,
        message: "OTP sent via WhatsApp successfully",
        messageId: result.idMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send OTP via WhatsApp",
      });
    }
  } catch (error) {
    console.error("Error in sendWhatsAppOtpHandler:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

// Verify WhatsApp OTP Handler
const verifyWhatsAppOtpHandler = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Validation
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: "Phone number and OTP are required",
      });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");

    // Check if OTP exists
    const storedData = whatsappOtpStorage.get(cleanPhone);
    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: "OTP not found or expired",
      });
    }

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
      whatsappOtpStorage.delete(cleanPhone);
      return res.status(400).json({
        success: false,
        error: "OTP has expired",
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP",
      });
    }

    // OTP is valid - clean up and return success
    whatsappOtpStorage.delete(cleanPhone);

    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error in verifyWhatsAppOtpHandler:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Resend WhatsApp OTP Handler
const resendWhatsAppOtpHandler = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");

    // Remove any existing OTP for this phone
    whatsappOtpStorage.delete(cleanPhone);

    // Generate new OTP
    const otp = generateOTP();

    // Store new OTP
    whatsappOtpStorage.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 300000, // 5 minutes
    });

    // Create new WhatsApp message
    const message = `🔐 *OTP Verification*\n\nYour new OTP code is: *${otp}*\n\nThis OTP is valid for 5 minutes. Do not share this code with anyone.\n\nThank you for choosing our service!`;

    // Send new WhatsApp message
    const result = await sendWhatsAppMessage(cleanPhone, message);

    if (result.idMessage) {
      console.log(`New WhatsApp OTP ${otp} sent to ${cleanPhone}`);
      res.json({
        success: true,
        message: "New OTP sent via WhatsApp successfully",
        messageId: result.idMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to resend OTP via WhatsApp",
      });
    }
  } catch (error) {
    console.error("Error in resendWhatsAppOtpHandler:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

// Check WhatsApp status (optional - for testing connection)
const checkWhatsAppStatusHandler = async (req, res) => {
  try {
    const response = await axios.get(
      `${GREEN_API_URL}/waInstance${INSTANCE_ID}/getStateInstance/${API_TOKEN}`
    );

    res.json({
      success: true,
      status: response.data.stateInstance,
      data: response.data,
    });
  } catch (error) {
    console.error("Error checking WhatsApp status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check WhatsApp status",
    });
  }
};

// Send Image Handler
const sendImageHandler = async (req, res) => {
  try {
    const { phoneNumber, imageUrl, caption } = req.body;

    if (!phoneNumber || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: "Phone number and image URL are required",
      });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const result = await sendWhatsAppImage(cleanPhone, imageUrl, caption);

    if (result.idMessage) {
      res.json({
        success: true,
        message: "Image sent successfully",
        messageId: result.idMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send image",
      });
    }
  } catch (error) {
    console.error("Error in sendImageHandler:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

// Send Document Handler
const sendDocumentHandler = async (req, res) => {
  try {
    const { phoneNumber, documentUrl, fileName, caption } = req.body;

    if (!phoneNumber || !documentUrl || !fileName) {
      return res.status(400).json({
        success: false,
        error: "Phone number, document URL, and file name are required",
      });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const result = await sendWhatsAppDocument(
      cleanPhone,
      documentUrl,
      fileName,
      caption
    );

    if (result.idMessage) {
      res.json({
        success: true,
        message: "Document sent successfully",
        messageId: result.idMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send document",
      });
    }
  } catch (error) {
    console.error("Error in sendDocumentHandler:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

// Send Video Handler
const sendVideoHandler = async (req, res) => {
  try {
    const { phoneNumber, videoUrl, caption } = req.body;

    if (!phoneNumber || !videoUrl) {
      return res.status(400).json({
        success: false,
        error: "Phone number and video URL are required",
      });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const result = await sendWhatsAppVideo(cleanPhone, videoUrl, caption);

    if (result.idMessage) {
      res.json({
        success: true,
        message: "Video sent successfully",
        messageId: result.idMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send video",
      });
    }
  } catch (error) {
    console.error("Error in sendVideoHandler:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

// Send Audio Handler
const sendAudioHandler = async (req, res) => {
  try {
    const { phoneNumber, audioUrl } = req.body;

    if (!phoneNumber || !audioUrl) {
      return res.status(400).json({
        success: false,
        error: "Phone number and audio URL are required",
      });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const result = await sendWhatsAppAudio(cleanPhone, audioUrl);

    if (result.idMessage) {
      res.json({
        success: true,
        message: "Audio sent successfully",
        messageId: result.idMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send audio",
      });
    }
  } catch (error) {
    console.error("Error in sendAudioHandler:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

// Send Location Handler
const sendLocationHandler = async (req, res) => {
  try {
    const { phoneNumber, latitude, longitude, name, address } = req.body;

    if (!phoneNumber || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Phone number, latitude, and longitude are required",
      });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const result = await sendWhatsAppLocation(
      cleanPhone,
      latitude,
      longitude,
      name,
      address
    );

    if (result.idMessage) {
      res.json({
        success: true,
        message: "Location sent successfully",
        messageId: result.idMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send location",
      });
    }
  } catch (error) {
    console.error("Error in sendLocationHandler:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

// Send Contact Handler
const sendContactHandler = async (req, res) => {
  try {
    const { phoneNumber, contactPhone, contactName } = req.body;

    if (!phoneNumber || !contactPhone || !contactName) {
      return res.status(400).json({
        success: false,
        error: "Phone number, contact phone, and contact name are required",
      });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const cleanContactPhone = contactPhone.replace(/\D/g, "");
    const result = await sendWhatsAppContact(
      cleanPhone,
      cleanContactPhone,
      contactName
    );

    if (result.idMessage) {
      res.json({
        success: true,
        message: "Contact sent successfully",
        messageId: result.idMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send contact",
      });
    }
  } catch (error) {
    console.error("Error in sendContactHandler:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

// Upload and Send File Handler (for local files)
const uploadAndSendFileHandler = async (req, res) => {
  try {
    const { phoneNumber, filePath, fileName, caption } = req.body;

    if (!phoneNumber || !filePath || !fileName) {
      return res.status(400).json({
        success: false,
        error: "Phone number, file path, and file name are required",
      });
    }

    // Read file from local path
    const fileBuffer = fs.readFileSync(filePath);

    // Upload to Green API
    const uploadResult = await uploadFileToGreenAPI(fileBuffer, fileName);

    if (!uploadResult.idFile) {
      return res.status(500).json({
        success: false,
        error: "Failed to upload file",
      });
    }

    // Send using uploaded file ID
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const sendResult = await sendWhatsAppMediaByUpload(
      cleanPhone,
      uploadResult.idFile,
      caption
    );

    if (sendResult.idMessage) {
      res.json({
        success: true,
        message: "File uploaded and sent successfully",
        messageId: sendResult.idMessage,
        fileId: uploadResult.idFile,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send uploaded file",
      });
    }
  } catch (error) {
    console.error("Error in uploadAndSendFileHandler:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

module.exports = {
  sendWhatsAppOtpHandler,
  verifyWhatsAppOtpHandler,
  resendWhatsAppOtpHandler,
  checkWhatsAppStatusHandler,
  sendImageHandler,
  sendDocumentHandler,
  sendVideoHandler,
  sendAudioHandler,
};
