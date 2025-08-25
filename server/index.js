// const express = require("express");
// const router = require("./routes");
// const cors = require("cors");
// const mongoose = require("mongoose");
// require("dotenv").config();
// const morgan = require("morgan");
// const path = require("path");
// const app = express();

// // Trust proxy settings (must come first)
// app.set('trust proxy', 1); // Trust first proxy
// app.enable('trust proxy'); // Alternative syntax

// // Middleware pipeline
// app.use(morgan("dev"));

// // Enhanced CORS configuration
// const allowedOrigins = [
//   'https://printe.in',
//   'https://www.printe.in',
//   'http://62.72.58.252',
//   'https://62.72.58.252',
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
    
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = `The CORS policy for this site does not allow access from ${origin}`;
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   credentials: true,
//   maxAge: 86400 // 24 hours
// }));

// // Body parsers
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // HTTPS enforcement middleware
// app.use((req, res, next) => {
//   if (process.env.NODE_ENV === 'production') {
//     if (req.headers['x-forwarded-proto'] !== 'https') {
//       return res.redirect(`https://${req.headers.host}${req.url}`);
//     }
//     req.secure = true; // Explicitly set secure flag
//   }
//   next();
// });

// // Security headers middleware
// app.use((req, res, next) => {
//   res.setHeader('X-Content-Type-Options', 'nosniff');
//   res.setHeader('X-Frame-Options', 'DENY');
//   res.setHeader('X-XSS-Protection', '1; mode=block');
//   res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
//   next();
// });

// // Test endpoints
// app.get('/api/test-https', (req, res) => {
//   res.json({
//     protocol: req.protocol,
//     secure: req.secure,
//     host: req.headers.host,
//     forwardedProto: req.headers['x-forwarded-proto'],
//     ip: req.ip,
//     ips: req.ips,
//     headers: req.headers
//   });
// });


// app.get("/",(res,req)=>{
//   res.status(200).json({
//     status:"ok",
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   })
// })
// app.use("/api", router);

// const Port= process.env.port||8080;

// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => {
//     app.listen( Port, () => {
//       console.log(`server listening on port ${Port}` );
//     });
//   })
//   .catch((e) => {
//     console.log(e, "error");
//   });


const express = require("express");
const router = require("./routes");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");
const path = require("path");
const http = require("http");

const app = express();

// Trust proxy settings (must come first)
app.set('trust proxy', 1); // Trust first proxy
app.enable('trust proxy'); // Alternative syntax

// Middleware pipeline
app.use(morgan("dev"));

// Enhanced CORS configuration
const allowedOrigins = [
  'https://printe.in',
  'https://www.printe.in',
  'http://62.72.58.252',
  'https://62.72.58.252',
];

app.use(cors({
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
  maxAge: 86400 // 24 hours
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTPS enforcement middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    req.secure = true; // Explicitly set secure flag
  }
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Test endpoints
app.get('/api/test-https', (req, res) => {
  res.json({
    protocol: req.protocol,
    secure: req.secure,
    host: req.headers.host,
    forwardedProto: req.headers['x-forwarded-proto'],
    ip: req.ip,
    ips: req.ips,
    headers: req.headers
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use("/api", router);

const Port = process.env.PORT || 8080;
const Host = process.env.HOST || '0.0.0.0';

// Create server function
const createServer = async (app) => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then((res) => {
      app.listen(Port, Host, (err) => {
        if (!err) {
          console.log(`Server running on http://${Host}:${Port}`);
          console.log(`MongoDB connected successfully 🚀`);
        } else {
          console.error('Error starting server:', err);
        }
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
};

// Start server
createServer(app);