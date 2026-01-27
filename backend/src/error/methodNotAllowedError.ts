import { HttpError } from "./httpError";

class MethodNotAllowedError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 405,
      message: params.message ?? "Method not allowed",
      details: params.details,
    });
  }
}

export { MethodNotAllowedError };
