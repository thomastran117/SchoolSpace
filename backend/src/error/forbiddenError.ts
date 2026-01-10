import { HttpError } from "./httpError";

class ForbiddenError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 409,
      message: params.message ?? "Forbidden.",
      details: params.details,
    });
  }
}

export { ForbiddenError };
