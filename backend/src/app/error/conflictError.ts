/**
 * @file conflictError.ts
 * @description
 * Class for the Conflict error
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */
import { HttpError } from "@error/httpError";

class ConflictError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 409,
      message: params.message ?? "Conflict occured.",
      details: params.details,
    });
  }
}

export { ConflictError };
export default ConflictError;
