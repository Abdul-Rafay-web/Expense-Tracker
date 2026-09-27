import { defaultDateForMonth, isValidRupees, paisaToInput, rupeesToPaisa } from "./format";

export const BASE_CURRENCY = "PKR";

export function initialValues(transaction, month) {
    if (!transaction) {
        return { type: "EXPENSE", amount: "", currency: BASE_CURRENCY, categoryId: "", date: defaultDateForMonth(month), note: "" };
    }
    return {
        type: transaction.type,
        amount: paisaToInput(transaction.originalAmount ?? transaction.amount),
        currency: transaction.currency ?? BASE_CURRENCY,
        categoryId: String(transaction.categoryId),
        date: transaction.date.slice(0, 10),
        note: transaction.note ?? "",
    };
}

const RULES = [
    ["amount", (values) => isValidRupees(values.amount), "Enter an amount like 1500 or 1500.50"],
    ["categoryId", (values) => Boolean(values.categoryId), "Choose a category"],
    ["date", (values) => Boolean(values.date), "Choose a date"],
    ["note", (values) => values.note.trim().length <= 200, "Keep the note under 200 characters"],
];

export function validateTransaction(values) {
    const errors = {};
    for (const [field, isValid, message] of RULES) {
        if (!isValid(values)) {
            errors[field] = message;
        }
    }
    return errors;
}

export function toPayload(values, isNew) {
    const payload = {
        type: values.type,
        amount: rupeesToPaisa(values.amount),
        currency: values.currency,
        categoryId: Number(values.categoryId),
        date: values.date,
        note: values.note.trim(),
    };
    if (isNew && !payload.note) {
        delete payload.note;
    }
    return payload;
}

export function convertedPreview(values, currencies) {
    if (values.currency === BASE_CURRENCY || !isValidRupees(values.amount)) {
        return null;
    }
    const rate = currencies.find((currency) => currency.code === values.currency)?.rate;
    return rate ? { amount: Math.round(rupeesToPaisa(values.amount) * rate), rate } : null;
}
