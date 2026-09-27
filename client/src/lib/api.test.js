import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, fieldErrorsFrom } from "./api";

function jsonResponse(status, body) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("request handling", () => {
    it("sends JSON bodies with the right method and header", async () => {
        const fetchMock = vi.fn(async () => jsonResponse(201, { id: 1, name: "Food" }));
        vi.stubGlobal("fetch", fetchMock);

        const result = await api.categories.create("Food");

        expect(result).toEqual({ id: 1, name: "Food" });
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe("/api/categories");
        expect(options.method).toBe("POST");
        expect(options.headers["Content-Type"]).toBe("application/json");
        expect(JSON.parse(options.body)).toEqual({ name: "Food" });
    });

    it("turns an error response into an ApiError with status and details", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(400, {
            error: "Validation failed",
            details: [{ field: "amount", message: "Too small" }],
        })));

        const failure = await api.transactions.create({}).catch((error) => error);

        expect(failure).toBeInstanceOf(ApiError);
        expect(failure.status).toBe(400);
        expect(failure.details).toEqual([{ field: "amount", message: "Too small" }]);
    });

    it("explains how to start the server when the network request fails", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => {
            throw new TypeError("Failed to fetch");
        }));

        const failure = await api.categories.list().catch((error) => error);

        expect(failure.status).toBe(0);
        expect(failure.message).toMatch(/npm run dev/);
    });

    it("returns null for 204 No Content", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })));

        expect(await api.transactions.remove(5)).toBeNull();
    });

    it("treats a 401 from /auth/me as logged out instead of an error", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(401, { error: "Please log in to continue" })));

        expect(await api.auth.me()).toBeNull();
    });

    it("sends CSV text with the text/csv content type", async () => {
        const fetchMock = vi.fn(async () => jsonResponse(201, { imported: 1, categoriesCreated: 0 }));
        vi.stubGlobal("fetch", fetchMock);

        await api.transactions.importCsv("date,type,category,amount,note");

        const [, options] = fetchMock.mock.calls[0];
        expect(options.headers["Content-Type"]).toBe("text/csv");
        expect(options.body).toBe("date,type,category,amount,note");
    });
});

describe("exportUrl", () => {
    it("builds the query string and skips empty filters", () => {
        expect(api.transactions.exportUrl({ month: "2026-09", type: undefined })).toBe("/api/transactions/export?month=2026-09");
        expect(api.transactions.exportUrl({})).toBe("/api/transactions/export");
    });
});

describe("fieldErrorsFrom", () => {
    it("maps validation details to the first message for each field", () => {
        const error = new ApiError(400, "Validation failed", [
            { field: "email", message: "Enter a valid email address" },
            { field: "email", message: "Email is too long" },
            { field: "password", message: "Use at least 8 characters" },
        ]);

        expect(fieldErrorsFrom(error)).toEqual({
            email: "Enter a valid email address",
            password: "Use at least 8 characters",
        });
    });

    it("falls back to a form-level message when there are no field details", () => {
        expect(fieldErrorsFrom(new ApiError(401, "Email or password is incorrect"))).toEqual({ form: "Email or password is incorrect" });
        expect(fieldErrorsFrom(undefined)).toEqual({ form: "Something went wrong" });
    });
});
