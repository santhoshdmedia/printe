const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: "dija60v2h",
  api_key: "558481782721734",
  api_secret: "h8X2thb1crkixTR22UkZOQfuwcY"
});

module.exports = cloudinary;