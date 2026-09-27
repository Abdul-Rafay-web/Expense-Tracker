const request = require("supertest");

async function signUpAgent(app, { name = "Test User", email = "test@example.com", password = "password123" } = {}) {
    const agent = request.agent(app);
    await agent.post("/api/auth/signup").send({ name, email, password }).expect(201);
    return agent;
}

module.exports = { signUpAgent };
