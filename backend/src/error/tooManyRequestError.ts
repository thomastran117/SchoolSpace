/**
 * @file tooManyRequestError.ts
 * @description
 * Class for the Too Many Request error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */

import { HttpError } from "./httpError";

class TooManyRequestError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 429,
      message: params.message ?? "Too many requests.",
      details: params.details,
    });
  }
}

export { TooManyRequestError };
