const express = require("express");
const router = require("./routes");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");
const path = require("path");

const app = express();

// Trust proxy settings (essential for proper header forwarding)
app.set("trust proxy", 1);

// Middleware pipeline
app.use(morgan("dev"));

// Enhanced CORS configuration
const allowedOrigins = [
  "https://printe.in",
  "https://www.printe.in",
  "http://62.72.58.252",
  "https://62.72.58.252",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8080"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400,
  })
);

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

const Port = process.env.PORT || 8080;
const Host = process.env.HOST || "0.0.0.0";

// MongoDB connection and server start
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(Port, Host, () => {
      console.log(`Server running on http://${Host}:${Port}`);
      console.log(`MongoDB connected successfully 🚀`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });