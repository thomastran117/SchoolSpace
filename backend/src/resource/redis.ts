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

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 10_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableRedisError(err: any): boolean {
  const retryableMessages = [
    "ECONNREFUSED",
    "ETIMEDOUT",
    "EHOSTUNREACH",
    "ENOTFOUND",
    "Connection is closed",
    "connect ECONNREFUSED",
    "read ECONNRESET",
  ];

  return retryableMessages.some((msg) => err?.message?.includes(msg));
}

const redis = new Redis(redisCacheUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

const connectionWorker = new IORedis(redisBullUrl, {
  maxRetriesPerRequest: null,
});

async function initRedis(): Promise<void> {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;

      await redis.connect();
      await redis.ping();

      // logger.info("Redis is connected");
      return;
    } catch (err: any) {
      if (!isRetryableRedisError(err)) {
        logger.error(`Non-retryable Redis error: ${err.message}`);
        process.exit(1);
      }

      const isLastAttempt = attempt >= MAX_RETRIES;

      const exponentialDelay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 300);
      const delay = Math.min(exponentialDelay + jitter, MAX_DELAY_MS);

      logger.error(
        `Failed to connect to Redis (attempt ${attempt}/${MAX_RETRIES}): ${err.message}`,
      );

      if (isLastAttempt) {
        logger.error("All Redis connection attempts failed. Exiting process.");
        process.exit(1);
      }

      logger.info(`Retrying Redis connection in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

export { connectionWorker, initRedis, redis };
