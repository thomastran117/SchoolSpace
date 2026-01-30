/**
 * @file httpError.ts
 * @description
 * Abstract application error for the node backend. All errors inherit from this, which
 * is understood by the global error plugin
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */

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
