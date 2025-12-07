import { buildApp } from "./app";
import logger from "./utility/logger";

const PORT = process.env.PORT || 8040;

async function start() {
  try {
    const app = await buildApp();
    await app.listen({ port: Number(PORT), host: "localhost" });
    logger.info(`Server running on port ${PORT}`);
  } catch (err: any) {
    logger.error(`[Server] Failed to start: ${err.message}`);
    process.exit(1);
  }
}

start();
