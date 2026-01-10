import { HttpError } from "./httpError";

class NotFoundError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 404,
      message: params.message ?? "Resource is not found.",
      details: params.details,
    });
  }
}

export { NotFoundError };
