const crypto = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const derived = await scrypt(password, salt, KEY_LENGTH);
    return `${salt}:${derived.toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
    const [salt, key] = String(storedHash).split(":");
    if (!salt || !key) {
        return false;
    }
    const derived = await scrypt(password, salt, KEY_LENGTH);
    const expected = Buffer.from(key, "hex");
    return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}

function createSessionToken() {
    return crypto.randomBytes(32).toString("base64url");
}

function hashSessionToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { hashPassword, verifyPassword, createSessionToken, hashSessionToken };
