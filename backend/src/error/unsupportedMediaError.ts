/**
 * @file unsupportedMediaError.ts
 * @description
 * Class for the Unsupported Media error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */
import { HttpError } from "./httpError";

class UnsupportedMediaError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 415,
      message: params.message ?? "Media type is not supported.",
      details: params.details,
    });
  }
}

export { UnsupportedMediaError };
