import { HttpError } from "./httpError";

class UnauthorizedError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 401,
      message: params.message ?? "Unauthorized.",
      details: params.details,
    });
  }
}

export { UnauthorizedError };
