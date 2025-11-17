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
 * @version 3.0.0
 * @auth Thomas
 */
import { default as IORedis, default as Redis } from "ioredis";
import { URL } from "url";
import env from "../config/envConfigs";
import logger from "../utility/logger";

const baseUrl = new URL(env.redis_url);
const redisCacheUrl = baseUrl.toString();
baseUrl.searchParams.set("db", "1");
const redisBullUrl = baseUrl.toString();

const redis = new Redis(redisCacheUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

const connectionWorker = new IORedis(redisBullUrl, {
  maxRetriesPerRequest: null,
});

async function initRedis(): Promise<void> {
  try {
    await redis.connect();
    await redis.ping();
    // logger.info("Redis is connected");
  } catch (err: any) {
    logger.error(`Unable to connect to Redis: ${err.message}`);
    process.exit(1);
  }
}

export { connectionWorker, initRedis, redis };
