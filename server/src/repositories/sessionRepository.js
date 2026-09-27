const prisma = require("../../prisma/db");

function create(data) {
    return prisma.session.create({ data });
}

function findByTokenHash(tokenHash) {
    return prisma.session.findUnique({ where: { tokenHash }, include: { user: true } });
}

function removeByTokenHash(tokenHash) {
    return prisma.session.deleteMany({ where: { tokenHash } });
}

function removeExpired(userId) {
    return prisma.session.deleteMany({ where: { userId, expiresAt: { lte: new Date() } } });
}

module.exports = { create, findByTokenHash, removeByTokenHash, removeExpired };
