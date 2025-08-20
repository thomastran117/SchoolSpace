const rateLimit = require("express-rate-limit");

const rateMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const authMiddleware = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait and try again." },
});

module.exports = { rateMiddleware, authMiddleware};
