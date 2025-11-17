import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";

const baseDir = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

const logFile = path.join(baseDir, "error.log");
type LogLevel = "info" | "warn" | "error" | "debug" | "log";

function getTimestamp() {
  return new Date().toISOString();
}

function logToFile(level: LogLevel, message: string) {
  const entry = `[${getTimestamp()}] [${level.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(logFile, entry, "utf8");
}

function log(level: LogLevel, message: string) {
  const t = chalk.gray(`[${getTimestamp()}]`);

  const map = {
    info: chalk.blue("[INFO]"),
    warn: chalk.yellow("[WARN]"),
    error: chalk.red("[ERROR]"),
    debug: chalk.cyan("[DEBUG]"),
    log: chalk.white("[LOG]"),
  } as const;

  // eslint-disable-next-line no-console
  console.log(`${t} ${map[level]} ${message}`);

  if (level === "warn" || level === "error") {
    logToFile(level, message);
  }
}

const logger = {
  info: (msg: string) => log("info", msg),
  warn: (msg: string) => log("warn", msg),
  error: (msg: string) => log("error", msg),
  debug: (msg: string) => log("debug", msg),
  log: (msg: string) => log("log", msg),
};

export default logger;
