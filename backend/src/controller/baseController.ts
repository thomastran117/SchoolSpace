import type { FastifyRequest } from "fastify";

import type { UserPayload } from "../models/token";
import { httpError } from "../utility/httpUtility";

abstract class BaseController {
  protected parsePositiveInt(
    value: string | undefined,
    defaultValue: number
  ): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue;
  }

  protected parseInt(value: string | undefined): number | undefined {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
  }

  protected ensureRole(
    req: FastifyRequest,
    allowed: UserPayload["role"] | UserPayload["role"][]
  ) {
    const { role } = req.user as UserPayload;

    const roles = Array.isArray(allowed) ? allowed : [allowed];

    if (!roles.includes(role)) {
      httpError(403, "You lack permissions to perform this action.");
    }
  }

  protected ensureAdmin(req: FastifyRequest) {
    this.ensureRole(req, "admin");
  }

  protected ensureStudent(req: FastifyRequest) {
    this.ensureRole(req, "student");
  }

  protected ensureTeacher(req: FastifyRequest) {
    this.ensureRole(req, "teacher");
  }
}

export { BaseController };
