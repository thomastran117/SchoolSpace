/**
 * @file redis.ts
 * @description
 * A Redis client instance that mounts and exports itself for use across the service layer.
 *
 * - Uses `ioredis` with lazy connection.
 * - Limits retries per request (`maxRetriesPerRequest: 2`).
 * - Automatically verifies connectivity via `PING` at startup.
 * - Logs connection status using the custom logger.
 * - Exits the process if Redis is not available.
 *
 * @module resource
 * @version 1.0.0
 * @auth Thomas
 */

import Redis from "ioredis";
import logger from "../utility/logger";
import config from "../config/envManager";

/**
 * Redis client instance configured with ioredis.
 */
const redis = new Redis(config.redis_url, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

// Verify Redis connection on startup
(async (): Promise<void> => {
  try {
    await redis.ping();
    logger.info("Redis is connected");
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Unable to connect to Redis: ${err.message}`);
    } else {
      logger.error("Unable to connect to Redis: Unknown error");
    }
    process.exit(1);
  }
})();

export default redis;
