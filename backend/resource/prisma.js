const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function init() {
  try {
    await prisma.$connect();
  } catch (err) {
    console.error("❌ Failed to connect to DB (Prisma):", err);
    process.exit(1);
  }
}

init();

module.exports = prisma;