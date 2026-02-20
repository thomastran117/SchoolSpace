/**
 * @file methodNotAllowedError.ts
 * @description
 * Class for the Method Not Allowed error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */
import { HttpError } from "@error/httpError";

class MethodNotAllowedError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 405,
      message: params.message ?? "Method not allowed",
      details: params.details,
    });
  }
}

export { MethodNotAllowedError };
