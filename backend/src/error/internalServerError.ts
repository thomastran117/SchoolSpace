/**
 * @file internalServerError.ts
 * @description
 * Class for the Internal Server error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */
import { HttpError } from "./httpError";

class InternalServerError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 500,
      message: params.message ?? "Internal server error.",
      details: params.details,
    });
  }
}

export { InternalServerError };
