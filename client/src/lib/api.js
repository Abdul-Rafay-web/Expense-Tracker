const BASE_URL = "/api";

export class ApiError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

function toQuery(params = {}) {
    const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
    return entries.length ? `?${new URLSearchParams(entries)}` : "";
}

async function request(path, { method = "GET", body, contentType } = {}) {
    const headers = {};
    let payload;

    if (body !== undefined) {
        if (typeof body === "string") {
            headers["Content-Type"] = contentType ?? "text/plain";
            payload = body;
        } else {
            headers["Content-Type"] = "application/json";
            payload = JSON.stringify(body);
        }
    }

    let response;
    try {
        response = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload });
    } catch {
        throw new ApiError(0, "Can't reach the ExpenseMate server. Start it with npm run dev inside the server folder.");
    }

    if (response.status === 204) {
        return null;
    }

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        if (!isJson) {
            throw new ApiError(response.status, "Can't reach the ExpenseMate server. Start it with npm run dev inside the server folder.");
        }
        throw new ApiError(response.status, data.error ?? "Something went wrong", data.details);
    }

    return data;
}

export const api = {
    health: () => request("/health"),
    auth: {
        me: async () => {
            try {
                const data = await request("/auth/me");
                return data.user;
            } catch (error) {
                if (error.status === 401) {
                    return null;
                }
                throw error;
            }
        },
        login: (credentials) => request("/auth/login", { method: "POST", body: credentials }).then((data) => data.user),
        signup: (details) => request("/auth/signup", { method: "POST", body: details }).then((data) => data.user),
        demo: () => request("/auth/demo", { method: "POST" }).then((data) => data.user),
        logout: () => request("/auth/logout", { method: "POST" }),
    },
    categories: {
        list: () => request("/categories"),
        create: (name) => request("/categories", { method: "POST", body: { name } }),
        remove: (id) => request(`/categories/${id}`, { method: "DELETE" }),
    },
    transactions: {
        list: (filters) => request(`/transactions${toQuery(filters)}`),
        create: (data) => request("/transactions", { method: "POST", body: data }),
        update: (id, data) => request(`/transactions/${id}`, { method: "PATCH", body: data }),
        remove: (id) => request(`/transactions/${id}`, { method: "DELETE" }),
        importCsv: (csvText) => request("/transactions/import", { method: "POST", body: csvText, contentType: "text/csv" }),
        exportUrl: (filters) => `${BASE_URL}/transactions/export${toQuery(filters)}`,
    },
    budgets: {
        list: (month) => request(`/budgets${toQuery({ month })}`),
        set: (data) => request("/budgets", { method: "PUT", body: data }),
        remove: (id) => request(`/budgets/${id}`, { method: "DELETE" }),
    },
    analytics: {
        summary: (month) => request(`/analytics/summary${toQuery({ month })}`),
        byCategory: (month, type) => request(`/analytics/by-category${toQuery({ month, type })}`),
        trend: (from, to) => request(`/analytics/trend${toQuery({ from, to })}`),
    },
};

export function fieldErrorsFrom(error) {
    if (Array.isArray(error?.details)) {
        const fields = {};
        for (const detail of error.details) {
            if (detail.field && !fields[detail.field]) {
                fields[detail.field] = detail.message;
            }
        }
        if (Object.keys(fields).length > 0) {
            return fields;
        }
    }
    return { form: error?.message ?? "Something went wrong" };
}
