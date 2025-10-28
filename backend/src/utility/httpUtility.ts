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

import type { Response } from "express";

/* -------------------------------------------------------------
 * Custom HTTP Error Type
 * ----------------------------------------------------------- */

/**
 * Custom HTTP error with statusCode property.
 */
export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/* -------------------------------------------------------------
 * Field Validation Utilities
 * ----------------------------------------------------------- */

/**
 * Ensures that all required fields are present in the request body.
 *
 * @param fields - List of required field names.
 * @param body - Request body object.
 * @throws {HttpError} If any required fields are missing.
 *
 * @example
 * requireFields(["email", "password"], req.body);
 */
export function requireFields(
  fields: string[],
  body: Record<string, any>,
): void {
  const missing = fields.filter((field) => !body[field]);

  if (missing.length > 0) {
    const message =
      missing.length === 1
        ? `${missing[0]} is required`
        : `${missing.join(", ")} are required`;

    throw new HttpError(400, message);
  }
}

/**
 * Ensures that at least one of the specified fields is present in the request body.
 *
 * @param fields - List of possible field names.
 * @param body - Request body object.
 * @throws {HttpError} If none of the fields are provided.
 *
 * @example
 * requiresAtLeastOneField(["username", "email"], req.body);
 */
export function requiresAtLeastOneField(
  fields: string[],
  body: Record<string, any>,
): void {
  const provided = fields.filter(
    (field) => body[field] !== undefined && body[field] !== null,
  );

  if (provided.length === 0) {
    const message =
      fields.length === 1
        ? `At least ${fields[0]} is required`
        : `At least one of [${fields.join(", ")}] is required`;

    throw new HttpError(400, message);
  }
}

/**
 * Validates that a given value is within an allowed set of values.
 *
 * @param value - The provided value.
 * @param allowed - Array of allowed values.
 * @param fieldName - Optional field name for contextual error message.
 * @returns True if valid.
 * @throws {HttpError} If the value is not in the allowed list.
 *
 * @example
 * assertAllowed(role, ["student", "teacher"], "role");
 */
export function assertAllowed(
  value: string,
  allowed: string[],
  fieldName = "field",
): boolean {
  if (!allowed.includes(value)) {
    const message = `${fieldName} must be one of: ${allowed.join(", ")}`;
    throw new HttpError(400, message);
  }
  return true;
}

/* -------------------------------------------------------------
 * HTTP Error + Response Utilities
 * ----------------------------------------------------------- */

/**
 * Creates and throws an HTTP error.
 *
 * @param statusCode - HTTP status code.
 * @param message - Error message.
 * @throws {HttpError} Always throws the constructed error.
 *
 * @example
 * httpError(404, "User not found");
 */
export function httpError(statusCode: number, message: string): never {
  throw new HttpError(statusCode, message);
}

/**
 * Creates an HTTP-like response error object (without throwing it).
 *
 * @param statusCode - HTTP status code.
 * @param message - Message to attach.
 * @returns {HttpError} Error object with statusCode.
 *
 * @example
 * return httpResponse(200, "Success");
 */
export function httpResponse(statusCode: number, message: string): HttpError {
  return new HttpError(statusCode, message);
}

/* -------------------------------------------------------------
 * Cookie Utility
 * ----------------------------------------------------------- */

/**
 * Sends a refresh token as an HTTP-only cookie.
 *
 * @param res - Express response object.
 * @param refreshToken - The refresh token string.
 */
export function sendCookie(res: Response, refreshToken: string): void {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}
