/**
 * @file forbiddenError.ts
 * @description
 * Class for the Forbidden error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */
import { HttpError } from "./httpError";

class ForbiddenError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 409,
      message: params.message ?? "Forbidden.",
      details: params.details,
    });
  }
}

export { ForbiddenError };
