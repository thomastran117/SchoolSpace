/**
 * @file notFoundError.ts
 * @description
 * Class for the Not Found error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */

import { HttpError } from "./httpError";

class NotFoundError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 404,
      message: params.message ?? "Resource is not found.",
      details: params.details,
    });
  }
}

export { NotFoundError };
