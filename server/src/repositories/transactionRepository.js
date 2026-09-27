const prisma = require("../../prisma/db");


function findMany({ type, start, end }) {
    return prisma.transaction.findMany({
        where: {
            type,
            date: start ? { gte: start, lt: end } : undefined,
        },
        include: { category: true },
        orderBy: { date: "desc" },
    });
}

function findById(id) {
    return prisma.transaction.findUnique({ where: { id } });
}
function create(data) {
    return prisma.transaction.create({ data, include: { category: true } });
}
function remove(id) {
    return prisma.transaction.delete({ where: { id } });
}

function sumExpensesByCategory(start, end) {
    return prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
            type: "Expense",
            date: { gte: start, lt: end },
        },
        _sum: { amount: true }
    })
}

function sumByType(start, end) {
    return prisma.transaction.groupBy({
        by: ["type"],
        where: { date: { gte: start, lt: end } },
        _sum: { amount: true }
    })
}

function sumByCategory(type, start, end) {
    return prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
            type,
            date: { gte: start, lt: end },
        },
        _sum: { amount: true },
    });
}

module.exports = { findMany, findById, create, remove, sumExpensesByCategory, sumByCategory, sumByType };