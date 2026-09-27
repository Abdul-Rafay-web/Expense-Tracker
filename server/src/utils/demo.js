const DEMO_EMAIL = "demo@expensemate.app";

function isDemoLoginEnabled() {
    return process.env.ENABLE_DEMO_LOGIN === "true" && process.env.NODE_ENV !== "production";
}

module.exports = { DEMO_EMAIL, isDemoLoginEnabled };
