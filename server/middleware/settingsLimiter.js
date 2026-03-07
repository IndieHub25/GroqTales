/**
 * Rate limiter middleware for Express settings routes.
 * Uses express-rate-limit with a stricter window for authenticated settings endpoints.
 */
const rateLimit = require('express-rate-limit');

const settingsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 min per IP for settings
  message: {
    success: false,
    error: { message: 'Too many requests. Please try again later.' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = settingsLimiter;
