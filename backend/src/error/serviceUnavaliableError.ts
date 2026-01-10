import { HttpError } from "./httpError";

class ServiceUnavaliableError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 503,
      message: params.message ?? "Service is unavaliable.",
      details: params.details,
    });
  }
}

export { ServiceUnavaliableError };
