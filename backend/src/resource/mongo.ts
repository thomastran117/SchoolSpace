/**
 * @file mongo.ts
 * @description
 * A MongoDB client instance using Mongoose that mounts and exports itself
 * for use across the service layer.
 *
 * - Verifies connectivity via a `ping` command.
 * - Logs connection lifecycle events.
 * - Handles graceful shutdown on SIGINT and SIGTERM.
 *
 * @module resource
 * @version 1.0.0
 * @auth Thomas
 */

import mongoose from "mongoose";
import logger from "../utility/logger";
import config from "../config/envManager";

const MONGO_URL = config.mongo_url;

/**
 * Connects to MongoDB and verifies the connection by sending a `ping` command.
 *
 * @async
 * @function connectAndPing
 * @throws {Error} If MongoDB connection fails or ping response is not ok.
 */
async function connectAndPing(): Promise<void> {
  const options: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  };

  await mongoose.connect(MONGO_URL, options);

  const res = await mongoose.connection.db?.admin().command({ ping: 1 });
  if (!res || res.ok !== 1) {
    throw new Error("MongoDB ping returned non-ok result");
  }
}

/**
 * Sets up graceful shutdown hooks for MongoDB.
 *
 * - Listens for `SIGINT` and `SIGTERM`.
 * - Closes the MongoDB connection cleanly.
 * - Logs closure or errors during shutdown.
 */
function setupGracefulShutdown(): void {
  const close = async (signal: string): Promise<void> => {
    try {
      await mongoose.disconnect();
      logger.info(`Mongo Closed on ${signal}`);
    } catch (e: any) {
      logger.error(`Mongo Close error: ${e.message}`);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => void close("SIGINT"));
  process.on("SIGTERM", () => void close("SIGTERM"));
}

/**
 * Attaches lifecycle logs for MongoDB connection events.
 */
function attachLifecycleLogs(): void {
  mongoose.connection.on("connected", () => logger.info("MongoDB connected"));
  mongoose.connection.on("disconnected", () =>
    logger.warn("MongoDB disconnected")
  );
  mongoose.connection.on("error", (err) =>
    logger.error(`MongoDB error: ${err.message}`)
  );
}

// ---------- Initialize MongoDB ----------
attachLifecycleLogs();

connectAndPing()
  .then(() => setupGracefulShutdown())
  .catch((err: unknown) => {
    if (err instanceof Error) {
      logger.error(`Mongo Startup failed: ${err.message}`);
    } else {
      logger.error("Mongo Startup failed: Unknown error");
    }
    process.exit(1);
  });

export default mongoose;
