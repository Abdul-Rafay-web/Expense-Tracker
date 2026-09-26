const prisma = require("../db");

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

module.exports = { findMany, findById, create, remove };