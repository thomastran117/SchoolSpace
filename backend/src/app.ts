import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import methodNotAllowed from "fastify-method-not-allowed";
import csrfProtection from "@fastify/csrf-protection";

import container from "./container";
import errorHandler from "./plugin/errorPlugin";
import rateLimiter from "./plugin/limiterPlugin";
import requestLogger from "./plugin/loggerPlugin";
import requestScopePlugin from "./plugin/scopePlugin";
import { registerRoutes } from "./route/route";

export async function buildApp() {
  const app = Fastify({});
  await container.initialize();

  app.register(cors, {
    origin: ["http://localhost:3040"],
    credentials: true,
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
  app.register(cookie, { secret: process.env.COOKIE_SECRET! || "secret", hook: "onRequest" });
  app.register(csrfProtection, {
    cookieOpts: {
      signed: true,
      httpOnly: true,
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

  app.get("/", async (_, reply) => reply.code(200).send({ message: "ok" }));

  app.get("/api", async (_, reply) => reply.code(200).send({ message: "ok" }));

  app.get("/ping", async (_, reply) =>
    reply.code(200).send({ message: "ping" })
  );

  app.get("/health", async (_, reply) =>
    reply.code(200).send({ message: "ok" })
  );

  app.register(registerRoutes, { prefix: "/api" });

  return app;
}
