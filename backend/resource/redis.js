const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

(async () => {
  try {
    await redis.ping();
    console.log("Redis is connected");
  } catch (e) {
    console.error("Redis error:", e);
    process.exit(1);
  }
})();

module.exports = redis;
