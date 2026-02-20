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
import { ForbiddenError } from "@error/forbiddenError";
import { UnauthorizedError } from "@error/unauthorizedError";
import type { BasicTokenService } from "@service/basicTokenService";
import type { FastifyReply, FastifyRequest } from "fastify";

type Role = "student" | "teacher" | "admin";

const ROLE_RANK: Record<Role, number> = {
  student: 1,
  teacher: 2,
  admin: 3,
};

function normalizeRole(role: unknown): Role | null {
  if (role === "student" || role === "teacher" || role === "admin") return role;
  return null;
}

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

function requireRole(minRole: Role) {
  return async function rbacDependency(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const user =
      (request as any).user ?? (await authDependency(request, reply));

    const userRole = normalizeRole((user as any)?.role);
    if (!userRole) {
      throw new UnauthorizedError({ message: "Invalid user role" });
    }

    if (ROLE_RANK[userRole] < ROLE_RANK[minRole]) {
      throw new ForbiddenError({
        message: `Insufficient role (requires ${minRole})`,
      });
    }

    return user;
  };
}

export { authDependency, requireRole };
