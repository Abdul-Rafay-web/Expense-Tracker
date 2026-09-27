const prisma = require("../../prisma/db");

async function clearFinanceData() {
    await prisma.transaction.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.category.deleteMany();
}

async function resetDatabase() {
    await clearFinanceData();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
}

module.exports = { prisma, resetDatabase, clearFinanceData };
