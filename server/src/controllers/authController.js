const authService = require("../services/authService");
const { signupSchema, loginSchema } = require("../validators/authValidator");
const { SESSION_COOKIE } = require("../middleware/requireAuth");
const { isDemoLoginEnabled } = require("../utils/demo");
const { AppError } = require("../errors");

function cookieOptions() {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    };
}

async function signup(req, res) {
    const data = signupSchema.parse(req.body);
    const { user, token, expiresAt } = await authService.signup(data);
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), expires: expiresAt });
    res.status(201).json({ user });
}

async function login(req, res) {
    const data = loginSchema.parse(req.body);
    const { user, token, expiresAt } = await authService.login(data);
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), expires: expiresAt });
    res.json({ user });
}

async function demoLogin(req, res) {
    if (!isDemoLoginEnabled()) {
        throw new AppError(404, "Demo login is not available");
    }
    const { user, token, expiresAt } = await authService.loginDemo();
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), expires: expiresAt });
    res.json({ user });
}

async function logout(req, res) {
    await authService.logout(req.cookies?.[SESSION_COOKIE]);
    res.clearCookie(SESSION_COOKIE, cookieOptions());
    res.status(204).end();
}

async function me(req, res) {
    res.json({ user: req.user });
}

module.exports = { signup, login, demoLogin, logout, me };
