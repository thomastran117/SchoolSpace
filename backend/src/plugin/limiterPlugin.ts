import fp from "fastify-plugin";

import container from "../container";
import type { CacheService } from "../service/cacheService";
import { httpError } from "../utility/httpUtility";

type RateLimitMode = "window" | "bucket";

export interface RateLimitPolicy {
  mode: RateLimitMode;

  // fixed window
  windowMs?: number;
  maxRequests?: number;

  // token bucket
  capacity?: number;
  refillRate?: number;
}

export interface RateLimiterOptions {
  defaultPolicy: RateLimitPolicy;

  /**
   * Resolve policy per request (auth, refresh, public, etc.)
   */
  policyResolver?: (request: any) => RateLimitPolicy;

  /**
   * Resolve rate-limit key per request
   */
  keyGenerator?: (request: any) => string;

  message?: string;
}

export default fp<RateLimiterOptions>(
  async function rateLimiterPlugin(app, options) {
    const cacheService = container.cacheService as CacheService;

    const {
      defaultPolicy,
      policyResolver,
      keyGenerator = (req) => req.user?.id ?? req.ip,
      message = "Too many requests",
    } = options;

    app.addHook("preHandler", async (request) => {
      const policy = policyResolver?.(request) ?? defaultPolicy;

      const key = `ratelimit:${keyGenerator(request)}`;
      const now = Date.now();

      // ----------------------------------
      // FIXED WINDOW
      // ----------------------------------
      if (policy.mode === "window") {
        const windowMs = policy.windowMs ?? 60_000;
        const maxRequests = policy.maxRequests ?? 100;

        const ttlSeconds = Math.ceil(windowMs / 1000);

        const count = await cacheService.increment(key, 1, ttlSeconds);

        if (count == null) return;

        if (count > maxRequests) {
          throw httpError(429, message);
        }

        return;
      }

      // ----------------------------------
      // TOKEN BUCKET
      // ----------------------------------
      if (policy.mode === "bucket") {
        const capacity = policy.capacity ?? 10;
        const refillRate = policy.refillRate ?? 1;

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
          Math.ceil(capacity / refillRate)
        );
      }
    });
  }
);
