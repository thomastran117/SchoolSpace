/**
 * @file unprocessableEntityError.ts
 * @description
 * Class for the Unprocessable Entity error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */

import { HttpError } from "./httpError";

class UnprocessableEntityError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 422,
      message: params.message ?? "Unprocessable entity.",
      details: params.details,
    });
  }
}

export { UnprocessableEntityError };
