import { HttpError } from "./httpError";

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
