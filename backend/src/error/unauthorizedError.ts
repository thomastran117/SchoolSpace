/**
 * @file unauthorizedError.ts
 * @description
 * Class for the Unauthorized error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */
import { HttpError } from "@error/httpError";

class UnauthorizedError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 401,
      message: params.message ?? "Unauthorized.",
      details: params.details,
    });
  }
}

export { UnauthorizedError };
export default UnauthorizedError;
