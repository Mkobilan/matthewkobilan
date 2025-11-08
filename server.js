const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const app = express();

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "*.matthewkobilan.com"],
      connectSrc: ["'self'", "https://api.matthewkobilan.com", "https://in53oczfrd.execute-api.us-east-1.amazonaws.com"],
      fontSrc: ["'self'", "fonts.gstatic.com", "fonts.googleapis.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "js.stripe.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Adjust as needed for your external resources
}));

// Compression for better performance
app.use(compression());

// Cache control for static assets
const cacheTime = 86400000 * 30; // 30 days in milliseconds
app.use(express.static(path.join(__dirname), {
  maxAge: cacheTime,
  setHeaders: (res, path) => {
    // Don't cache HTML files
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Basic rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});