const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage"); // For large file uploads
const _ = require("lodash");
const { successResponse, errorResponse } = require("../helper/response.helper");
require("dotenv").config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Increase timeouts for large files
  requestTimeout: 300000, // 5 minutes
  connectionTimeout: 300000,
});

const UploadImage = async (req, res) => {
  try {
    // Validate required fields
    if (!req.file) {
      return errorResponse(res, "No file uploaded");
    }

    console.log(`Uploading file: ${req.file.originalname}, Size: ${(req.file.size / (1024 * 1024)).toFixed(2)}MB`);

    // Generate unique file name
    const fileExtension = require('path').extname(req.file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;

    // For very large files, use multipart upload
    if (req.file.size > 100 * 1024 * 1024) { // If file > 100MB, use multipart
      console.log("Using multipart upload for large file");
      
      const parallelUploads3 = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.AWS_BUCKET,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        },
        partSize: 1024 * 1024 * 100, // 100MB parts
        queueSize: 4, // Concurrent parts
        leavePartsOnError: false,
      });

      parallelUploads3.on("httpUploadProgress", (progress) => {
        console.log(`Upload progress: ${progress.loaded}/${progress.total}`);
      });

      await parallelUploads3.done();
    } else {
      // Regular upload for smaller files
      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);
    }

    // Generate the URL
    const fileUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    
    successResponse(res, "Upload Successful", { 
      url: fileUrl,
      fileName: fileName,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

  } catch (err) {
    console.error("S3 Upload Error:", err);
    errorResponse(res, "File upload failed: " + err.message);
  }
};

module.exports = { UploadImage };