/**
 * @file errorHandlerMiddleware.js
 * @description  Handles error responses such as 401, 404, 500 globally
 *
 * @module middleware
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// Internal core modules
import logger from "../utility/logger.js";

/**
 * Global error handling middleware for Express.
 *
 * @param {Error} err - Error object, optionally with `statusCode`.
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next function.
 */
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || "Server failed to process the data";

  if (status === 500) {
    logger.error(`Server failed to process the data: ${err.message}`);
  }
  
  res.status(status).json({ error: message });
}
