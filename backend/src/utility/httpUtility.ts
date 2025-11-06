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
