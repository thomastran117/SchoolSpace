const { PrismaClient } = require("@prisma/client");
const logger = require("../utility/logger");
const prisma = new PrismaClient();

async function init() {
  try {
    await prisma.$connect();
    logger.info("MySQL database is connected");
  } catch (err) {
    logger.error("Failed to connect to DB");
    process.exit(1);
  }
}

init();

module.exports = prisma;
