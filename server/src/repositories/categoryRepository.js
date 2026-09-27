const prisma = require("../../prisma/db");

function findAll(userId) {
    return prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } });
}
function findById(userId, id) {
    return prisma.category.findFirst({ where: { id, userId } });
}
function findByName(userId, name) {
    return prisma.category.findUnique({ where: { userId_name: { userId, name } } });
}
function countTransactions(id) {
    return prisma.transaction.count({ where: { categoryId: id } });
}
function create(data) {
    return prisma.category.create({ data });
}
function remove(id) {
    return prisma.category.delete({ where: { id } });
}

module.exports = { findAll, findById, findByName, countTransactions, create, remove }
