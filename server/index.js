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

// CORS — allow Vercel frontend domain + all origins for API
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400,
  })
);

app.options("*", cors());

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  if (req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "no-store, no-cache, private");
    res.setHeader("Pragma", "no-cache");
  }

  next();
});

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// All API routes
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
    product.seo_img,
    product.images?.[0]?.url,
    product.images?.[0]?.path,
  ];

  for (const src of candidates) {
    const raw =
      typeof src === "string"
        ? src.trim()
        : src && typeof src === "object"
        ? (src.url || src.path || "").trim()
        : "";

    if (!raw) continue;

    const clean = raw.split("?")[0]; // strip query string — crawlers reject URLs with params

    if (clean.startsWith("https://")) return clean;
    if (clean.startsWith("http://")) return clean.replace("http://", "https://");
    return `https://printe.s3.ap-south-1.amazonaws.com/${clean.replace(/^\//, "")}`;
  }

  return "https://printe.s3.ap-south-1.amazonaws.com/1763971587472-qf92jdbjm4.jpg";
}

// ==================== SSR — OG TAG INJECTION ====================
//
// Vercel rewrites /product/:id → this VPS route.
// WhatsApp / Facebook / Telegram crawlers hit this URL, get back HTML
// with pre-filled OG meta tags, and show the correct image + title.
// Regular users also hit this route via the Vercel rewrite proxy —
// they get the same HTML and the React app boots normally inside it.

app.get("/product/:id", async (req, res) => {
  const productId = req.params.id;

  console.log(`\n🎯 SSR OG inject: /product/${productId}`);

  try {
    const product = await ProductSchema.findOne({ seo_url: productId })
      .populate("category_details", "main_category_name")
      .populate("sub_category_details", "sub_category_name");

    if (!product) {
      console.log(`❌ Product not found: ${productId}`);
      // Redirect back to Vercel frontend — it will handle the 404 in React
      return res.redirect(302, `${process.env.FRONTEND_URL}/product/${productId}`);
    }

    console.log(`✅ Injecting OG tags for: ${product.name}`);

    // ── Meta values ──────────────────────────────────────────────────────
    const rawTitle = product.seo_title || product.name || "Printe Product";

    const rawDesc = (() => {
      const d = product.seo_description || "Check out this amazing product on Printe";
      return d.length > 155 ? d.substring(0, 152) + "..." : d;
    })();

    const ogTitle    = escapeHtml(rawTitle);
    const ogDesc     = escapeHtml(rawDesc);
    const ogImage    = getProductImageUrl(product);
    const ogUrl      = `https://printe.in/product/${productId}`;
    const canonical  = `https://printe.in/product/${product.seo_url || productId}`;
    const price      = product.customer_product_price || product.price || "0";
    const inStock    = product.stock_count > 0;
    const category   = escapeHtml(product.category_details?.main_category_name || "Products");
    const keywords   = escapeHtml(
      Array.isArray(product.seo_keywords)
        ? product.seo_keywords.join(", ")
        : product.seo_keywords || ""
    );

    // The Vercel-hosted JS/CSS assets — loaded from Vercel CDN, not this VPS
    const frontendUrl = process.env.FRONTEND_URL || "https://printe.in";

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
        price: price,
        availability: `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`,
        seller: { "@type": "Organization", name: "Printe" },
      },
    }).replace(/<\/script>/gi, "<\\/script>");

    // ── HTML ─────────────────────────────────────────────────────────────
    // This is a minimal shell — just enough for crawlers to read OG tags.
    // The actual React app is loaded from Vercel via the script tag below.
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="${frontendUrl}/favicon.ico" />

    <!-- Primary -->
    <title>${ogTitle}</title>
    <meta name="description" content="${ogDesc}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="author" content="Printe" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" />

    <!-- Open Graph (WhatsApp, Facebook, LinkedIn, Telegram) -->
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

    <!-- Product Open Graph -->
    <meta property="product:price:amount" content="${escapeHtml(price)}" />
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

    <!-- Razorpay -->
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-PHZNNT6QB8"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-PHZNNT6QB8');
    </script>
  </head>
  <body>
    <div id="root"></div>

    <!--
      Load the React app from Vercel.
      This makes the page fully interactive after the crawler reads the OG tags.
      The script src points to your Vercel deployment so assets are always fresh.
    -->
    <script type="module">
      // Dynamically load the Vercel-hosted entry point
      // so this SSR shell always uses the latest frontend build.
      const script = document.createElement('script');
      script.type = 'module';
      script.src = '${frontendUrl}/assets/index.js'; // Vercel will serve the correct hashed filename
      document.body.appendChild(script);

      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '${frontendUrl}/assets/index.css';
      document.head.appendChild(link);
    </script>
  </body>
</html>`;

    res.send(html);
  } catch (err) {
    console.error("❌ SSR error:", err);
    // On error redirect to Vercel — users still see the page
    return res.redirect(302, `${process.env.FRONTEND_URL}/product/${productId}`);
  }
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message,
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