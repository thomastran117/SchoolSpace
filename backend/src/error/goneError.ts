import { HttpError } from "./httpError";

class GoneError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 410,
      message: params.message ?? "Resource is gone.",
      details: params.details,
    });
  }
}

export { GoneError };
