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
            type: "EXPENSE",
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
function update(id, data) {
    return prisma.transaction.update({
        where: { id },
        data,
        include: { category: true },
    });
}
function findInRange(start, end) {
    return prisma.transaction.findMany({
        where: { date: { gte: start, lt: end } },
        select: { type: true, amount: true, date: true },
    });
}

module.exports = { update, findMany, findById, create, remove, sumExpensesByCategory, sumByCategory, sumByType, findInRange };