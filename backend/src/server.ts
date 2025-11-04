/**
 * @file server.ts
 * @description Main entry point of the app
 *
 * @module app
 *
 * @author Thomas
 * @version 1.0.0
 *
 */
import "reflect-metadata";
import { initializeApp } from "./app";
import logger from "./utility/logger";

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    const app = await initializeApp();
    app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));
  } catch (err: any) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
})();
