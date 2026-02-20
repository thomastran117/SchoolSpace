/**
 * @file authHook.ts
 * @description
 * Auth middleware
 *
 * @module hook
 * @version 1.0.0
 * @auth Thomas
 */
import container from "@container/index";
import { UnauthorizedError } from "@error/unauthorizedError";
import type { BasicTokenService } from "@service/basicTokenService";
import type { FastifyReply, FastifyRequest } from "fastify";

async function authDependency(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError({
      message: "Missing or invalid authorization header",
    });
  }

  const token = authHeader.slice(7);

  const tokenService = container.basicTokenService as BasicTokenService;

  let user;
  try {
    user = tokenService.getUserPayload(token);
  } catch {
    throw new UnauthorizedError({ message: "Invalid or expired access token" });
  }

  request.user = user;
  return user;
}

export { authDependency };
