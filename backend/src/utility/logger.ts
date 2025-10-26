/**
 * @file logger.ts
 * @description Custom logger utility that logs formatted information to console
 * and writes warnings/errors to a file for later processing.
 *
 * @module utility/logger
 * @version 1.1.0
 */

import fs from "fs";
import path from "path";
import chalk from "chalk";

const __dirname = process.cwd();

// Ensure log directory exists
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, "error.log");

/**
 * Supported log severity levels.
 */
export type LogLevel = "info" | "warn" | "error" | "debug" | "log";

/**
 * Generates an ISO timestamp string.
 *
 * @returns {string} Current timestamp in ISO 8601 format.
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Writes a log entry to the error log file.
 *
 * @param level - Log severity level.
 * @param message - Log message.
 */
function logToFile(level: LogLevel, message: string): void {
  const logEntry = `[${getTimestamp()}] [${level.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(logFile, logEntry, { encoding: "utf8" });
}

/**
 * Core logging function for console + optional file logging.
 *
 * @param level - Log severity level.
 * @param message - Log message.
 */
function log(level: LogLevel, message: string): void {
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
 */
const logger = {
  info: (msg: string): void => log("info", msg),
  warn: (msg: string): void => log("warn", msg),
  error: (msg: string): void => log("error", msg),
  debug: (msg: string): void => log("debug", msg),
  log: (msg: string): void => log("log", msg),
};

export default logger;
