import { initPrisma } from "../resource/prisma";
import { initRedis } from "../resource/redis";
import { initMongo } from "../resource/mongo";
import logger from "../utility/logger";

class CoreInitializer {
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
      logger.error(
        `[Container] Core registration failed: ${err?.message ?? err}`,
      );
      process.exit(1);
    }
  }
}

export { CoreInitializer };
