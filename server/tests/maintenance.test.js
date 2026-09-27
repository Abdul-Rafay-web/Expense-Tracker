const request = require("supertest");
const { toBaseAmount, listCurrencies, BASE_CURRENCY } = require("../src/utils/currency");
const { prisma, resetDatabase } = require("./helpers/db");

describe("currency conversion", () => {
    it("converts minor units into PKR paisa at the reference rate", () => {
        expect(toBaseAmount(10000, "USD")).toBe(2800000);
        expect(toBaseAmount(150050, BASE_CURRENCY)).toBe(150050);
    });

    it("lists every supported currency with its rate", () => {
        expect(listCurrencies().map((c) => c.code)).toEqual(["PKR", "USD", "EUR", "GBP", "AED", "SAR"]);
    });
});

describe("rate limiting behind a proxy", () => {
    const saved = { TRUST_PROXY: process.env.TRUST_PROXY, NODE_ENV: process.env.NODE_ENV };

    beforeAll(async () => {
        await resetDatabase();
    });

    afterAll(async () => {
        process.env.TRUST_PROXY = saved.TRUST_PROXY ?? "";
        process.env.NODE_ENV = saved.NODE_ENV;
        await prisma.$disconnect();
    });

    it("limits each client separately when TRUST_PROXY is set", async () => {
        let app;
        jest.isolateModules(() => {
            process.env.TRUST_PROXY = "1";
            process.env.NODE_ENV = "development";
            app = require("../src/app");
        });

        const attempt = (ip) =>
            request(app).post("/api/auth/login").set("X-Forwarded-For", ip).send({ email: "nobody@example.com", password: "wrong" });

        let last;
        for (let i = 0; i < 21; i++) {
            last = await attempt("203.0.113.10");
        }
        const otherClient = await attempt("203.0.113.20");

        expect(app.get("trust proxy")).toBe(1);
        expect(last.status).toBe(429);
        expect(otherClient.status).toBe(401);
    });
});
