const prisma = require("../../prisma/db");
const { category } = require("../../prisma/db");

function findByMonth(month) {
    return prisma.budget.findMany({
        where: { month },
        include: { category: true },
        orderBy: { category: { name: "asc" } },
    });
}

function findById(id) {
    return prisma.budget.findUnique({ where: { id } });
}

function upsert({ categoryId, month, limitAmount }) {
    return prisma.budget.upsert({
        where: { categoryId_month: { categoryId, month } },
        update: { limitAmount },
        create: { categoryId, month, limitAmount },
        include: { category: true }
    });
}

function remove(id) {
    return prisma.budget.delete({ where: { id } });
}

module.exports = { findById, findByMonth, remove, upsert };


