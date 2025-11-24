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
      req.path.startsWith('/static/')) {
    return next();
  }

  const filePath = path.resolve(__dirname, './build', 'index.html');
  
  // Check if build file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Build files not found. Please build the React app.');
  }

  try {
    const data = await fs.promises.readFile(filePath, 'utf8');

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
      
      try {
        // Fetch product from database using seo_url
        const product = await ProductSchema.findOne({ seo_url: productSeoUrl })
          .populate("category_details", "main_category_name")
          .populate("sub_category_details", "sub_category_name");

        if (product) {
          console.log(`Found product: ${product.name}`);
          
          // Use product data for OG tags
          ogTitle = product.seo_title || `${product.name} | PRINTE`;
          
          // Truncate description if too long (for SEO)
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
            
            if (typeof firstImage === 'string') {
              imagePath = firstImage;
            } else {
              imagePath = firstImage.path || firstImage.url || '';
            }
            
            if (imagePath) {
              if (imagePath.startsWith('http')) {
                ogImage = imagePath;
              } else {
                // Construct absolute URL for S3 images or relative paths
                ogImage = `https://printe.s3.ap-south-1.amazonaws.com/${imagePath.replace(/^\//, '')}`;
              }
            }
          }
          
          ogUrl = `https://printe.in${req.path}`;
          ogType = 'product';
          canonicalUrl = `https://printe.in/product/${product.seo_url}`;
        } else {
          console.log(`Product not found for seo_url: ${productSeoUrl}`);
        }
      } catch (error) {
        console.log('Error fetching product for OG tags:', error.message);
      }
    }
    // Handle other specific routes
    else if (req.path === '/contact') {
      ogTitle = 'Contact Us | PRINTE';
      ogDescription = 'Get in touch with Printe team for any queries';
      ogImage = 'https://i.imgur.com/V7irMl8.png';
    }
    else if (req.path === '/about') {
      ogTitle = 'About Us | PRINTE';
      ogDescription = 'Learn more about Printe and our mission';
    }
    else if (req.path === '/products' || req.path.startsWith('/category/')) {
      ogTitle = 'Products | PRINTE';
      ogDescription = 'Browse our amazing collection of products';
    }

    console.log(`OG Tags - Title: ${ogTitle}, Image: ${ogImage}`);

    // Replace ALL placeholders in index.html
    const result = data
      .replace(/\$OG_TITLE/g, ogTitle)
      .replace(/\$OG_DESCRIPTION/g, ogDescription)
      .replace(/\$OG_IMAGE/g, ogImage)
      .replace(/\$OG_URL/g, ogUrl)
      .replace(/\$OG_TYPE/g, ogType)
      .replace(/\$CANONICAL_URL/g, canonicalUrl);

    res.send(result);
  } catch (err) {
    console.error('Error serving dynamic OG tags:', err);
    
    // Fallback: serve the original index.html
    try {
      const fallbackData = await fs.promises.readFile(filePath, 'utf8');
      res.send(fallbackData);
    } catch (fallbackErr) {
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