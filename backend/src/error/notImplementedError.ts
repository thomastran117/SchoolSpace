import { HttpError } from "./httpError";

class NotImplementedError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 501,
      message: params.message ?? "Not implemented",
      details: params.details,
    });
  }
}

export { NotImplementedError };
