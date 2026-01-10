abstract class HttpError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(params: {
    statusCode: number;
    message: string;
    details?: unknown;
  }) {
    super(params.message);
    this.statusCode = params.statusCode;
    this.details = params.details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export { HttpError };
