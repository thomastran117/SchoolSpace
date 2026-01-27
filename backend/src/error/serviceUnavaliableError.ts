/**
 * @file serviceUnavaliableError.ts
 * @description
 * Class for the Service Unavaliable error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */

import { HttpError } from "./httpError";

class ServiceUnavaliableError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 503,
      message: params.message ?? "Service is unavaliable.",
      details: params.details,
    });
  }
}

export { ServiceUnavaliableError };
