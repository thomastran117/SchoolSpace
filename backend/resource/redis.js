const Redis = require("ioredis");
const logger = require("../utility/logger");
const config = require("../config/envManager");

const redis = new Redis(config.redis_url, {
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
