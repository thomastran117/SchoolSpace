import fp from "fastify-plugin";

import { HttpError } from "../error";
import logger from "../utility/logger";

type AnyErr = {
  code?: string;
  statusCode?: number;
  message?: string;
  name?: string;
};

function isCsrfError(err: unknown): err is AnyErr {
  if (!err || typeof err !== "object") return false;
  const e = err as AnyErr;
  return typeof e.code === "string" && e.code.startsWith("FST_CSRF_");
}

export default fp(async function errorHandler(app) {
  app.setErrorHandler((err: unknown, request, reply) => {
    if (isCsrfError(err)) {
      const status = 403;

      logger.warn(
        `[CSRF] ${request.method} ${request.url} - ${err.code ?? "FST_CSRF"}${
          err.message ? `: ${err.message}` : ""
        }`
      );

      return reply.code(status).send({
        error: "Invalid CSRF token",
        code: err.code ?? "FST_CSRF",
      });
    }

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
        (unknownError as any)?.message ?? unknownError
      }`
    );

    return reply.code(500).send({
      error: "Server failed to process the data",
    });
  });
});
