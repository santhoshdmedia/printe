const express = require("express");
const router = require("./routes");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const app = express();

// Trust proxy settings
app.set("trust proxy", 1);
app.use(morgan("dev"));

// Increase JSON body limit
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

// CORS - Allow ALL origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400,
  })
);

// Handle preflight requests
app.options("*", cors());

// Security + Cache-Control headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // Disable caching for all API routes
  if (req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "no-store, no-cache, private");
    res.setHeader("Pragma", "no-cache");
  }

  next();
});

// Test endpoint
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

// ==================== STATIC FILE SERVING ====================

function findDistPath() {
  const possiblePaths = [
    path.join(__dirname, "../live/dist"),
    path.join(process.cwd(), "dist"),
    path.join(__dirname, "dist"),
  ];

  for (const distPath of possiblePaths) {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      console.log(`✅ Found dist folder at: ${distPath}`);
      return distPath;
    }
  }

  console.log("❌ Dist folder not found in any location");
  return null;
}

const distPath = findDistPath();

if (distPath) {
  console.log(`📁 Serving static files from: ${distPath}`);
  app.use(express.static(distPath));
} else {
  console.log("❌ No dist folder found");
}

// All non-API routes serve the React SPA index.html
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  if (distPath) {
    return res.sendFile(path.join(distPath, "index.html"));
  }

  res.status(404).send("Frontend not built. Please run: npm run build");
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : err.message,
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
      console.log(`📦 MongoDB connected successfully`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);

      if (distPath) {
        console.log(`📁 Serving frontend from: ${distPath}`);
      } else {
        console.log(
          `❌ Frontend not built — run 'npm run build' in live folder`
        );
      }
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });