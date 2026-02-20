import container from "@container/index";
import logger from "@utility/logger";
import fp from "fastify-plugin";

export default fp(async function requestScopePlugin(app) {
  app.addHook("onRequest", async (request, reply) => {
    const scope = container.createScope();
    request.scope = scope;
    request.resolve = (key: string) => scope.resolve(key);
  });

  app.addHook("onResponse", async (request, reply) => {
    try {
      await request.scope?.dispose();
    } catch (err) {
      logger.error(`[Scope] Failed disposing: ${err}`);
    }
  });
});
