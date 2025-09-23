import chalk from "chalk";

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
