/**
 * @file badGatewayError.ts
 * @description
 * Class for the Bad Gateway error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */
import { HttpError } from "@error/httpError";

class BadGatewayError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 502,
      message: params.message ?? "Bad gateway.",
      details: params.details,
    });
  }
}

export { BadGatewayError };
