import fp from "fastify-plugin";
import { HttpError } from "../utility/httpUtility";
import logger from "../utility/logger";

export default fp(async function errorHandler(app) {
  app.setErrorHandler((err: any, request, reply) => {
    const status =
      err instanceof HttpError ? err.statusCode : 500;

    const message =
      err instanceof HttpError
        ? err.message
        : "Server failed to process the data";

    if (status === 500) {
      logger.error(`Server failed to process the data: ${err.message}`);
    }

    reply.code(status).send({ error: message });
  });
});
