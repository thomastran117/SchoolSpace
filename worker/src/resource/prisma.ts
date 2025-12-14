/**
 * @file prisma.ts
 * @description
 * Prisma client singleton with deferred initialization.
 *
 * - Provides `prisma` client instance.
 * - Defers database connection until explicitly initialized.
 * - Logs connection status.
 *
 * @module resource
 * @version 2.0.0
 * @author Thomas
 */

import { PrismaClient } from "@prisma/client";
import logger from "../utility/logger";

const prisma = new PrismaClient();

export async function initPrisma(): Promise<void> {
  try {
    await prisma.$connect();
    // logger.info("MySQL database is connected");
  } catch (err: any) {
    logger.error(`Failed to connect to DB: ${err.message}`);
    process.exit(1);
  }
}

export default prisma;
