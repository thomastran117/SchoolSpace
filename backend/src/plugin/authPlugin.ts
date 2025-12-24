import fp from "fastify-plugin";

import container from "../container";
import type { BasicTokenService } from "../service/basicTokenService";

export default fp(async function authGuard(app) {
  app.decorateRequest("user", null);

  app.addHook("preHandler", async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return reply.code(401).send({
          message: "Missing or invalid authorization header",
        });
      }

      const token = authHeader.split(" ")[1];
      const tokenService = container.basicTokenService as BasicTokenService;
      const user = tokenService.getUserPayload(token);

      request.user = user;
    } catch (err) {
      return reply.code(401).send({
        message: "Invalid or expired token",
      });
    }
  });
});
