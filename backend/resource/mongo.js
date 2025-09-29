/**
 * @file mongo.js
 * @description A mongo client instance that mounts and exports itself to be used anywhere in the
 * service layer
 *
 * @module resource
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// External libraries
import mongoose from "mongoose";

// Internal core modules
import logger from "../utility/logger.js";
import config from "../config/envManager.js";

const MONGO_URL = config.mongo_url;

/**
 * Connects to MongoDB and verifies the connection by sending a `ping` command.
 *
 * @async
 * @function connectAndPing
 * @throws {Error} If MongoDB connection fails or ping response is not ok.
 */
async function connectAndPing() {
  const options = {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  };

  await mongoose.connect(MONGO_URL, options);

  const res = await mongoose.connection.db.admin().command({ ping: 1 });
  if (res?.ok !== 1) throw new Error("MongoDB ping returned non-ok result");
}

/**
 * Sets up graceful shutdown hooks for MongoDB.
 *
 * - Listens for `SIGINT` and `SIGTERM`.
 * - Closes the MongoDB connection cleanly.
 * - Logs closure or errors during shutdown.
 *
 * @function setupGracefulShutdown
 */
function setupGracefulShutdown() {
  const close = async (signal) => {
    try {
      await mongoose.disconnect();
      logger.info(`Mongo Closed on ${signal}`);
    } catch (e) {
      logger.error(`Mongo Close error: ${e.message}`);
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", () => close("SIGINT"));
  process.on("SIGTERM", () => close("SIGTERM"));
}

/**
 * Attaches lifecycle logs for MongoDB connection events.
 *
 * Example logs: connected, disconnected, error.
 * @function attachLifecycleLogs
 */
function attachLifecycleLogs() {
  mongoose.connection.on("connected", () => logger.info("MongoDB connected"));
  mongoose.connection.on("disconnected", () =>
    logger.warn("MongoDB disconnected"),
  );
  mongoose.connection.on("error", (err) =>
    logger.error(`MongoDB error: ${err.message}`),
  );
}

// Initialize MongoDB connection
attachLifecycleLogs();
connectAndPing()
  .then(() => setupGracefulShutdown())
  .catch((err) => {
    logger.error(`Mongo Startup failed: ${err.message}`);
    process.exit(1);
  });

export default mongoose;
