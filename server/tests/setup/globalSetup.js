const { execSync } = require("child_process");

module.exports = async () => {
    execSync("npx prisma migrate deploy", {
        env: { ...process.env, DATABASE_URL: "file:./test.db" },
        stdio: "ignore",
    });
};