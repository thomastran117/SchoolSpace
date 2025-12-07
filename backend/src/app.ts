import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify from "fastify";

import container from "./container";
import errorHandler from "./plugin/errorPlugin";
import requestLogger from "./plugin/loggerPlugin";
import requestScopePlugin from "./plugin/scopePlugin";
import { registerRoutes } from "./route/route";
import rateLimiter from "./plugin/limiterPlugin";

export async function buildApp() {
  const app = Fastify({});
  await container.initialize();

  app.register(cors, {
    origin: ["http://localhost:3040"],
    credentials: true,
  });

  app.register(rateLimiter, {
    mode: "bucket",
    capacity: 100,
    refillRate: 10,
    keyGenerator: (req) => req.user?.id ?? req.ip,
    message: "Too many requests",
  });
  
  app.register(errorHandler);
  app.register(requestLogger);
  app.register(requestScopePlugin);
  app.register(cookie);

  app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });

  app.get("/", async (_, reply) => reply.code(200).send({ message: "ok" }));

  app.get("/api", async (_, reply) => reply.code(200).send({ message: "ok" }));

  app.get("/ping", async (_, reply) =>
    reply.code(200).send({ message: "ping" }),
  );

  app.get("/health", async (_, reply) =>
    reply.code(200).send({ message: "ok" }),
  );

  app.register(registerRoutes, { prefix: "/api" });

  return app;
}
