import { HttpError } from "./httpError";

class PayloadTooLargeError extends HttpError {
  constructor(params: { message?: string; details?: unknown } = {}) {
    super({
      statusCode: 413,
      message: params.message ?? "Payload is too large",
      details: params.details,
    });
  }
}

export { PayloadTooLargeError };
