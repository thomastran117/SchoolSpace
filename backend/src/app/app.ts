import container from "@container/index";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import csrfProtection from "@fastify/csrf-protection";
import multipart from "@fastify/multipart";
import errorHandler from "@plugin/errorPlugin";
import rateLimiter from "@plugin/limiterPlugin";
import requestLogger from "@plugin/loggerPlugin";
import requestScopePlugin from "@plugin/scopePlugin";
import { healthRoutes } from "@route/healthRoute";
import { registerRoutes } from "@route/route";
import Fastify from "fastify";
import methodNotAllowed from "fastify-method-not-allowed";

export async function buildApp() {
  const app = Fastify({});
  await container.initialize();

  app.register(cors, {
    origin: ["http://localhost:3040"],
    credentials: true,
    allowedHeaders: ["Content-Type", "X-CSRF-Token", "Authorization"],
  });

  app.register(rateLimiter, {
    defaultPolicy: {
      mode: "window",
      windowMs: 60_000,
      maxRequests: 120,
    },

    policyResolver: (req) => {
      const url = req.url.replace(/^\/api/, "");

      if (url.startsWith("/auth/login")) {
        return { mode: "bucket", capacity: 5, refillRate: 0.1 };
      }

      if (url.startsWith("/auth/refresh")) {
        return { mode: "bucket", capacity: 10, refillRate: 0.5 };
      }

      return { mode: "window", windowMs: 60_000, maxRequests: 120 };
    },

    keyGenerator: (req) => req.rateLimitIdentity!,

    message: "Too many requests. Please try again later.",
  });

  app.register(errorHandler);
  app.register(requestLogger);
  app.register(requestScopePlugin);
  app.register(cookie, {
    secret: process.env.COOKIE_SECRET! || "secret",
    hook: "onRequest",
  });
  app.register(csrfProtection, {
    cookieOpts: {
      signed: true,
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  });

  app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });

  app.register(methodNotAllowed);

  app.register(healthRoutes);
  app.register(registerRoutes, { prefix: "/api" });

  return app;
}
