/**
 * @file rateLimiterMiddleware.ts
 * @description
 * Lightweight, dependency-injected rate limiter built entirely on CacheService.
 *
 * Tracks request counts per key (user ID or IP) using Redis via CacheService.
 * Resets counters automatically after `duration` seconds.
 *
 * @module middleware
 * @version 3.0.0
 */

import type { Request, Response, NextFunction } from "express";
import container from "../resource/container";
import logger from "../utility/logger";

interface RateLimiterOptions {
  points: number;
  duration: number;
  blockDuration?: number;
  prefix?: string;
  message?: string;
}

/**
 * Creates a rate limiter middleware using CacheService.
 */
function createRateLimiter({
  points,
  duration,
  blockDuration = 0,
  prefix = "rlf",
  message = "Too many requests. Please try again later.",
}: RateLimiterOptions) {
  const cache = container.cacheService;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as unknown as { id?: string | number })?.id;
      const key = `${prefix}:${userId ?? req.ip}`;

      const blocked = await cache.get<boolean>(`${key}:blocked`);
      if (blocked) {
        res.setHeader("Retry-After", blockDuration.toString());
        return res.status(429).json({ error: message });
      }

      const count = await cache.increment(key);
      if (count === 1) {
        await cache.set(key, count, duration);
      }

      const remaining = Math.max(points - count, 0);

      res.setHeader("X-RateLimit-Limit", points.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());

      if (remaining <= 0) {
        logger.warn(`Rate limit exceeded for key: ${key}`);

        if (blockDuration > 0) {
          await cache.set(`${key}:blocked`, true, blockDuration);
        }

        return res.status(429).json({ error: message });
      }

      next();
    } catch (err) {
      logger.error(`RateLimiter error: ${String(err)}`);
      next();
    }
  };
}

const generalRateLimiter = createRateLimiter({
  points: 1000,
  duration: 15 * 60,
  prefix: "rlf_general",
});

const authRateLimiter = createRateLimiter({
  points: 100,
  duration: 10 * 60,
  blockDuration: 60,
  prefix: "rlf_auth",
  message: "Too many attempts. Please wait and try again.",
});

export { generalRateLimiter, authRateLimiter, createRateLimiter };
