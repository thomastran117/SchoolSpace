import type { FastifyReply, FastifyRequest } from "fastify";

import { HttpError, InternalServerError } from "../error";
import logger from "../utility/logger";

class HealthController {
  public async index(req: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.code(200).send({
        message: "ok",
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(`[HealthController] index failed: ${err?.message ?? err}`);

      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async ping(req: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.code(200).send({
        message: "pong",
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(`[HealthController] ping failed: ${err?.message ?? err}`);

      throw new InternalServerError({ message: "Internal server error" });
    }
  }
}

export { HealthController };
