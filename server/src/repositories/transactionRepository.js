const prisma = require("../../prisma/db");


function findMany({ userId, type, start, end }) {
    return prisma.transaction.findMany({
        where: {
            userId,
            type,
            date: start ? { gte: start, lt: end } : undefined,
        },
        include: { category: true },
        orderBy: { date: "desc" },
    });
}

function findById(userId, id) {
    return prisma.transaction.findFirst({ where: { id, userId } });
}
function create(data) {
    return prisma.transaction.create({ data, include: { category: true } });
}
function remove(id) {
    return prisma.transaction.delete({ where: { id } });
}

function sumExpensesByCategory(userId, start, end) {
    return prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
            userId,
            type: "EXPENSE",
            date: { gte: start, lt: end },
        },
        _sum: { amount: true }
    })
}

function sumByType(userId, start, end) {
    return prisma.transaction.groupBy({
        by: ["type"],
        where: { userId, date: { gte: start, lt: end } },
        _sum: { amount: true }
    })
}

function sumByCategory(userId, type, start, end) {
    return prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
            userId,
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
function findInRange(userId, start, end) {
    return prisma.transaction.findMany({
        where: { userId, date: { gte: start, lt: end } },
        select: { type: true, amount: true, date: true },
    });
}

function importWithCategories(userId, rows) {
    return prisma.$transaction(async (tx) => {
        const categoryIds = new Map();
        let categoriesCreated = 0;

        for (const name of new Set(rows.map((row) => row.category))) {
            let category = await tx.category.findUnique({ where: { userId_name: { userId, name } } });
            if (!category) {
                category = await tx.category.create({ data: { userId, name } });
                categoriesCreated += 1;
            }
            categoryIds.set(name, category.id);
        }

        const created = await tx.transaction.createMany({
            data: rows.map((row) => ({
                type: row.type,
                amount: row.amount,
                date: row.date,
                note: row.note,
                categoryId: categoryIds.get(row.category),
                userId,
            })),
        });

        return { imported: created.count, categoriesCreated };
    });
}

module.exports = { update, findMany, findById, create, remove, sumExpensesByCategory, sumByCategory, sumByType, findInRange, importWithCategories };
