import type { FastifyReply, FastifyRequest } from "fastify";
import container from "../container";
import type { BasicTokenService } from "../service/basicTokenService";
import { httpError } from "../utility/httpUtility";

export async function authDependency(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw httpError(401, "Missing or invalid authorization header");
  }

  const token = authHeader.split(" ")[1];
  const tokenService = container.basicTokenService as BasicTokenService;

  const user = tokenService.getUserPayload(token);

  request.user = user;

  return user;
}
