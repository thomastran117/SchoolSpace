import fp from "fastify-plugin";

import container from "@container/index";
import { TooManyRequestError } from "@error/tooManyRequestError";
import type { BasicTokenService } from "@service/basicTokenService";
import type { CacheService } from "@service/cacheService";

type RateLimitMode = "window" | "bucket";

export interface RateLimitPolicy {
  mode: RateLimitMode;
  windowMs?: number;
  maxRequests?: number;
  capacity?: number;
  refillRate?: number;
}

export interface RateLimiterOptions {
  defaultPolicy: RateLimitPolicy;
  policyResolver?: (request: any) => RateLimitPolicy;
  keyGenerator?: (request: any) => string;
  message?: string;
}

function normalizeIp(ip: string) {
  if (ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
  return ip;
}

type WindowEntry = { count: number; resetAt: number };
type BucketEntry = { tokens: number; lastRefill: number; expiresAt: number };

export default fp<RateLimiterOptions>(
  async function rateLimiterPlugin(app, options) {
    const cacheService = container.cacheService as CacheService;
    const tokenService = container.basicTokenService as BasicTokenService;

    const {
      defaultPolicy,
      policyResolver,
      keyGenerator,
      message = "Too many requests",
    } = options;

    const memoryWindow = new Map<string, WindowEntry>();
    const memoryBucket = new Map<string, BucketEntry>();

    function cacheHealthy(): boolean {
      const fn = (cacheService as any)?.isHealthy;
      if (typeof fn === "function") return !!fn.call(cacheService);
      return true;
    }

    function windowFallback(
      key: string,
      windowMs: number,
      maxRequests: number,
      now: number
    ) {
      const entry = memoryWindow.get(key);
      if (!entry || now >= entry.resetAt) {
        memoryWindow.set(key, { count: 1, resetAt: now + windowMs });
        return;
      }
      entry.count += 1;
      if (entry.count > maxRequests) throw new TooManyRequestError({ message });
    }

    function bucketFallback(
      key: string,
      capacity: number,
      refillRate: number,
      now: number
    ) {
      const ttlMs = (Math.ceil(capacity / refillRate) + 2) * 1000;
      const entry = memoryBucket.get(key);

      if (!entry || now >= entry.expiresAt) {
        memoryBucket.set(key, {
          tokens: capacity - 1,
          lastRefill: now,
          expiresAt: now + ttlMs,
        });
        return;
      }

      const refill = ((now - entry.lastRefill) / 1000) * refillRate;
      entry.tokens = Math.min(capacity, entry.tokens + refill);
      entry.lastRefill = now;

      if (entry.tokens < 1) throw new TooManyRequestError({ message });

      entry.tokens -= 1;
    }

    function sweepIfNeeded(now: number) {
      if (memoryWindow.size > 50_000) {
        for (const [k, v] of memoryWindow) {
          if (now >= v.resetAt) memoryWindow.delete(k);
        }
      }
      if (memoryBucket.size > 50_000) {
        for (const [k, v] of memoryBucket) {
          if (now >= v.expiresAt) memoryBucket.delete(k);
        }
      }
    }

    app.addHook("onRequest", async (req) => {
      const auth = req.headers.authorization;

      if (auth?.startsWith("Bearer ")) {
        const userId = tokenService.decodeUserId(auth.slice(7));
        if (userId) {
          req.rateLimitIdentity = `u:${userId}`;
          return;
        }
      }

      if (req.headers["x-refresh-id"]) {
        req.rateLimitIdentity = `r:${req.headers["x-refresh-id"]}`;
        return;
      }

      req.rateLimitIdentity = `ip:${normalizeIp(req.ip)}`;
    });

    app.addHook("preHandler", async (request) => {
      const policy = policyResolver?.(request) ?? defaultPolicy;
      const identity = keyGenerator
        ? keyGenerator(request)
        : request.rateLimitIdentity;

      const key = `ratelimit:${identity}`;
      const now = Date.now();

      sweepIfNeeded(now);

      if (policy.mode === "window") {
        const windowMs = policy.windowMs ?? 60_000;
        const maxRequests = policy.maxRequests ?? 100;
        const ttl = Math.ceil(windowMs / 1000);

        if (!cacheHealthy()) {
          windowFallback(key, windowMs, maxRequests, now);
          return;
        }

        try {
          const count = await cacheService.increment(key, 1, ttl);
          if (count > maxRequests) throw new TooManyRequestError({ message });
          return;
        } catch {
          windowFallback(key, windowMs, maxRequests, now);
          return;
        }
      }

      if (policy.mode === "bucket") {
        const capacity = policy.capacity ?? 10;
        const refillRate = policy.refillRate ?? 1;
        const bucketKey = `${key}:bucket`;
        const ttlSeconds = Math.ceil(capacity / refillRate) + 2;

        if (!cacheHealthy()) {
          bucketFallback(bucketKey, capacity, refillRate, now);
          return;
        }

        try {
          let attempts = 0;

          while (attempts++ < 5) {
            const raw = await cacheService.get<{
              tokens: number;
              lastRefill: number;
            }>(bucketKey);

            let tokens = raw?.tokens ?? capacity;
            const lastRefill = raw?.lastRefill ?? now;

            tokens = Math.min(
              capacity,
              tokens + ((now - lastRefill) / 1000) * refillRate
            );

            if (tokens < 1) throw new TooManyRequestError({ message });

            const ok = await cacheService.compareAndSwap(
              bucketKey,
              raw ?? null,
              { tokens: tokens - 1, lastRefill: now },
              ttlSeconds
            );

            if (ok) return;
          }

          throw new TooManyRequestError({ message });
        } catch {
          bucketFallback(bucketKey, capacity, refillRate, now);
          return;
        }
      }
    });
  }
);
