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
 * @version 3.0.1
 * @auth Thomas
 */
import { Redis } from "ioredis";

import env from "../config/envConfigs";
import logger from "../utility/logger";

let healthy = false;

const MAX_INIT_ATTEMPTS = 6;
const MAX_RECONNECT_ATTEMPTS = 6;

const BASE_DELAY_MS = 150;
const MAX_DELAY_MS = 5_000;
const JITTER_MS = 150;

const redis = new Redis(env.redisUrl, {
  lazyConnect: true,
  db: 1,

  maxRetriesPerRequest: 1,

  retryStrategy: (attempt) => {
    if (attempt > MAX_RECONNECT_ATTEMPTS) {
      healthy = false;
      logger.warn(
        `[Redis] reconnect limit reached (${MAX_RECONNECT_ATTEMPTS}); stop retrying`
      );
      return null;
    }

    const exp = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** (attempt - 1));
    const jitter = Math.floor(Math.random() * JITTER_MS);
    const delay = exp + jitter;

    logger.warn(
      `[Redis] reconnect attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`
    );
    return delay;
  },
});

redis.on("ready", () => {
  healthy = true;
  logger.info("[Redis] ready");
});

redis.on("error", (err) => {
  healthy = false;
  logger.error(`[Redis] error: ${err.message}`);
});

redis.on("close", () => {
  healthy = false;
  logger.warn("[Redis] closed");
});

function delayMs(attempt: number) {
  const exp = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** (attempt - 1));
  const jitter = Math.floor(Math.random() * JITTER_MS);
  return exp + jitter;
}

export async function initRedis(): Promise<void> {
  if (healthy) return;

  for (let attempt = 1; attempt <= MAX_INIT_ATTEMPTS; attempt++) {
    try {
      await redis.connect();
      await redis.ping();
      healthy = true;
      logger.info("[Redis] init ok");
      return;
    } catch (err: any) {
      healthy = false;

      logger.warn(
        `[Redis] init attempt ${attempt}/${MAX_INIT_ATTEMPTS} failed: ${err.message}`
      );

      try {
        redis.disconnect();
      } catch {
        /* ignore */
      }

      if (attempt < MAX_INIT_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, delayMs(attempt)));
      }
    }
  }

  logger.warn("[Redis] init failed; continuing without redis");
}

export function isRedisHealthy(): boolean {
  return healthy;
}

export { redis };
