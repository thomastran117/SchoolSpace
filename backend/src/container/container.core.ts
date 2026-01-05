import { initMongo } from "../resource/mongo";
import { initPrisma } from "../resource/prisma";
import { initRedis } from "../resource/redis";
import { UserModel } from "../templates/userTemplate";
import logger from "../utility/logger";

class CoreInitializer {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    logger.info("Initializing connections");

    try {
      await initRedis();
      await initPrisma();
      await initMongo();
      await UserModel.syncIndexes();
      logger.info("Core connections successful");
    } catch (err: any) {
      logger.error(`[Container] Connections failed: ${err?.message ?? err}`);
      process.exit(1);
    }
  }
}

export { CoreInitializer };
