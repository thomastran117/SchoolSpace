/**
 * @file mongo.ts
 * @description
 * Provides a MongoDB connection manager using Mongoose.
 * Exposes an `initMongo()` function for container initialization
 * and exports the configured `mongoose` client.
 *
 * @module resource
 * @version 2.0.1
 */

import mongoose from "mongoose";
import logger from "../utility/logger";
import config from "../config/envConfigs";

const MONGO_URL = config.mongo_url;

export async function initMongo(): Promise<void> {
  try {
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    };

    await mongoose.connect(MONGO_URL, options);

    const res = await mongoose.connection.db?.admin().command({ ping: 1 });
    if (!res || res.ok !== 1) {
      throw new Error("MongoDB ping returned non-ok result");
    }

    logger.info("MongoDB is connected");
    setupGracefulShutdown();
  } catch (err: any) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw err;
  }
}

function setupGracefulShutdown(): void {
  const close = async (): Promise<void> => {
    try {
      await mongoose.disconnect();
      logger.info("MongoDB connection closed gracefully");
    } catch (e: any) {
      logger.error(`MongoDB close error: ${e.message}`);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);
  process.on("SIGQUIT", close);
}

export default mongoose;
