const cloudinary = require('cloudinary').v2;
const _ = require('lodash');
const { successResponse } = require("../helper/response.helper");
require("dotenv").config();

// Configure Cloudinary - better to use environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dmvc40kyp",
  api_key: process.env.CLOUDINARY_API_KEY || "753129661365923",
  api_secret: process.env.CLOUDINARY_API_SECRET || "6ElCTLSl3stnTo1C6wPomXIMtJU",
});

const UploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  // Generate a unique public_id with timestamp
  const publicId = `printee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Upload from memory buffer
  cloudinary.uploader.upload_stream(
    {
      folder: "printee",
      public_id: publicId,
      resource_type: "auto",
      format: "webp", 
      quality: "auto", 
      fetch_format: "auto",
      timestamp: Math.round(Date.now() / 1000), // Explicit timestamp
    },
    (err, result) => {
      if (err) {
        console.error("Cloudinary upload error:", err);
        
        // Handle specific stale request error
        if (err.http_code === 400 && err.message.includes('Stale request')) {
          return res.status(400).json({ 
            success: false, 
            error: "Upload request expired. Please try again." 
          });
        }
        
        return res.status(500).json({ 
          success: false, 
          error: "Image upload failed" 
        });
      }

      res.status(200).json({
        success: true,
        message: "Uploaded!",
        data: {
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
        },
      });
    }
  ).end(req.file.buffer);
};

module.exports = { UploadImage };