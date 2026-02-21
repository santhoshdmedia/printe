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

// Increase JSON body limit
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// CORS - Allow ALL origins
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400,
}));

// Handle preflight requests
app.options('*', cors());

// Security + Cache-Control headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // Disable caching for all API routes
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, private');
    res.setHeader('Pragma', 'no-cache');
  }

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

function findDistPath() {
  const possiblePaths = [
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
  const firstImage = product.seo_img;
  let imagePath = '';

  if (typeof firstImage === 'string') {
    imagePath = firstImage;
  } else if (typeof firstImage === 'object') {
    imagePath = firstImage.path || firstImage.url || firstImage.image_url || '';
  }

  if (imagePath && imagePath.trim() !== '') {
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
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
      } else {
        return res.status(404).send('Product not found');
      }
    }

    console.log(`✅ Found product: ${product.name}`);

    const ogTitle = product.seo_title;
    let ogDescription = product.seo_description || 'Check out this amazing product on Printe';

    if (ogDescription.length > 155) {
      ogDescription = ogDescription.substring(0, 152) + '...';
    }

    const ogImage = getProductImageUrl(product);
    const ogUrl = `https://printe.in/product/${productId}`;
    const canonicalUrl = `https://printe.in/product/${product.seo_url}`;

    let assetJs = '/assets/index.js';
    let assetCss = '/assets/index.css';

    if (distPath) {
      try {
        const files = fs.readdirSync(path.join(distPath, 'assets'));
        const jsFile = files.find(f => f.endsWith('.js') && f.startsWith('index-'));
        const cssFile = files.find(f => f.endsWith('.css') && f.startsWith('index-'));

        if (jsFile) assetJs = `/assets/${jsFile}`;
        if (cssFile) assetCss = `/assets/${cssFile}`;
      } catch (err) {
        console.log('📦 Using default asset paths');
      }
    }

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/assets/fav-B54vuM6T.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${ogTitle}</title>
    
    <meta name="description" content="${ogDescription}" />
    <meta name="keywords" content="printe, products, shopping, ${product.name}" />
    <meta name="author" content="Printe" />
    
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${ogUrl}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="Printe" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    
    <meta property="product:price:amount" content="${product.price || '0'}" />
    <meta property="product:price:currency" content="INR" />
    <meta property="product:availability" content="${product.stock_count > 0 ? 'in stock' : 'out of stock'}" />
    <meta property="product:category" content="${product.category_details?.main_category_name || 'Products'}" />
    
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDescription}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="twitter:site" content="@printe" />
    
    <link rel="canonical" href="${canonicalUrl}" />
    
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-PHZNNT6QB8"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-PHZNNT6QB8');
    </script>

    <script type="application/ld+json">
      ${JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.seo_title,
        "description": ogDescription,
        "image": ogImage,
        "sku": product._id?.toString() || productId,
        "brand": { "@type": "Brand", "name": "Printe" },
        "offers": {
          "@type": "Offer",
          "url": ogUrl,
          "priceCurrency": "INR",
          "price": product.price || "0",
          "availability": `https://schema.org/${product.stock_count > 0 ? "InStock" : "OutOfStock"}`,
          "seller": { "@type": "Organization", "name": "Printe" }
        }
      })}
    </script>
    
    <link rel="stylesheet" href="${assetCss}">
  </head>
  <body>
    <div id="root"></div>
    
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
    
    <script type="module" src="${assetJs}"></script>
  </body>
</html>`;

    res.send(html);

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
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  if (req.path.startsWith('/product/')) {
    return res.status(404).send('Product route error');
  }

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