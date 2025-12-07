import fp from "fastify-plugin";
import { HttpError } from "../utility/httpUtility";
import logger from "../utility/logger";

export default fp(async function errorHandler(app) {
  app.setErrorHandler((err: unknown, request, reply) => {
    if (err instanceof HttpError) {
      if (err.statusCode === 500) {
        logger.error(`[500] ${request.method} ${request.url} - ${err.message}`);
      }

      return reply.code(err.statusCode).send({
        error: err.message,
        details: err.details ?? undefined,
      });
    }

    const unknownError = err as Error;

    logger.error(
      `${request.method} ${request.url} - ${
        unknownError?.message ?? unknownError
      }`,
    );

    return reply.code(500).send({
      error: "Server failed to process the data",
    });
  });
});
