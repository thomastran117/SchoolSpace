/**
 * @file httpLoggerMiddleware.ts
 * @description
 * Logs HTTP requests including method, endpoint, status code, and response time.
 * Useful for development and testing. In production, consider logging to a file instead.
 *
 * @module middleware
 * @version 1.0.0
 * @author Thomas
 */

import chalk from "chalk";
import type { NextFunction, Request, Response } from "express";

/**
 * Express middleware for logging HTTP requests and responses.
 *
 * - Logs HTTP method, request URL, status code, and response duration.
 * - Uses color-coded output:
 *   - Status codes:
 *     - 2xx → green
 *     - 3xx → cyan
 *     - 4xx → yellow
 *     - 5xx → red
 *   - Methods:
 *     - GET → green
 *     - POST → blue
 *     - PUT → yellow
 *     - DELETE → red
 *     - Others → white
 * - Logs in the format:
 *   `[timestamp] METHOD URL STATUS - DURATIONms`
 */
function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    // Pick color based on status code
    const statusColor =
      res.statusCode >= 500
        ? chalk.red
        : res.statusCode >= 400
          ? chalk.yellow
          : res.statusCode >= 300
            ? chalk.cyan
            : res.statusCode >= 200
              ? chalk.green
              : chalk.white;

    // Pick color based on method
    const methodColor =
      req.method === "GET"
        ? chalk.green
        : req.method === "POST"
          ? chalk.blue
          : req.method === "PUT"
            ? chalk.yellow
            : req.method === "DELETE"
              ? chalk.red
              : chalk.white;

    const log =
      chalk.gray(`[${new Date().toISOString()}] `) +
      `${methodColor(req.method)} ${req.originalUrl} ` +
      `${statusColor(res.statusCode)} - ${duration}ms`;

    // eslint-disable-next-line no-console
    console.log(log);
  });

  next();
}

export default requestLogger;
