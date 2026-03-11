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

// ==================== CORS — ALLOW ALL ====================

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: "*",
    maxAge: 86400,
  })
);

app.options("*", cors());

// ==================== GLOBAL HEADERS ====================

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

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

    const clean = raw.split("?")[0];

    if (clean.startsWith("https://")) return clean;
    if (clean.startsWith("http://")) return clean.replace("http://", "https://");
    return `https://printe.s3.ap-south-1.amazonaws.com/${clean.replace(/^\//, "")}`;
  }

  return "https://printe.s3.ap-south-1.amazonaws.com/1763971587472-qf92jdbjm4.jpg";
}

// ==================== SSR — OG TAG INJECTION ====================

app.get("/product/:id", async (req, res) => {
  const productId = req.params.id;
  const frontendUrl = process.env.FRONTEND_URL || "https://printe.in";

  try {
    const product = await ProductSchema.findOne({ seo_url: productId })
      .populate("category_details", "main_category_name")
      .populate("sub_category_details", "sub_category_name");

    const rawTitle = product?.seo_title || product?.name || "Printe Product";
    const rawDesc = (() => {
      const d = product?.seo_description || "Check out this amazing product on Printe";
      return d.length > 155 ? d.substring(0, 152) + "..." : d;
    })();
    const ogTitle  = escapeHtml(rawTitle);
    const ogDesc   = escapeHtml(rawDesc);
    const ogImage  = product ? getProductImageUrl(product) : "https://printe.s3.ap-south-1.amazonaws.com/1763971587472-qf92jdbjm4.jpg";
    const ogUrl    = `https://printe.in/product/${productId}`;
    const canonical = `https://printe.in/product/${product?.seo_url || productId}`;
    const price    = product?.customer_product_price || product?.price || "0";
    const inStock  = (product?.stock_count || 0) > 0;
    const category = escapeHtml(product?.category_details?.main_category_name || "Products");
    const keywords = escapeHtml(
      Array.isArray(product?.seo_keywords)
        ? product.seo_keywords.join(", ")
        : product?.seo_keywords || ""
    );

    const schemaOrg = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      name: rawTitle,
      description: rawDesc,
      image: ogImage,
      sku: product?._id?.toString() || productId,
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
    <link rel="icon" href="${frontendUrl}/favicon.ico" />

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

    <!-- Razorpay -->
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-PHZNNT6QB8"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){ dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-PHZNNT6QB8');
    </script>

    <!--
      Load CSS from Vercel.
      The base href trick makes all relative asset paths resolve to Vercel.
    -->
    <base href="${frontendUrl}/" />
  </head>
  <body>
    <div id="root"></div>

    <!--
      Instead of fetching Vercel's index.html (blocked by CORS),
      we use window.location to load the full Vercel page in-place.
      This preserves the current URL in the browser while loading
      the React app cleanly from Vercel.
    -->
    <script>
      // Replace the current document with Vercel's full React app
      // without changing the URL shown in the browser address bar.
      (function () {
        const url = '${frontendUrl}' + window.location.pathname + window.location.search + window.location.hash;
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:none;margin:0;padding:0;z-index:9999;';
        document.body.appendChild(iframe);

        // Hide the root div since iframe covers it
        document.getElementById('root').style.display = 'none';
      })();
    </script>
  </body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);

  } catch (err) {
    console.error("❌ SSR error:", err);
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <title>Printe</title>
    <base href="${frontendUrl}/" />
  </head>
  <body>
    <div id="root"></div>
    <script>
      const iframe = document.createElement('iframe');
      iframe.src = '${frontendUrl}' + window.location.pathname;
      iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:9999;';
      document.body.appendChild(iframe);
    </script>
  </body>
</html>`);
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
      console.log(`\n🚀 Server running on http://${Host}:${Port}`);
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