import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import Segmented from "../components/Segmented";
import { useToast } from "../components/Toasts";
import { useMonth } from "./MonthContext";
import { fieldErrorsFrom } from "../lib/api";
import { defaultDateForMonth, formatMoney, isValidRupees, paisaToInput, rupeesToPaisa } from "../lib/format";
import { useCategories, useCreateTransaction, useUpdateTransaction } from "../lib/queries";

const TransactionModalContext = createContext(() => {});

const TYPE_OPTIONS = [
    { value: "EXPENSE", label: "Expense", tone: "expense" },
    { value: "INCOME", label: "Income", tone: "income" },
];

function TransactionForm({ transaction, onDone }) {
    const { month } = useMonth();
    const toast = useToast();
    const { data: categories = [], isLoading: loadingCategories } = useCategories();
    const createTransaction = useCreateTransaction();
    const updateTransaction = useUpdateTransaction();

    const [type, setType] = useState(transaction?.type ?? "EXPENSE");
    const [amount, setAmount] = useState(transaction ? paisaToInput(transaction.amount) : "");
    const [categoryId, setCategoryId] = useState(transaction ? String(transaction.categoryId) : "");
    const [date, setDate] = useState(transaction ? transaction.date.slice(0, 10) : defaultDateForMonth(month));
    const [note, setNote] = useState(transaction?.note ?? "");
    const [errors, setErrors] = useState({});

    const pending = createTransaction.isPending || updateTransaction.isPending;

    function edit(setter, field) {
        return (event) => {
            setter(event.target.value);
            setErrors((current) => (current[field] || current.form ? { ...current, [field]: undefined, form: undefined } : current));
        };
    }

    function validate() {
        const found = {};
        if (!isValidRupees(amount)) {
            found.amount = "Enter an amount like 1500 or 1500.50";
        }
        if (!categoryId) {
            found.categoryId = "Choose a category";
        }
        if (!date) {
            found.date = "Choose a date";
        }
        if (note.trim().length > 200) {
            found.note = "Keep the note under 200 characters";
        }
        return found;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const found = validate();
        setErrors(found);
        if (Object.keys(found).length > 0) {
            return;
        }

        const payload = {
            type,
            amount: rupeesToPaisa(amount),
            categoryId: Number(categoryId),
            date,
            note: note.trim(),
        };

        try {
            if (transaction) {
                await updateTransaction.mutateAsync({ id: transaction.id, data: payload });
                toast.success("Transaction updated");
            } else {
                if (!payload.note) {
                    delete payload.note;
                }
                await createTransaction.mutateAsync(payload);
                toast.success(`${type === "INCOME" ? "Income" : "Expense"} of ${formatMoney(payload.amount)} saved`);
            }
            onDone();
        } catch (error) {
            setErrors(fieldErrorsFrom(error));
        }
    }

    if (!loadingCategories && categories.length === 0) {
        return (
            <div className="modal__body">
                <p className="muted">You need at least one category before adding a transaction.</p>
                <Link to="/categories" className="btn btn--primary" onClick={onDone}>
                    Create a category
                </Link>
            </div>
        );
    }

    return (
        <form className="modal__body form" onSubmit={handleSubmit} noValidate>
            <Segmented name="tx-type" label="Transaction type" options={TYPE_OPTIONS} value={type} onChange={setType} />

            <label className="field">
                <span className="field__label">Amount</span>
                <div className={`amount-input amount-input--${type === "INCOME" ? "income" : "expense"}${errors.amount ? " has-error" : ""}`}>
                    <span className="amount-input__prefix">Rs</span>
                    <input
                        autoFocus
                        inputMode="decimal"
                        placeholder="0"
                        value={amount}
                        onChange={edit(setAmount, "amount")}
                        aria-invalid={Boolean(errors.amount)}
                        aria-describedby={errors.amount ? "amount-error" : undefined}
                    />
                </div>
                {errors.amount && <span id="amount-error" className="field__error">{errors.amount}</span>}
            </label>

            <div className="form__row">
                <label className="field">
                    <span className="field__label">Category</span>
                    <select
                        className={`input${errors.categoryId ? " has-error" : ""}`}
                        value={categoryId}
                        onChange={edit(setCategoryId, "categoryId")}
                        aria-invalid={Boolean(errors.categoryId)}
                    >
                        <option value="">Choose…</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {errors.categoryId && <span className="field__error">{errors.categoryId}</span>}
                </label>

                <label className="field">
                    <span className="field__label">Date</span>
                    <input
                        type="date"
                        className={`input${errors.date ? " has-error" : ""}`}
                        value={date}
                        onChange={edit(setDate, "date")}
                        aria-invalid={Boolean(errors.date)}
                    />
                    {errors.date && <span className="field__error">{errors.date}</span>}
                </label>
            </div>

            <label className="field">
                <span className="field__label">
                    Note <span className="field__optional">optional</span>
                </span>
                <input
                    className={`input${errors.note ? " has-error" : ""}`}
                    placeholder="Groceries, fuel, salary…"
                    maxLength={200}
                    value={note}
                    onChange={edit(setNote, "note")}
                />
                {errors.note && <span className="field__error">{errors.note}</span>}
            </label>

            {errors.form && (
                <p className="form__error" role="alert">
                    {errors.form}
                </p>
            )}

            <div className="form__actions">
                <button type="button" className="btn btn--ghost" onClick={onDone}>
                    Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={pending}>
                    {pending ? "Saving…" : transaction ? "Save changes" : "Add transaction"}
                </button>
            </div>
        </form>
    );
}

export function TransactionModalProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [session, setSession] = useState({ key: 0, transaction: null });

    const openTransaction = useCallback((transaction = null) => {
        setSession((previous) => ({ key: previous.key + 1, transaction }));
        setOpen(true);
    }, []);

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (open) {
            return undefined;
        }
        function handleKey(event) {
            const tag = event.target.tagName;
            const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.target.isContentEditable;
            if (!typing && !event.metaKey && !event.ctrlKey && !event.altKey && event.key.toLowerCase() === "n") {
                event.preventDefault();
                openTransaction();
            }
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, openTransaction]);

    return (
        <TransactionModalContext.Provider value={openTransaction}>
            {children}
            <Modal
                open={open}
                onClose={close}
                title={session.transaction ? "Edit transaction" : "New transaction"}
                subtitle={session.transaction ? "Change anything and save." : "Record money coming in or going out."}
            >
                <TransactionForm key={session.key} transaction={session.transaction} onDone={close} />
            </Modal>
        </TransactionModalContext.Provider>
    );
}

export function useTransactionModal() {
    return useContext(TransactionModalContext);
}
