import fp from "fastify-plugin";
import { httpError } from "../utility/httpUtility";
import container from "../container";
import type { CacheService } from "../service/cacheService";

type RateLimitMode = "window" | "bucket";

export interface RateLimiterOptions {
  mode: RateLimitMode;

  windowMs?: number;
  maxRequests?: number;

  capacity?: number;
  refillRate?: number;

  keyGenerator?: (request: any) => string;

  message?: string;
}

export default fp<RateLimiterOptions>(async function rateLimiterPlugin(
  app,
  options,
) {
  const cacheService = container.cacheService as CacheService;

  const {
    mode,
    windowMs = 60_000,
    maxRequests = 100,
    capacity = 10,
    refillRate = 1,
    keyGenerator = (req) => req.user?.id ?? req.ip,
    message = "Too many requests",
  } = options;

  app.addHook("preHandler", async (request) => {
    const key = `ratelimit:${keyGenerator(request)}`;
    const now = Date.now();

    if (mode === "window") {
      const count = await cacheService.increment(
        key,
        1,
        Math.ceil(windowMs / 1000),
      );

      if (count && count > maxRequests) {
        throw httpError(429, message);
      }

      return;
    }

    if (mode === "bucket") {
      const bucketKey = `${key}:bucket`;

      const raw = await cacheService.get<{
        tokens: number;
        lastRefill: number;
      }>(bucketKey);

      let tokens = capacity;
      let lastRefill = now;

      if (raw) {
        tokens = raw.tokens;
        lastRefill = raw.lastRefill;
      }

      const elapsed = (now - lastRefill) / 1000;
      const refill = elapsed * refillRate;

      tokens = Math.min(capacity, tokens + refill);

      if (tokens < 1) {
        throw httpError(429, message);
      }

      tokens -= 1;

      await cacheService.set(
        bucketKey,
        { tokens, lastRefill: now },
        Math.ceil(capacity / refillRate),
      );
    }
  });
});
