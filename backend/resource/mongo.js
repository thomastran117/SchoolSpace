const mongoose = require("mongoose");
const logger = require("../utility/logger");
const config = require("../config/envManager");

const MONGO_URL = config.mongo_url;

mongoose.set("strictQuery", true);

function attachLifecycleLogs() {
  mongoose.connection.on("connected", () => logger.info("Mongo is connected"));
  mongoose.connection.on("disconnected", () =>
    logger.warn("Mongo is disconnected"),
  );
  mongoose.connection.on("error", (err) =>
    logger.error(`Mongo connection error: ${err.message}`),
  );
}

async function connectAndPing() {
  const options = {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  };

  await mongoose.connect(MONGO_URL, options);

  const res = await mongoose.connection.db.admin().command({ ping: 1 });
  if (res?.ok !== 1) throw new Error("MongoDB ping returned non-ok result");
}

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

attachLifecycleLogs();
connectAndPing()
  .then(() => setupGracefulShutdown())
  .catch((err) => {
    logger.error(`Mongo Startup failed: ${err.message}`);
    process.exit(1);
  });

module.exports = mongoose;
