/**
 * @file httpUtility.ts
 * @description
 * Utility file that provides helpers for HTTP request validation, field checking,
 * and structured error handling.
 *
 * @module utility
 * @version 1.0.0
 * @auth Thomas
 */

export class HttpError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export function httpError(
  statusCode: number,
  message: string,
  details?: unknown
): never {
  throw new HttpError(statusCode, message, details);
}
