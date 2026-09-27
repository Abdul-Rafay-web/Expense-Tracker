const prisma = require("../../prisma/db");

async function resetDatabase() {
    await prisma.transaction.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.category.deleteMany();
}

module.exports = { prisma, resetDatabase };
