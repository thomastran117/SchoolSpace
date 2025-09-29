/**
 * @file logger.js
 * @description Custom logger file that logs information in a formatted way. Additionally writes
 * ERROR and WARNING logs to a file to be processed later
 *
 * @module utility
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// External libraries
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

// Mounting the error log directory and file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "error.log");

/**
 * Generates an ISO timestamp string.
 *
 * @returns {string} Current timestamp in ISO 8601 format.
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Writes a log entry to the error log file.
 *
 * @param {"info"|"warn"|"error"|"debug"|"log"} level - Log severity level.
 * @param {string} message - Log message.
 */
function logToFile(level, message) {
  const logEntry = `[${getTimestamp()}] [${level.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(logFile, logEntry, { encoding: "utf8" });
}

/**
 * Core logging function for console + optional file logging.
 *
 * @param {"info"|"warn"|"error"|"debug"|"log"} level - Log severity level.
 * @param {string} message - Log message.
 *
 * @example
 * log("info", "Server started on port 3000");
 * log("error", "Database connection failed");
 */
function log(level, message) {
  const timestamp = chalk.gray(`[${getTimestamp()}]`);

  switch (level) {
    case "info":
      console.log(`${timestamp} ${chalk.blue("[INFO]")} ${message}`);
      break;
    case "warn":
      console.log(`${timestamp} ${chalk.yellow("[WARN]")} ${message}`);
      logToFile(level, message);
      break;
    case "error":
      console.log(`${timestamp} ${chalk.red("[ERROR]")} ${message}`);
      logToFile(level, message);
      break;
    case "debug":
      console.log(`${timestamp} ${chalk.cyan("[DEBUG]")} ${message}`);
      break;
    default:
      console.log(`${timestamp} ${chalk.white("[LOG]")} ${message}`);
  }
}

/**
 * Logger utility with color-coded console output and file persistence
 * for warnings and errors.
 *
 * - `info`: Console only, blue.
 * - `warn`: Console + writes to `logs/error.log`, yellow.
 * - `error`: Console + writes to `logs/error.log`, red.
 * - `debug`: Console only, cyan.
 * - `log`: Console only, white (generic).
 */
export default {
  /**
   * Logs an informational message (console only).
   * @param {string} msg - Message to log.
   */
  info: (msg) => log("info", msg),

  /**
   * Logs a warning message (console + file).
   * @param {string} msg - Message to log.
   */
  warn: (msg) => log("warn", msg),

  /**
   * Logs an error message (console + file).
   * @param {string} msg - Message to log.
   */
  error: (msg) => log("error", msg),

  /**
   * Logs a debug message (console only).
   * @param {string} msg - Message to log.
   */
  debug: (msg) => log("debug", msg),

  /**
   * Logs a generic message (console only).
   * @param {string} msg - Message to log.
   */
  log: (msg) => log("log", msg),
};
