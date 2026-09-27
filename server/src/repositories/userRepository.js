const prisma = require("../../prisma/db");

function findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
}

function createWithCategories(data, categoryNames) {
    return prisma.user.create({
        data: {
            ...data,
            categories: { create: categoryNames.map((name) => ({ name })) },
        },
    });
}

module.exports = { findByEmail, createWithCategories };
