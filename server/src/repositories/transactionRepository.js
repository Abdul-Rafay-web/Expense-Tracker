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

function importWithCategories(rows) {
    return prisma.$transaction(async (tx) => {
        const categoryIds = new Map();
        let categoriesCreated = 0;

        for (const name of new Set(rows.map((row) => row.category))) {
            let category = await tx.category.findUnique({ where: { name } });
            if (!category) {
                category = await tx.category.create({ data: { name } });
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
            })),
        });

        return { imported: created.count, categoriesCreated };
    });
}

module.exports = { update, findMany, findById, create, remove, sumExpensesByCategory, sumByCategory, sumByType, findInRange, importWithCategories };