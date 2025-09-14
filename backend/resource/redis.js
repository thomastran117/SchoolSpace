const Redis = require("ioredis");
const logger = require("../utility/logger");

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

(async () => {
  try {
    await redis.ping();
    logger.info("Redis is connected");
  } catch (e) {
    logger.error("Unable to connect to Redis");
    process.exit(1);
  }
})();

module.exports = redis;
