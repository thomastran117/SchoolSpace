import Fastify from "fastify";
import container from "./container";
import requestScopePlugin from "./plugin/scopePlugin";
import requestLogger from "./plugin/loggerPlugin";;
import errorHandler from "./plugin/errorPlugin";

export async function buildApp() {
  const app = Fastify({});
  await container.initialize();
  
  app.register(errorHandler);
  app.register(requestLogger);
  app.register(requestScopePlugin);

  app.get("/", async (_, reply) => reply.code(200).send({ message: "ok" }));

  app.get("/api", async (_, reply) => reply.code(200).send({ message: "ok" }));

  app.get("/ping", async (_, reply) => reply.code(200).send({ message: "ping" }));

  app.get("/health", async (_, reply) =>
    reply.code(200).send({ message: "ok" }),
  );

  return app;
}
