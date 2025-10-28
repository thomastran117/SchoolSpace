/**
 * @file rateLimiterMiddleware.ts
 * @description
 * Express middleware for rate limiting using `rate-limiter-flexible`.
 * Provides separate general and authentication limiters with Redis as the backend
 * and an in-memory insurance limiter as fallback.
 *
 * @module middleware
 * @version 1.0.0
 * @author Thomas
 */

import {
  RateLimiterRedis,
  RateLimiterMemory,
  RateLimiterRes,
} from "rate-limiter-flexible";
import type { Request, Response, NextFunction } from "express";
import redis from "../resource/redis";

/**
 * Builds a Redis-backed rate limiter with an in-memory insurance fallback.
 *
 * @param points - Number of points per duration.
 * @param duration - Duration in seconds before points reset.
 * @param blockDuration - Optional block time (in seconds) after consuming all points.
 */
function buildLimiter({
  points,
  duration,
  blockDuration = 0,
}: {
  points: number;
  duration: number;
  blockDuration?: number;
}): RateLimiterRedis {
  const insuranceLimiter = new RateLimiterMemory({ points, duration });

  return new RateLimiterRedis({
    storeClient: redis,
    points,
    duration,
    blockDuration,
    execEvenly: false,
    insuranceLimiter,
    keyPrefix: "rlf",
  });
}

/**
 * Wraps a rate limiter in an Express middleware function.
 *
 * @param limiter - The rate limiter instance.
 * @param message - The message returned when the rate limit is exceeded.
 */
function limiterMiddleware(
  limiter: RateLimiterRedis,
  message: string,
): (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void | Response> {
  return async (req, res, next) => {
    const key = (req.user as { id?: string })?.id || req.ip;

    try {
      const rlRes: RateLimiterRes = await limiter.consume(key, 1);

      res.setHeader("X-RateLimit-Limit", limiter.points.toString());
      res.setHeader("X-RateLimit-Remaining", rlRes.remainingPoints.toString());
      res.setHeader(
        "X-RateLimit-Reset",
        Math.ceil((Date.now() + rlRes.msBeforeNext) / 1000).toString(),
      );

      next();
    } catch (err: any) {
      if (err instanceof Error) {
        return next();
      }

      const retrySecs = Math.max(
        1,
        Math.ceil((err.msBeforeNext || 1000) / 1000),
      );
      res.setHeader("Retry-After", retrySecs.toString());
      res.status(429).json({ error: message });
    }
  };
}

const generalLimiter = buildLimiter({
  points: 1000,
  duration: 15 * 60,
});

const authLimiter = buildLimiter({
  points: 100,
  duration: 10 * 60,
  blockDuration: 60,
});

const generalRateLimiter = limiterMiddleware(
  generalLimiter,
  "Too many requests. Please try again later.",
);

const authRateLimiter = limiterMiddleware(
  authLimiter,
  "Too many attempts. Please wait and try again.",
);

export { generalRateLimiter, authRateLimiter };
