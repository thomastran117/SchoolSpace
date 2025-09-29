/**
 * @file httpLoggerMiddleware.js
 * @description  Logs HTTP request including method, api endpoint, response and time to respond
 * Useful for development and testing. Disable in production and log to a file instead
 *
 * @module middleware
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// External libraries
import chalk from "chalk";

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
 *
 * @function requestLogger
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @example
 * import express from "express";
 * import requestLogger from "./middleware/requestLogger.js";
 *
 * const app = express();
 * app.use(requestLogger);
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    // Pick color based on status code
    let statusColor;
    if (res.statusCode >= 500) {
      statusColor = chalk.red;
    } else if (res.statusCode >= 400) {
      statusColor = chalk.yellow;
    } else if (res.statusCode >= 300) {
      statusColor = chalk.cyan;
    } else if (res.statusCode >= 200) {
      statusColor = chalk.green;
    } else {
      statusColor = chalk.white;
    }

    // Pick color based on method
    let methodColor;
    switch (req.method) {
      case "GET":
        methodColor = chalk.green;
        break;
      case "POST":
        methodColor = chalk.blue;
        break;
      case "PUT":
        methodColor = chalk.yellow;
        break;
      case "DELETE":
        methodColor = chalk.red;
        break;
      default:
        methodColor = chalk.white;
    }

    const log =
      `[${new Date().toISOString()}] ` +
      `${methodColor(req.method)} ${req.originalUrl} ` +
      `${statusColor(res.statusCode)} - ${duration}ms`;

    console.log(log);
  });

  next();
}

export default requestLogger;
