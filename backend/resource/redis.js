import Redis from "ioredis";
import logger from"../utility/logger.js";
import config from "../config/envManager.js";

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

export default redis;
