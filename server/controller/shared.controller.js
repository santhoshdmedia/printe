const cloudinary = require('cloudinary').v2;
const _ = require('lodash');
const { successResponse } = require("../helper/response.helper");
require("dotenv").config();

// Configure Cloudinary - better to use environment variables
cloudinary.config({
  cloud_name: process.env.cloud_name || "du7etum9n",
  api_key: process.env.api_key || "326778573543668",
  api_secret: process.env.api_secret || "0aLqiw-lPNiBBI_BXWj4X0-FEYs",
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

const UploadVideo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  // Generate a unique public_id with timestamp
  const publicId = `printee_video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Upload from memory buffer
  cloudinary.uploader.upload_stream(
    {
      folder: "printee/videos",
      public_id: publicId,
      resource_type: "video",
      chunk_size: 6000000, // 6MB chunks for large videos
      eager: [
        { width: 800, height: 600, crop: "limit" }, // Generate optimized version
        { quality: "auto", format: "mp4" } // Compressed version
      ],
      eager_async: true,
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
        
        // Handle file size limits
        if (err.http_code === 400 && err.message.includes('File size too large')) {
          return res.status(400).json({ 
            success: false, 
            error: "Video file is too large. Please upload a smaller file." 
          });
        }
        
        return res.status(500).json({ 
          success: false, 
          error: "Video upload failed" 
        });
      }

      res.status(200).json({
        success: true,
        message: "Video uploaded successfully!",
        data: {
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          duration: result.duration,
          bytes: result.bytes,
          // Include eager transformations if available
          optimized_url: result.eager && result.eager[0] ? result.eager[0].secure_url : null,
          compressed_url: result.eager && result.eager[1] ? result.eager[1].secure_url : null,
        },
      });
    }
  ).end(req.file.buffer);
};

module.exports = { UploadImage,UploadVideo };