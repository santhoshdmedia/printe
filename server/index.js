const express = require("express");
const router = require("./routes");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

// Import your ProductSchema
const { ProductSchema } = require("./controller/models_import");

const app = express();

// Trust proxy settings
app.set("trust proxy", 1);
app.use(morgan("dev"));

// CORS configuration
const allowedOrigins = [
  "https://printe.in",
  "https://www.printe.in",
  "https://www.admin.printe.in",
  "https://admin.printe.in",
  "https://vendor.printe.in",  
  "http://62.72.58.252",
  "https://62.72.58.252",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:8080",
  "null"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin === "null") {
      return callback(null, true);
    } else {
      console.log('CORS blocked:', origin);
      return callback(new Error('CORS blocked'), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Test endpoints
app.get("/api/test-https", (req, res) => {
  res.json({
    protocol: req.protocol,
    secure: req.secure,
    host: req.headers.host,
    forwardedProto: req.headers["x-forwarded-proto"],
    ip: req.ip,
    ips: req.ips,
    headers: req.headers,
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api", router);

// ==================== SSR CONFIGURATION ====================

// Find the correct dist folder path
function findDistPath() {
  const possiblePaths = [
    path.join(__dirname, '../live/dist'),
    path.join(__dirname, '../live/dist'),
    path.join(process.cwd(), 'dist'),   
    path.join(__dirname, 'dist'),       
  ];

  for (const distPath of possiblePaths) {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`✅ Found dist folder at: ${distPath}`);
      return distPath;
    }
  }
  
  console.log('❌ Dist folder not found in any location');
  return null;
}

const distPath = findDistPath();

if (distPath) {
  console.log(`📁 Serving static files from: ${distPath}`);
  app.use(express.static(distPath));
} else {
  console.log('❌ No dist folder found');
}

// Function to get product image URL
function getProductImageUrl(product) {
  if (!product?.images || product.images.length === 0) {
    return 'https://printe.s3.ap-south-1.amazonaws.com/1763971587472-qf92jdbjm4.jpg?v=1763973202533';
  }

  const firstImage = product.images[0]||product.variants[0].options[0].image_names[0];
  let imagePath = '';

  if (typeof firstImage === 'string') {
    imagePath = firstImage;
  } else if (typeof firstImage === 'object') {
    imagePath = firstImage.path || firstImage.url || firstImage.image_url || '';
  }

  console.log('📸 Raw image path:', imagePath);

  if (imagePath && imagePath.trim() !== '') {
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
      // Remove leading slash and construct S3 URL
      const cleanPath = imagePath.replace(/^\//, '');
      return `https://printe.s3.ap-south-1.amazonaws.com/${cleanPath}`;
    }
  }

  return 'https://printe.s3.ap-south-1.amazonaws.com/1763971587472-qf92jdbjm4.jpg?v=1763973202533';
}

// SSR Route for Product Pages
app.get("/product/:id", async (req, res) => {
  const productId = req.params.id;
  console.log(`\n🎯 Processing product route: /product/${productId}`);

  try {
    const product = await ProductSchema.findOne({ seo_url: productId })
      .populate("category_details", "main_category_name")
      .populate("sub_category_details", "sub_category_name");

    if (!product) {
      console.log(`❌ Product not found: ${productId}`);
      if (distPath) {
        return res.sendFile(path.join(distPath, 'index.html'));
      }
      return res.status(404).send('Product not found');
    }

    console.log(`✅ Found product: ${product.name}`);
    console.log(`📸 Product images structure:`, JSON.stringify(product.images, null, 2));
    
    // Test the image URL function
    const testImageUrl = getProductImageUrl(product);
    console.log(`🖼️ Final image URL: ${testImageUrl}`);

    // ... rest of your code
  } catch (error) {
    console.error('❌ Error generating SSR HTML:', error);
    if (distPath) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(500).send('Error loading page');
    }
  }
});

// All other routes serve the static React app
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Skip product routes (handled by SSR)
  if (req.path.startsWith('/product/')) {
    return res.status(404).send('Product route error');
  }

  // Serve static React app for all other routes
  if (distPath) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.status(404).send('Frontend not built. Please run: npm run build');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

const Port = process.env.PORT || 8080;
const Host = process.env.HOST || "0.0.0.0";

// MongoDB connection and server start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(Port, Host, () => {
      console.log(`\n🚀 Server running on http://${Host}:${Port}`);
      console.log(`📦 MongoDB connected successfully`);
      console.log(`🔍 SSR OG tags active for /product/:id routes`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      if (distPath) {
        console.log(`📁 Serving frontend from: ${distPath}`);
      } else {
        console.log(`❌ Frontend not built - run 'npm run build' in live folder`);
      }
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });