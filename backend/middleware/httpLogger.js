const chalk = require("chalk");

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
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

    const log =
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ` +
      `${statusColor(res.statusCode)} - ${duration}ms`;

    console.log(log);
  });

  next();
}

module.exports = requestLogger;
