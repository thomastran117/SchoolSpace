const {
  RateLimiterRedis,
  RateLimiterMemory,
} = require("rate-limiter-flexible");
const redis = require("../resource/redis");

function buildLimiter({ points, duration, blockDuration }) {
  const insuranceLimiter = new RateLimiterMemory({ points, duration });

  return new RateLimiterRedis({
    storeClient: redis,
    points,
    duration,
    blockDuration,
    execEvenly: false,
    timeoutMs: 200,
    insuranceLimiter,
    keyPrefix: "rlf",
  });
}

function limiterMiddleware(limiter, message) {
  return async (req, res, next) => {
    const key = req.user?.id || req.ip;

    try {
      const rlRes = await limiter.consume(key, 1);

      res.setHeader("X-RateLimit-Limit", limiter.points || "");
      res.setHeader("X-RateLimit-Remaining", rlRes.remainingPoints);
      res.setHeader(
        "X-RateLimit-Reset",
        Math.ceil((Date.now() + rlRes.msBeforeNext) / 1000),
      );

      return next();
    } catch (err) {
      if (err instanceof Error) {
        return next();
      }

      const retrySecs = Math.max(
        1,
        Math.ceil((err.msBeforeNext || 1000) / 1000),
      );
      res.setHeader("Retry-After", retrySecs);
      return res.status(429).json({ error: message });
    }
  };
}

const generalLimiter = buildLimiter({
  points: 1000,
  duration: 15 * 60,
});

const authLimiter = buildLimiter({
  points: 100,
  duration: 10 * 60,
  blockDuration: 60,
});

const generalRateLimiter = limiterMiddleware(
  generalLimiter,
  "Too many requests. Please try again later.",
);

const authRateLimiter = limiterMiddleware(
  authLimiter,
  "Too many attempts. Please wait and try again.",
);

module.exports = { generalRateLimiter, authRateLimiter };
