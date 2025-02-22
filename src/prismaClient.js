const { PrismaClient } = require("@prisma/client");

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"], // Optional: logs for debugging
  });
}

prisma = global.prisma;

module.exports = { prisma };
