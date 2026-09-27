const userRepository = require("../repositories/userRepository");
const sessionRepository = require("../repositories/sessionRepository");
const { hashPassword, verifyPassword, createSessionToken, hashSessionToken } = require("../utils/security");
const { AppError } = require("../errors");
const { DEMO_EMAIL } = require("../utils/demo");

const SESSION_DAYS = 30;
const DEFAULT_CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Entertainment", "Health", "Salary", "Freelance"];

let dummyHash;

function publicUser(user) {
    return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

async function startSession(userId) {
    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    await sessionRepository.create({ tokenHash: hashSessionToken(token), userId, expiresAt });
    return { token, expiresAt };
}

async function signup({ name, email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
        throw new AppError(409, "An account with this email already exists", [
            { field: "email", message: "This email is already registered. Try logging in instead." },
        ]);
    }
    const passwordHash = await hashPassword(password);
    const user = await userRepository.createWithCategories({ name, email, passwordHash }, DEFAULT_CATEGORIES);
    const session = await startSession(user.id);
    return { user: publicUser(user), ...session };
}

async function login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    dummyHash ??= await hashPassword("expensemate-placeholder-password");
    const valid = await verifyPassword(password, user ? user.passwordHash : dummyHash);
    if (!user || !valid) {
        throw new AppError(401, "Email or password is incorrect");
    }
    await sessionRepository.removeExpired(user.id);
    const session = await startSession(user.id);
    return { user: publicUser(user), ...session };
}

async function loginDemo() {
    const user = await userRepository.findByEmail(DEMO_EMAIL);
    if (!user) {
        throw new AppError(404, "The demo account doesn't exist yet. Run npm run db:reset in the server folder to create it.");
    }
    const session = await startSession(user.id);
    return { user: publicUser(user), ...session };
}

async function logout(token) {
    if (token) {
        await sessionRepository.removeByTokenHash(hashSessionToken(token));
    }
}

async function authenticate(token) {
    if (!token) {
        return null;
    }
    const tokenHash = hashSessionToken(token);
    const session = await sessionRepository.findByTokenHash(tokenHash);
    if (!session) {
        return null;
    }
    if (session.expiresAt <= new Date()) {
        await sessionRepository.removeByTokenHash(tokenHash);
        return null;
    }
    return publicUser(session.user);
}

module.exports = { signup, login, loginDemo, logout, authenticate, DEFAULT_CATEGORIES };
