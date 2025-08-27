/**
 * @file logger.js
 * @description Utility function for logging server errors to a txt file
 *
 * @module utility
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

/**
 * Imports
 */
const fs = require("fs");
const path = require("path");

/**
 * Path to find the log file
 * Should be located at the backend root directory (same level as package.json)
 *
 * @constant {string}
 */
const logFilePath = path.join(__dirname, "..", "error.log.txt");

/**
 * Logs the server error to the text file.
 *
 * @function logServerError
 * @param {error} err - The error message that the service layer has thrown
 * @param {request} req - The request method that has caused the eror
 * @returns {void}
 */
function logServerError(err, req) {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${err.message}\n`;

  fs.appendFile(logFilePath, log, (fsErr) => {
    if (fsErr) console.error("Failed to write to log file:", fsErr);
  });
}

// Export the function
module.exports = { logServerError };
