const { RateLimiterRedis } = require("rate-limiter-flexible");
const redis = require("../resource/redis");

function limiterMiddleware(limiter, message) {
  return async (req, res, next) => {
    const key = req.user?.id || req.ip;
    try {
      const rl = await limiter.consume(key);
      res.setHeader("X-RateLimit-Remaining", rl.remainingPoints);
      next();
    } catch (rej) {
      const retrySecs = Math.ceil((rej.msBeforeNext || 1000) / 1000);
      res.setHeader("Retry-After", retrySecs);
      res.status(429).json({ error: message });
    }
  };
}

const generalLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 1000,
  duration: 15 * 60,
  execEvenly: true,
});

const authLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 100,
  duration: 10 * 60,
  blockDuration: 60,
});

const generalRateLimiter = limiterMiddleware(
  generalLimiter,
  "Too many requests. Please try again later."
);

const authRateLimiter = limiterMiddleware(
  authLimiter,
  "Too many attempts. Please wait and try again."
);

module.exports = { generalRateLimiter, authRateLimiter };
