const rateLimit = require('express-rate-limit');

// Strict rate limiter for authentication routes (login/register)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' },
});

// Rate limiter for verification requests (prevents brute-force automated scanning)
const verifyRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // max 60 verification requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Verification rate limit exceeded. Please wait a moment before sending more verification scans.' },
});

// General public API rate limiter
const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // max 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'API rate limit exceeded.' },
});

module.exports = {
  authRateLimiter,
  verifyRateLimiter,
  apiRateLimiter,
};
