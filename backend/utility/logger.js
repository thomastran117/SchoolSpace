import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "error.log");

function getTimestamp() {
  return new Date().toISOString();
}

function logToFile(level, message) {
  const logEntry = `[${getTimestamp()}] [${level.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(logFile, logEntry, { encoding: "utf8" });
}

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

export default {
  info: (msg) => log("info", msg),
  warn: (msg) => log("warn", msg),
  error: (msg) => log("error", msg),
  debug: (msg) => log("debug", msg),
  log: (msg) => log("log", msg),
};
