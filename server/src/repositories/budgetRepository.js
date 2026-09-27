const prisma = require("../../prisma/db");

function findByMonth(userId, month) {
    return prisma.budget.findMany({
        where: { userId, month },
        include: { category: true },
        orderBy: { category: { name: "asc" } },
    });
}

function findById(userId, id) {
    return prisma.budget.findFirst({ where: { id, userId } });
}

function upsert({ userId, categoryId, month, limitAmount }) {
    return prisma.budget.upsert({
        where: { categoryId_month: { categoryId, month } },
        update: { limitAmount },
        create: { userId, categoryId, month, limitAmount },
        include: { category: true }
    });
}

function remove(id) {
    return prisma.budget.delete({ where: { id } });
}

module.exports = { findById, findByMonth, remove, upsert };
