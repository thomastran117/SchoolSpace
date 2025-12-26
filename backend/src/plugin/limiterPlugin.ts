import fp from "fastify-plugin";

import container from "../container";
import type { BasicTokenService } from "../service/basicTokenService";
import type { CacheService } from "../service/cacheService";
import { httpError } from "../utility/httpUtility";

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

      if (policy.mode === "window") {
        const windowMs = policy.windowMs ?? 60_000;
        const maxRequests = policy.maxRequests ?? 100;
        const ttl = Math.ceil(windowMs / 1000);

        const count = await cacheService.increment(key, 1, ttl);
        if (count > maxRequests) throw httpError(429, message);
        return;
      }

      if (policy.mode === "bucket") {
        const capacity = policy.capacity ?? 10;
        const refillRate = policy.refillRate ?? 1;
        const bucketKey = `${key}:bucket`;
        const ttlSeconds = Math.ceil(capacity / refillRate) + 2;

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

          if (tokens < 1) throw httpError(429, message);

          const ok = await cacheService.compareAndSwap(
            bucketKey,
            raw ?? null,
            { tokens: tokens - 1, lastRefill: now },
            ttlSeconds
          );

          if (ok) return;
        }

        throw httpError(429, message);
      }
    });
  }
);
