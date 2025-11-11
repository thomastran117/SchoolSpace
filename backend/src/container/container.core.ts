import { initPrisma } from "../resource/prisma";
import { initRedis } from "../resource/redis";
import { initMongo } from "../resource/mongo";
import logger from "../utility/logger";

export class CoreInitializer {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    logger.info("Initializing core infrastructure...");

    try {
      await initPrisma();
      await initRedis();
      await initMongo();
      logger.info("Core infrastructure initialized successfully.");
    } catch (err: any) {
      logger.error(`Infrastructure initialization failed: ${err.message}`);
      process.exit(1);
    }
  }
}