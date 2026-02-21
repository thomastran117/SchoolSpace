import chalk from "chalk";
import fp from "fastify-plugin";

export default fp(async function requestLogger(app) {
  app.addHook("onRequest", async (request, reply) => {
    (request as any)._startTime = Date.now();
  });

  app.addHook("onResponse", async (request, reply) => {
    const start = (request as any)._startTime;
    const duration = Date.now() - start;

    const statusCode = reply.statusCode;

    const statusColor =
      statusCode >= 500
        ? chalk.red
        : statusCode >= 400
          ? chalk.yellow
          : statusCode >= 300
            ? chalk.cyan
            : statusCode >= 200
              ? chalk.green
              : chalk.white;

    const methodColor =
      request.method === "GET"
        ? chalk.green
        : request.method === "POST"
          ? chalk.blue
          : request.method === "PUT"
            ? chalk.yellow
            : request.method === "DELETE"
              ? chalk.red
              : chalk.white;

    const log =
      chalk.gray(`[${new Date().toISOString()}] `) +
      `${methodColor(request.method)} ${request.url} ` +
      `${statusColor(statusCode)} - ${duration}ms`;

    console.log(log);
  });
});
