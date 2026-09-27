import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

function refreshMoney(queryClient) {
    return Promise.all(
        ["transactions", "analytics", "budgets"].map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
    );
}

function resetUserData(queryClient, user) {
    queryClient.removeQueries({ predicate: (query) => !["me", "health"].includes(query.queryKey[0]) });
    queryClient.setQueryData(["me"], user);
}

export function useMe() {
    return useQuery({
        queryKey: ["me"],
        queryFn: api.auth.me,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}

export function useLogin() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: api.auth.login, onSuccess: (user) => resetUserData(queryClient, user) });
}

export function useSignup() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: api.auth.signup, onSuccess: (user) => resetUserData(queryClient, user) });
}

export function useLogout() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: api.auth.logout, onSettled: () => resetUserData(queryClient, null) });
}

export function useHealth() {
    return useQuery({
        queryKey: ["health"],
        queryFn: api.health,
        refetchInterval: 8000,
        retry: false,
        staleTime: 0,
    });
}

export function useCategories() {
    return useQuery({ queryKey: ["categories"], queryFn: api.categories.list });
}

export function useTransactions(filters) {
    return useQuery({
        queryKey: ["transactions", filters],
        queryFn: () => api.transactions.list(filters),
        placeholderData: keepPreviousData,
    });
}

export function useSummary(month) {
    return useQuery({
        queryKey: ["analytics", "summary", month],
        queryFn: () => api.analytics.summary(month),
        placeholderData: keepPreviousData,
    });
}

export function useBreakdown(month, type = "EXPENSE") {
    return useQuery({
        queryKey: ["analytics", "by-category", month, type],
        queryFn: () => api.analytics.byCategory(month, type),
        placeholderData: keepPreviousData,
    });
}

export function useTrend(from, to) {
    return useQuery({
        queryKey: ["analytics", "trend", from, to],
        queryFn: () => api.analytics.trend(from, to),
        placeholderData: keepPreviousData,
    });
}

export function useBudgets(month) {
    return useQuery({
        queryKey: ["budgets", month],
        queryFn: () => api.budgets.list(month),
        placeholderData: keepPreviousData,
    });
}

export function useCreateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: api.transactions.create, onSuccess: () => refreshMoney(queryClient) });
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => api.transactions.update(id, data),
        onSuccess: () => refreshMoney(queryClient),
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: api.transactions.remove, onSuccess: () => refreshMoney(queryClient) });
}

export function useImportCsv() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.transactions.importCsv,
        onSuccess: () =>
            Promise.all([refreshMoney(queryClient), queryClient.invalidateQueries({ queryKey: ["categories"] })]),
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.categories.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.categories.remove,
        onSuccess: () =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["categories"] }),
                queryClient.invalidateQueries({ queryKey: ["budgets"] }),
            ]),
    });
}

export function useSetBudget() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.budgets.set,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
    });
}

export function useDeleteBudget() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.budgets.remove,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
    });
}
