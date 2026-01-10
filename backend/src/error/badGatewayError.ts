import { HttpError } from "./httpError";

class BadGatewayError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 502,
      message: params.message ?? "Bad gateway.",
      details: params.details,
    });
  }
}

export { BadGatewayError };
