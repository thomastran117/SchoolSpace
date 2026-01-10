import { HttpError } from "./httpError";

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
