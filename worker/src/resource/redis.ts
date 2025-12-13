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
import IORedis, { Redis } from "ioredis";
import { URL } from "url";
import env from "../config/envConfigs";
import logger from "../utility/logger";

const baseUrl = new URL(env.redisUrl);
const redisCacheUrl = baseUrl.toString();

baseUrl.searchParams.set("db", "1");
const redisBullUrl = baseUrl.toString();

let redisHealthy = false;

const redis = new Redis(redisCacheUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

const connectionWorker = new IORedis(redisBullUrl, {
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  redisHealthy = true;
});

redis.on("ready", () => {
  redisHealthy = true;
});

redis.on("error", (err) => {
  redisHealthy = false;
  logger.error(`[Redis] error: ${err.message}`);
});

redis.on("close", () => {
  redisHealthy = false;
  logger.warn("[Redis] connection closed");
});

async function initRedis(): Promise<void> {
  try {
    await redis.connect();
    await redis.ping();
    redisHealthy = true;
  } catch (err: any) {
    redisHealthy = false;
    logger.error(`[Redis] init failed: ${err.message}`);
  }
}

function isRedisHealthy(): boolean {
  return redisHealthy;
}

export { connectionWorker, initRedis, isRedisHealthy, redis };
