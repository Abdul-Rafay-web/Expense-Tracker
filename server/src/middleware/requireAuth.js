const authService = require("../services/authService");
const { AppError } = require("../errors");

const SESSION_COOKIE = "em_session";

async function requireAuth(req, res, next) {
    const user = await authService.authenticate(req.cookies?.[SESSION_COOKIE]);
    if (!user) {
        throw new AppError(401, "Please log in to continue");
    }
    req.user = user;
    next();
}

module.exports = { requireAuth, SESSION_COOKIE };
