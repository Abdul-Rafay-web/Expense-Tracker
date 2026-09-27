import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import Segmented from "../components/Segmented";
import { useToast } from "../components/Toasts";
import { useMonth } from "./MonthContext";
import FieldError, { withError } from "../components/FieldError";
import { fieldErrorsFrom } from "../lib/api";
import { formatMoney } from "../lib/format";
import { convertedPreview, initialValues, toPayload, validateTransaction } from "../lib/transactionForm";
import { useCategories, useCreateTransaction, useCurrencies, useUpdateTransaction } from "../lib/queries";

const TransactionModalContext = createContext(() => {});

const TYPE_OPTIONS = [
    { value: "EXPENSE", label: "Expense", tone: "expense" },
    { value: "INCOME", label: "Income", tone: "income" },
];

function TransactionForm({ transaction, onDone }) {
    const { month } = useMonth();
    const toast = useToast();
    const { data: categories = [], isLoading: loadingCategories } = useCategories();
    const { data: currencies = [] } = useCurrencies();
    const createTransaction = useCreateTransaction();
    const updateTransaction = useUpdateTransaction();
    const [values, setValues] = useState(() => initialValues(transaction, month));
    const [errors, setErrors] = useState({});

    const pending = createTransaction.isPending || updateTransaction.isPending;
    const preview = convertedPreview(values, currencies);
    const currencyOptions = currencies.length > 0 ? currencies : [{ code: values.currency }];

    function set(field) {
        return (input) => {
            const value = input?.target ? input.target.value : input;
            setValues((current) => ({ ...current, [field]: value }));
            setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
        };
    }

    async function save(payload) {
        if (transaction) {
            await updateTransaction.mutateAsync({ id: transaction.id, data: payload });
            toast.success("Transaction updated");
            return;
        }
        const saved = await createTransaction.mutateAsync(payload);
        toast.success(`${values.type === "INCOME" ? "Income" : "Expense"} of ${formatMoney(saved.amount)} saved`);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const found = validateTransaction(values);
        setErrors(found);
        if (Object.keys(found).length > 0) {
            return;
        }
        try {
            await save(toPayload(values, !transaction));
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
            <Segmented name="tx-type" label="Transaction type" options={TYPE_OPTIONS} value={values.type} onChange={set("type")} />

            <label className="field">
                <span className="field__label">Amount</span>
                <div className={withError(`amount-input amount-input--${values.type.toLowerCase()}`, errors.amount)}>
                    <select className="amount-input__currency" value={values.currency} onChange={set("currency")} aria-label="Currency">
                        {currencyOptions.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                                {currency.code}
                            </option>
                        ))}
                    </select>
                    <input
                        autoFocus
                        inputMode="decimal"
                        placeholder="0"
                        value={values.amount}
                        onChange={set("amount")}
                        aria-invalid={Boolean(errors.amount)}
                        aria-describedby="amount-error"
                    />
                </div>
                <FieldError id="amount-error" message={errors.amount} />
                {preview && (
                    <span className="field__hint">
                        ≈ {formatMoney(preview.amount)} at 1 {values.currency} = Rs {preview.rate}
                    </span>
                )}
            </label>

            <div className="form__row">
                <label className="field">
                    <span className="field__label">Category</span>
                    <select className={withError("input", errors.categoryId)} value={values.categoryId} onChange={set("categoryId")} aria-invalid={Boolean(errors.categoryId)}>
                        <option value="">Choose…</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <FieldError message={errors.categoryId} />
                </label>

                <label className="field">
                    <span className="field__label">Date</span>
                    <input type="date" className={withError("input", errors.date)} value={values.date} onChange={set("date")} aria-invalid={Boolean(errors.date)} />
                    <FieldError message={errors.date} />
                </label>
            </div>

            <label className="field">
                <span className="field__label">
                    Note <span className="field__optional">optional</span>
                </span>
                <input className={withError("input", errors.note)} placeholder="Groceries, fuel, salary…" maxLength={200} value={values.note} onChange={set("note")} />
                <FieldError message={errors.note} />
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
