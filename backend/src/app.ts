import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import container from "./container";
import errorHandler from "./plugin/errorPlugin";
import requestLogger from "./plugin/loggerPlugin";
import requestScopePlugin from "./plugin/scopePlugin";

export async function buildApp() {
  const app = Fastify({});
  await container.initialize();

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

  return app;
}
