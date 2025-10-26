/**
 * @file redis.js
 * @description A redis client instance that mounts and exports itself to be used anywhere in the
 * service layer
 *
 * @module resource
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// External libraries
import Redis from "ioredis";

// Internal core modules
import logger from "../utility/logger.js";
import config from "../config/envManager.js";

/**
 * Redis client instance configured with `ioredis`.
 *
 * - Uses `lazyConnect` to avoid immediate connection on instantiation.
 * - Limits retries per request (`maxRetriesPerRequest: 2`).
 * - Automatically verifies connectivity via `PING` at startup.
 * - Logs connection status using the custom logger.
 * - Exits the process if Redis is not available.
 *
 * @module redisClient
 * @see https://github.com/luin/ioredis
 */
const redis = new Redis(config.redis_url, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

// Verify Redis connection on startup
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
