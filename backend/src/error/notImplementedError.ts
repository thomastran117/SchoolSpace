/**
 * @file notImplementedError.ts
 * @description
 * Class for the Not Implemented error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */
import { HttpError } from "@error/httpError";

class NotImplementedError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 501,
      message: params.message ?? "Not implemented",
      details: params.details,
    });
  }
}

export { NotImplementedError };
