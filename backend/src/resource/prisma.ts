/**
 * @file prisma.ts
 * @description
 * Prisma client that connects to the MySQL database.
 *
 * - Initializes a single shared PrismaClient instance across the app.
 * - Attempts to connect at startup.
 * - Logs connection status.
 * - Gracefully exits if the database connection fails.
 *
 * @module resource
 * @version 1.0.0
 * @author Thomas
 */

import { PrismaClient } from "@prisma/client";
import logger from "../utility/logger";

// Create a single PrismaClient instance
const prisma = new PrismaClient();

/**
 * Initializes the Prisma client by connecting to the database.
 *
 * @async
 * @function init
 * @throws Will terminate the process if the connection fails.
 */
async function init(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("MySQL database is connected");
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Failed to connect to DB: ${err.message}`);
    } else {
      logger.error("Failed to connect to DB: Unknown error");
    }
    process.exit(1);
  }
}

// Initialize immediately on startup
void init();

export default prisma;
