/**
 * @file rateLimiterMiddleware.ts
 * @description
 * Tiered Redis-backed rate limiter using CacheService.
 *
 * - Strict limiter for auth endpoints (except refresh)
 * - General limiter for most routes
 * - Forgiving limiter for refresh + image endpoints
 * - Tight handling for repeated unauthorized/forbidden attempts
 *
 * @module middleware
 * @version 5.0.0
 */

import type { Request, Response, NextFunction } from "express";
import container from "../container";
import logger from "../utility/logger";
import type { CacheService } from "../service/cacheService";

interface RateLimiterOptions {
  points: number;
  duration: number;
  blockDuration?: number;
  prefix?: string;
  message?: string;
  weight?: (req: Request) => number;
  strictAuthHandling?: boolean;
}

function createRateLimiter({
  points,
  duration,
  blockDuration = 0,
  prefix = "rlf",
  message = "Too many requests. Please try again later.",
  weight = () => 1,
  strictAuthHandling = false,
}: RateLimiterOptions) {
  const cache = container.cacheService as CacheService;

  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as any)?.id;
    const key = `${prefix}:${userId ?? req.ip}`;
    const blockedKey = `${key}:blocked`;

    try {
      const blocked = await cache.get<boolean>(blockedKey);
      if (blocked) {
        res.setHeader("Retry-After", blockDuration.toString());
        return res.status(429).json({ error: message });
      }

      const count = await cache.increment(key, weight(req), duration);
      const remaining = Math.max(points - count, 0);

      res.setHeader("X-RateLimit-Limit", points.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());

      if (remaining <= 0) {
        logger.warn(`Rate limit exceeded: ${key}`);
        if (blockDuration > 0) {
          await cache.set(`${blockedKey}`, true, blockDuration);
        }
        return res.status(429).json({ error: message });
      }

      if (strictAuthHandling) {
        const originalStatus = res.status.bind(res);
        res.status = (code: number) => {
          if (code === 401 || code === 403) {
            (async () => {
              const failKey = `${key}:unauth`;
              const fails = await cache.increment(failKey, 1, 300);
              if (fails > 5) {
                logger.warn(
                  `Temporarily blocking key after repeated unauthorized: ${key}`,
                );
                await cache.set(blockedKey, true, 120);
                await cache.delete(failKey);
              }
            })().catch((err) =>
              logger.error(`Auth fail escalation error: ${String(err)}`),
            );
          }
          return originalStatus(code);
        };
      }

      next();
    } catch (err) {
      logger.error(`RateLimiter error: ${String(err)}`);
      next();
    }
  };
}

export const authRateLimiter = createRateLimiter({
  points: 80,
  duration: 10 * 60,
  blockDuration: 60,
  prefix: "rlf_auth",
  message: "Too many authentication attempts. Please wait a moment.",
});

export const generalRateLimiter = createRateLimiter({
  points: 1000,
  duration: 15 * 60,
  blockDuration: 60,
  prefix: "rlf_general",
  strictAuthHandling: true,
});

export const softRateLimiter = createRateLimiter({
  points: 5000,
  duration: 5 * 60,
  prefix: "rlf_soft",
  weight: (req) => (req.method === "GET" ? 0.25 : 1),
  message: "You are making too many light requests. Slow down briefly.",
});
