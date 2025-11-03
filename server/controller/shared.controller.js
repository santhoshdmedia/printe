const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const filepath = require("path");
const _ = require("lodash");
const { successResponse } = require("../helper/response.helper");
require("dotenv").config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const UploadImage = async (req, res) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Body: req.file.buffer,
      Key: `${Date.now()}${filepath.extname(req.file.originalname)}`,
      // ACL: "public-read",
    };
    const uploadMeadia = new PutObjectCommand(params);
    await s3Client.send(uploadMeadia);
    const result = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
    successResponse(res, "Upload Succes", { url: result });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { UploadImage };
