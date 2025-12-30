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
  "https://customercare.printe.in",
  "http://customercare.printe.in",
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
    path.join(__dirname, '../live/dist'),      // live/server -> ../dist
    path.join(__dirname, '../live/dist'),   // live/server -> ../../dist  
    path.join(process.cwd(), 'dist'),     // Current directory
    path.join(__dirname, 'dist'),         // Server directory
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
  

  const firstImage = product.seo_img;
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
    // Fetch product data from database
    const product = await ProductSchema.findOne({ seo_url: productId })
      .populate("category_details", "main_category_name")
      .populate("sub_category_details", "sub_category_name");

    if (!product) {
      console.log(`❌ Product not found: ${productId}`);
      // Fallback to static file if product not found
      if (distPath) {
        return res.sendFile(path.join(distPath, 'index.html'));
      } else {
        return res.status(404).send('Product not found');
      }
    }

    console.log(`✅ Found product: ${product.name}`);
    console.log(`📸 Product images:`, product.images);

    // Prepare OG data
    const ogTitle = product.seo_title ;
    let ogDescription = product.seo_description || 
                       'Check out this amazing product on Printe';
    
    // Truncate description for SEO
    if (ogDescription.length > 155) {
      ogDescription = ogDescription.substring(0, 152) + '...';
    }
    
    const ogImage = getProductImageUrl(product);
    const ogUrl = `https://printe.in/product/${productId}`;
    const canonicalUrl = `https://printe.in/product/${product.seo_url}`;

    console.log(`📊 OG Data:`);
    console.log(`   Title: ${ogTitle}`);
    console.log(`   Description: ${ogDescription}`);
    console.log(`   Image: ${ogImage}`);
    console.log(`   URL: ${ogUrl}`);

    // Read the built index.html to get the asset paths
    let assetJs = '/assets/index.js';
    let assetCss = '/assets/index.css';
    
    if (distPath) {
      try {
        const files = fs.readdirSync(path.join(distPath, 'assets'));
        const jsFile = files.find(f => f.endsWith('.js') && f.startsWith('index-'));
        const cssFile = files.find(f => f.endsWith('.css') && f.startsWith('index-'));
        
        if (jsFile) assetJs = `/assets/${jsFile}`;
        if (cssFile) assetCss = `/assets/${cssFile}`;
        
        console.log(`📦 Assets: JS=${assetJs}, CSS=${assetCss}`);
      } catch (err) {
        console.log('📦 Using default asset paths');
      }
    }

    // Generate complete HTML with OG tags
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/assets/fav-B54vuM6T.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${ogTitle}</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="${ogDescription}" />
    <meta name="keywords" content="printe, products, shopping, ${product.name}" />
    <meta name="author" content="Printe" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${ogUrl}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="Printe" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    
    <!-- Product Specific OG Tags -->
    <meta property="product:price:amount" content="${product.price || '0'}" />
    <meta property="product:price:currency" content="INR" />
    <meta property="product:availability" content="${product.stock_count > 0 ? 'in stock' : 'out of stock'}" />
    <meta property="product:category" content="${product.category_details?.main_category_name || 'Products'}" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDescription}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="twitter:site" content="@printe" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${canonicalUrl}" />
    
    <!-- External Scripts -->
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-PHZNNT6QB8"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-PHZNNT6QB8');
    </script>

    <!-- Structured Data for SEO -->
    <script type="application/ld+json">
      ${JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.seo_title,
        "description": ogDescription,
        "image": ogImage,
        "sku": product._id?.toString() || productId,
        "brand": {
          "@type": "Brand",
          "name": "Printe"
        },
        "offers": {
          "@type": "Offer",
          "url": ogUrl,
          "priceCurrency": "INR",
          "price": product.price || "0",
          "availability": `https://schema.org/${product.stock_count > 0 ? "InStock" : "OutOfStock"}`,
          "seller": {
            "@type": "Organization",
            "name": "Printe"
          }
        }
      })}
    </script>
    
    <!-- CSS -->
    <link rel="stylesheet" href="${assetCss}">
  </head>
  <body>
    <div id="root"></div>
    
    <!-- Initialize React with product data -->
    <script>
      window.__INITIAL_STATE__ = {
        product: ${JSON.stringify(product)},
        seoData: {
          title: "${ogTitle}",
          description: "${ogDescription}",
          image: "${ogImage}",
          url: "${ogUrl}"
        }
      };
    </script>
    
    <!-- JavaScript -->
    <script type="module" src="${assetJs}"></script>
  </body>
</html>`;

    console.log(`✅ SSR HTML generated successfully`);
    res.send(html);

  } catch (error) {
    console.error('❌ Error generating SSR HTML:', error);
    
    // Fallback: serve static index.html
    if (distPath) {
      console.log('🔄 Falling back to static file');
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