/**
 * @file redis.ts
 * @description
 * A Redis client instance with deferred connection.
 *
 * - Uses `ioredis` with lazyConnect.
 * - Connects only when `initRedis()` is called.
 * - Logs connection status and errors.
 *
 * @module resource
 * @version 2.0.0
 * @auth Thomas
 */

import Redis from "ioredis";
import logger from "../utility/logger";
import env from "../config/envConfigs";

const redis = new Redis(env.redis_url, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

export async function initRedis(): Promise<void> {
  try {
    await redis.connect();
    await redis.ping();
    logger.info("Redis is connected");
  } catch (err: any) {
    logger.error(`Unable to connect to Redis: ${err.message}`);
    process.exit(1);
  }
}

export default redis;
