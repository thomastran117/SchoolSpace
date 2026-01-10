import { HttpError } from "./httpError";

class UnprocessableEntityError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 422,
      message: params.message ?? "Unprocessable entity.",
      details: params.details,
    });
  }
}

export { UnprocessableEntityError };
