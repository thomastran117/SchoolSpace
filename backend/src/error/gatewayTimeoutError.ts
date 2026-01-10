import { HttpError } from "./httpError";

class GatewayTimeoutError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 504,
      message: params.message ?? "Gateway timeout.",
      details: params.details,
    });
  }
}

export { GatewayTimeoutError };
