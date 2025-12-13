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

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 10_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(err: any): boolean {
  return (
    err?.code === "ECONNREFUSED" ||
    err?.code === "ETIMEDOUT" ||
    err?.code === "EHOSTUNREACH" ||
    err?.code === "P1001" ||
    err?.code === "P1002"
  );
}

export async function initPrisma(): Promise<void> {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      await prisma.$connect();
      // logger.info("MySQL database is connected");
      return;
    } catch (err: any) {
      if (!isRetryableError(err)) {
        logger.error(`Non-retryable DB error: ${err.message}`);
        process.exit(1);
      }

      const isLastAttempt = attempt >= MAX_RETRIES;

      const exponentialDelay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 300);
      const delay = Math.min(exponentialDelay + jitter, MAX_DELAY_MS);

      logger.error(
        `Failed to connect to DB (attempt ${attempt}/${MAX_RETRIES}): ${err.message}`,
      );

      if (isLastAttempt) {
        logger.error("All DB connection attempts failed. Exiting process.");
        process.exit(1);
      }

      logger.info(`Retrying DB connection in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

export default prisma;
