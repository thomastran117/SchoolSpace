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

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export function httpError(statusCode: number, message: string): never {
  throw new HttpError(statusCode, message);
}

export function sendCookie(res: Response, refreshToken: string): void {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}
