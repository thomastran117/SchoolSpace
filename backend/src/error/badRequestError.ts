/**
 * @file badRequestError.ts
 * @description
 * Class for the Bad Request error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */
import { HttpError } from "@error/httpError";

class BadRequestError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 400,
      message: params.message ?? "Bad request.",
      details: params.details,
    });
  }
}

export { BadRequestError };
