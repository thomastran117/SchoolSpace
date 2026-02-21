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
import env from "@config/envConfigs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaMariaDb({
  host: env.databaseHost,
  port: Number(env.databasePort),
  user: env.databaseUser,
  password: env.databasePassword,
  database: env.databaseName,
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

export async function initPrisma(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    process.exit(1);
  }
}

export default prisma;
