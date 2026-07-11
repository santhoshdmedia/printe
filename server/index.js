const express = require("express");
const router = require("./routes");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");

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
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });