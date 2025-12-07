import fp from "fastify-plugin";
import container from "../container";
import logger from "../utility/logger";

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
