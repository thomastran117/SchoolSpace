/**
 * @file errorHandlerMiddleware.ts
 * @description
 * Global error handling middleware for Express.
 *
 * Handles 401, 404, 500, and other structured errors.
 *
 * @module middleware
 * @version 1.0.0
 * @author Thomas
 */

import type { NextFunction, Request, Response } from "express";
import logger from "../utility/logger";

/**
 * Extended error type to include statusCode.
 */
interface AppError extends Error {
  statusCode?: number;
}

/**
 * Global error handling middleware for Express.
 *
 * Logs internal errors and returns a structured JSON response.
 *
 * @param err - Error object (may include `statusCode`).
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next middleware function.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.statusCode || 500;
  const message = err.message || "Server failed to process the data";

  if (status === 500) {
    logger.error(`Server failed to process the data: ${err.message}`);
  }

  res.status(status).json({ error: message });
}
