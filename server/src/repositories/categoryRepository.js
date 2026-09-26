const prisma = require("../../prisma/db");

function findAll() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
}
function findById(id) {
    return prisma.category.findUnique({ where: { id } });
}
function findByName(name) {
    return prisma.category.findUnique({ where: { name } })
}
function countTransactions(id) {
    return prisma.category.count({ where: { categoryID: id } });
}
function create(data) {
    return prisma.category.create({ data });
}
function remove(id) {
    return prisma.category.delete({ where: { id } });
}

module.exports = { findAll, findById, findByName, countTransactions, create, remove }