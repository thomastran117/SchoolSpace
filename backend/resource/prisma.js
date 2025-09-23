const { PrismaClient } = require("@prisma/client");
import logger from"../utility/logger.js";
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

export default prisma;
