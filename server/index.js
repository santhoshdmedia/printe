const express = require("express");
const router = require("./routes");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

// Import your ProductSchema (adjust the path as needed)
const { ProductSchema } = require("./controller/models_import");

const app = express();

// Trust proxy settings (essential for proper header forwarding)
app.set("trust proxy", 1);

// Middleware pipeline
app.use(morgan("dev"));

// Enhanced CORS configuration
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
  "null" // Add null as string for file:// protocol
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests, file://)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or if it's null
      if (allowedOrigins.indexOf(origin) !== -1 || origin === "null") {
        return callback(null, true);
      } else {
        const msg = `The CORS policy for this site does not allow access from ${origin}`;
        console.log('CORS blocked:', origin);
        return callback(new Error(msg), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400,
  }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REMOVED HTTPS ENFORCEMENT MIDDLEWARE - Let Nginx handle this

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
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

// Serve static files from React build (important for production)
app.use(express.static(path.join(__dirname, 'build')));

// Dynamic OG Tags Middleware for All Routes
app.get('*', async (req, res, next) => {
  // Skip API routes and static files
  if (req.path.startsWith('/api') || 
      req.path.includes('.') || 
      req.path.startsWith('/static/') ||
      req.path.startsWith('/assets/')) {
    return next();
  }

  // Try multiple possible build paths
  const possiblePaths = [
    path.resolve(__dirname, './dist', 'index.html'),
    path.resolve(__dirname, '../live/dist', 'index.html'),
    path.resolve(__dirname, 'build', 'index.html'),
    path.resolve(__dirname, '../client/build', 'index.html')
  ];

  let filePath;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      filePath = possiblePath;
      break;
    }
  }

  if (!filePath) {
    console.error('Build file not found in any location');
    return res.status(404).send('Build files not found. Please build the React app.');
  }

  console.log(`Using build file: ${filePath}`);

  try {
    const data = await fs.promises.readFile(filePath, 'utf8');

    // Log what we're reading (first 500 chars to check placeholders)
    console.log('File content starts with:', data.substring(0, 500));

    // Default OG values
    let ogTitle = 'PRINTE - Amazing Products';
    let ogDescription = 'Discover amazing products at Printe';
    let ogImage = 'https://printe.s3.ap-south-1.amazonaws.com/1763971587472-qf92jdbjm4.jpg?v=1763973202533';
    let ogUrl = `https://printe.in${req.path}`;
    let ogType = 'website';
    let canonicalUrl = `https://printe.in${req.path}`;

    console.log(`Processing OG tags for route: ${req.path}`);

    // Handle product routes
    if (req.path.startsWith('/product/')) {
      const productSeoUrl = req.path.split('/product/')[1];
      console.log(`Looking for product with SEO URL: ${productSeoUrl}`);
      
      try {
        // Fetch product from database using seo_url
        const product = await ProductSchema.findOne({ seo_url: productSeoUrl })
          .populate("category_details", "main_category_name")
          .populate("sub_category_details", "sub_category_name");

        if (product) {
          console.log(`✅ Found product: ${product.name}`);
          console.log(`Product images:`, product.images);
          
          // Use product data for OG tags
          ogTitle = product.seo_title || `${product.name} | PRINTE`;
          
          // Truncate description if too long
          let description = product.short_description || 
                           product.product_description_tittle || 
                           'Check out this amazing product on Printe';
          if (description.length > 155) {
            description = description.substring(0, 152) + '...';
          }
          ogDescription = description;
          
          // Handle product images
          if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            let imagePath = '';
            
            console.log('First image data:', firstImage);
            
            if (typeof firstImage === 'string') {
              imagePath = firstImage;
            } else {
              imagePath = firstImage.path || firstImage.url || '';
            }
            
            console.log(`Extracted image path: ${imagePath}`);
            
            if (imagePath) {
              if (imagePath.startsWith('http')) {
                ogImage = imagePath;
              } else {
                // Remove leading slash if present
                const cleanPath = imagePath.replace(/^\//, '');
                ogImage = `https://printe.s3.ap-south-1.amazonaws.com/${cleanPath}`;
              }
              console.log(`✅ Final OG Image URL: ${ogImage}`);
            } else {
              console.log('❌ No valid image path found');
            }
          } else {
            console.log('❌ No images found for product');
          }
          
          ogUrl = `https://printe.in${req.path}`;
          ogType = 'product';
          canonicalUrl = `https://printe.in/product/${product.seo_url}`;
        } else {
          console.log(`❌ Product not found for seo_url: ${productSeoUrl}`);
        }
      } catch (error) {
        console.log('❌ Error fetching product for OG tags:', error.message);
      }
    }

    console.log(`🎯 Final OG Tags - Title: ${ogTitle}`);
    console.log(`🎯 Final OG Tags - Image: ${ogImage}`);
    console.log(`🎯 Final OG Tags - Description: ${ogDescription}`);

    // Check if placeholders exist in the file
    const hasTitlePlaceholder = data.includes('$OG_TITLE');
    const hasImagePlaceholder = data.includes('$OG_IMAGE');
    const hasDescriptionPlaceholder = data.includes('$OG_DESCRIPTION');

    console.log(`Placeholders found - Title: ${hasTitlePlaceholder}, Image: ${hasImagePlaceholder}, Description: ${hasDescriptionPlaceholder}`);

    // Replace placeholders in index.html
    const result = data
      .replace(/\$OG_TITLE/g, ogTitle)
      .replace(/\$OG_DESCRIPTION/g, ogDescription)
      .replace(/\$OG_IMAGE/g, ogImage)
      .replace(/\$OG_URL/g, ogUrl)
      .replace(/\$OG_TYPE/g, ogType)
      .replace(/\$CANONICAL_URL/g, canonicalUrl);

    // Log a snippet of the result to verify replacement
    const resultSnippet = result.substring(0, 800);
    console.log('Result snippet (first 800 chars):', resultSnippet);

    res.send(result);
  } catch (err) {
    console.error('❌ Error serving dynamic OG tags:', err);
    
    // Fallback: serve the original index.html
    try {
      const fallbackData = await fs.promises.readFile(filePath, 'utf8');
      res.send(fallbackData);
    } catch (fallbackErr) {
      console.error('❌ Fallback also failed:', fallbackErr);
      res.status(500).send('Error loading page');
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl
  });
});

const Port = process.env.PORT || 8080;
const Host = process.env.HOST || "0.0.0.0";

// MongoDB connection and server start
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(Port, Host, () => {
      console.log(`🚀 Server running on http://${Host}:${Port}`);
      console.log(`📦 MongoDB connected successfully`);
      console.log(`🔍 Dynamic OG tags middleware is active`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });