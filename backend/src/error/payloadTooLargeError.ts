/**
 * @file payloadTooLargeError.ts
 * @description
 * Class for the Payload Too Large error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */
import { HttpError } from "@error/httpError";

class PayloadTooLargeError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 413,
      message: params.message ?? "Payload is too large",
      details: params.details,
    });
  }
}

export { PayloadTooLargeError };
