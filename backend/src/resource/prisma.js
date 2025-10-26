/**
 * @file prisma.js
 * @description A prisma client that connects to the MySQL database
 *
 * @module resource
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// External libraries
import { PrismaClient } from "@prisma/client";

// Internal core modules
import logger from "../utility/logger.js";

/**
 * Prisma client instance for interacting with the MySQL database.
 *
 * - Initializes a single shared `PrismaClient` across the application.
 * - Attempts to connect to the database at startup.
 * - Logs connection status using the custom logger.
 * - Exits the process if the database connection fails.
 *
 * @module prismaClient
 * @see https://www.prisma.io/docs/concepts/components/prisma-client
 */
const prisma = new PrismaClient();

/**
 * Initializes the Prisma client by connecting to the database.
 *
 * @async
 * @function init
 * @returns {Promise<void>}
 * @throws Will terminate the process if the database connection fails.
 */
async function init() {
  try {
    await prisma.$connect();
    logger.info("MySQL database is connected");
  } catch (err) {
    logger.error("Failed to connect to DB");
    process.exit(1);
  }
}

// Run database initialization on startup
init();

export default prisma;
