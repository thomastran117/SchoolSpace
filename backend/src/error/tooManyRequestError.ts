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
