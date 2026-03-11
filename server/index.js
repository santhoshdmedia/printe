const express = require("express");
const router = require("./routes");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");

const { ProductSchema } = require("./controller/models_import");

const app = express();

app.set("trust proxy", 1);
app.use(morgan("dev"));

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: "*",
  maxAge: 86400,
}));

app.options("*", cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  // NOTE: X-Frame-Options REMOVED — was causing iframe issues

  if (req.method === "OPTIONS") return res.sendStatus(204);

  if (req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "no-store, no-cache, private");
    res.setHeader("Pragma", "no-cache");
  }

  next();
});

// ==================== HEALTH CHECK ====================

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ==================== API ROUTES ====================

app.use("/api", router);

// ==================== HELPERS ====================

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getProductImageUrl(product) {
  const candidates = [
    product?.seo_img,
    product?.images?.[0]?.url,
    product?.images?.[0]?.path,
    product?.images?.[0]?.image,
    product?.images?.[0],
    product?.thumbnail,
    product?.image,
    product?.main_image,
  ];

  for (const src of candidates) {
    const raw =
      typeof src === "string"
        ? src.trim()
        : src && typeof src === "object"
        ? (src.url || src.path || src.image || src.src || "").trim()
        : "";

    if (!raw) continue;

    const clean = raw.split("?")[0];

    if (clean.startsWith("https://")) return clean;
    if (clean.startsWith("http://")) return clean.replace("http://", "https://");
    if (clean.length > 5) return `https://printe.s3.ap-south-1.amazonaws.com/${clean.replace(/^\//, "")}`;
  }

  return "https://printe.s3.ap-south-1.amazonaws.com/1763971587472-qf92jdbjm4.jpg";
}

// ==================== SSR — OG TAG INJECTION ====================

app.get("/product/:id", async (req, res) => {
  const productId = req.params.id;
  const userAgent = req.headers["user-agent"] || "";
  const frontendUrl = process.env.FRONTEND_URL || "https://printe.in";

  console.log(`\n🎯 /product/${productId}`);
  console.log(`   UA: ${userAgent}`);

  const isCrawler = /facebookexternalhit|whatsapp|twitterbot|linkedinbot|telegrambot|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver|discordbot|applebot|Slackbot|vkShare|W3C_Validator/i.test(userAgent);

  // Real user — serve a self-contained HTML page that loads React from Vercel
  // We CANNOT redirect (causes loop) and CANNOT fetch/iframe (CORS/X-Frame blocked)
  // Solution: use window.history to fix the URL, load Vercel's index.html via JS
  if (!isCrawler) {
    console.log(`👤 Real user — serving React loader`);
    return res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Printe</title>
    <style>
      body { margin: 0; background: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; }
      .loader { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #333; border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="loader"></div>
    <script>
      // Navigate to the Vercel frontend preserving the path
      // Use replace so back button works correctly
      window.location.replace('${frontendUrl}' + window.location.pathname + window.location.search + window.location.hash);
    </script>
  </body>
</html>`);
  }

  // Crawler — serve full OG HTML
  console.log(`🤖 Crawler — serving OG HTML`);

  try {
    const product = await ProductSchema.findOne({ seo_url: productId })
      .populate("category_details", "main_category_name")
      .populate("sub_category_details", "sub_category_name");

    if (!product) {
      console.log(`❌ Product not found: ${productId}`);
      return res.status(404).send(`<html><head><title>Not Found</title></head><body><p>Product not found</p></body></html>`);
    }

    console.log(`✅ Product: ${product.name}`);
    console.log(`🖼️  seo_img: ${product.seo_img}`);
    console.log(`🖼️  images[0]: ${JSON.stringify(product.images?.[0])}`);

    const rawTitle = product.seo_title || product.name || "Printe Product";
    const rawDesc = (() => {
      const d = product.seo_description || "Check out this amazing product on Printe";
      return d.length > 155 ? d.substring(0, 152) + "..." : d;
    })();

    const ogTitle   = escapeHtml(rawTitle);
    const ogDesc    = escapeHtml(rawDesc);
    const ogImage   = getProductImageUrl(product);
    const ogUrl     = `https://printe.in/product/${productId}`;
    const canonical = `https://printe.in/product/${product.seo_url || productId}`;
    const price     = product.customer_product_price || product.price || "0";
    const inStock   = (product.stock_count || 0) > 0;
    const category  = escapeHtml(product.category_details?.main_category_name || "Products");
    const keywords  = escapeHtml(
      Array.isArray(product.seo_keywords)
        ? product.seo_keywords.join(", ")
        : product.seo_keywords || ""
    );

    console.log(`🖼️  resolved ogImage: ${ogImage}`);

    const schemaOrg = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      name: rawTitle,
      description: rawDesc,
      image: ogImage,
      sku: product._id?.toString() || productId,
      brand: { "@type": "Brand", name: "Printe" },
      offers: {
        "@type": "Offer",
        url: ogUrl,
        priceCurrency: "INR",
        price: String(price),
        availability: `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`,
        seller: { "@type": "Organization", name: "Printe" },
      },
    }).replace(/<\/script>/gi, "<\\/script>");

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${ogTitle}</title>
    <meta name="description" content="${ogDesc}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="author" content="Printe" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" />

    <!-- Open Graph -->
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="Printe" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDesc}" />
    <meta property="og:url" content="${ogUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:secure_url" content="${ogImage}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${ogTitle}" />

    <!-- Product OG -->
    <meta property="product:price:amount" content="${escapeHtml(String(price))}" />
    <meta property="product:price:currency" content="INR" />
    <meta property="product:availability" content="${inStock ? "in stock" : "out of stock"}" />
    <meta property="product:category" content="${category}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@printe" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDesc}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="twitter:image:alt" content="${ogTitle}" />

    <!-- Schema.org -->
    <script type="application/ld+json">${schemaOrg}</script>
  </head>
  <body>
    <h1>${ogTitle}</h1>
    <p>${ogDesc}</p>
    <img src="${ogImage}" alt="${ogTitle}" />
    <a href="${ogUrl}">View Product</a>
  </body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);

  } catch (err) {
    console.error("❌ SSR error:", err);
    res.status(500).send(`<html><body><p>Error loading product</p></body></html>`);
  }
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message,
  });
});

// ==================== START ====================

const Port = process.env.PORT || 8080;
const Host = process.env.HOST || "0.0.0.0";

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(Port, Host, () => {
      console.log(`\n🚀 VPS server running on http://${Host}:${Port}`);
      console.log(`📦 MongoDB connected`);
      console.log(`🔍 SSR OG injection active for /product/:id`);
      console.log(`🌐 Frontend (Vercel): ${process.env.FRONTEND_URL || "https://printe.in"}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });