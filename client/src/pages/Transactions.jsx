import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, FileWarning, Search, Sparkles, Upload } from "lucide-react";
import Page from "../components/Page";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Segmented from "../components/Segmented";
import TransactionRow from "../components/TransactionRow";
import { useToast } from "../components/Toasts";
import { EmptyState, ErrorNotice, SkeletonRows } from "../components/Feedback";
import { useMonth } from "../context/MonthContext";
import { useTransactionModal } from "../context/TransactionModalContext";
import { api } from "../lib/api";
import { formatDay, formatMoney, monthName, plural } from "../lib/format";
import { useDeleteTransaction, useImportCsv, useTransactions } from "../lib/queries";
import { EASE_OUT } from "../lib/motion";

const TYPE_OPTIONS = [
    { value: "ALL", label: "All" },
    { value: "INCOME", label: "Income", tone: "income" },
    { value: "EXPENSE", label: "Expenses", tone: "expense" },
];

function groupByDay(transactions) {
    const groups = new Map();
    for (const transaction of transactions) {
        const day = transaction.date.slice(0, 10);
        if (!groups.has(day)) {
            groups.set(day, []);
        }
        groups.get(day).push(transaction);
    }
    return [...groups.entries()];
}

export default function Transactions() {
    const { month } = useMonth();
    const toast = useToast();
    const openTransaction = useTransactionModal();
    const [type, setType] = useState("ALL");
    const [search, setSearch] = useState("");
    const [importErrors, setImportErrors] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const fileInput = useRef(null);

    const filters = { month, type: type === "ALL" ? undefined : type };
    const { data = [], isLoading, isError, error, isFetching } = useTransactions(filters);
    const deleteTransaction = useDeleteTransaction();
    const importCsv = useImportCsv();

    const visible = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return data;
        }
        return data.filter(
            (transaction) =>
                transaction.category.name.toLowerCase().includes(query) || (transaction.note ?? "").toLowerCase().includes(query)
        );
    }, [data, search]);

    const groups = useMemo(() => groupByDay(visible), [visible]);
    const totals = useMemo(
        () =>
            visible.reduce(
                (sum, transaction) => {
                    if (transaction.type === "INCOME") {
                        sum.income += transaction.amount;
                    } else {
                        sum.expenses += transaction.amount;
                    }
                    return sum;
                },
                { income: 0, expenses: 0 }
            ),
        [visible]
    );

    async function handleDelete(transaction) {
        setDeletingId(transaction.id);
        try {
            await deleteTransaction.mutateAsync(transaction.id);
            toast.success("Transaction deleted");
        } catch (deleteError) {
            toast.error(deleteError.message);
        } finally {
            setDeletingId(null);
        }
    }

    async function handleFile(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) {
            return;
        }
        try {
            const text = await file.text();
            const result = await importCsv.mutateAsync(text);
            const created = result.categoriesCreated > 0 ? ` and ${plural(result.categoriesCreated, "new category", "new categories")}` : "";
            toast.success(`Imported ${plural(result.imported, "transaction", "transactions")}${created}`);
        } catch (importError) {
            if (Array.isArray(importError.details) && importError.details.some((detail) => detail.line)) {
                setImportErrors({ message: importError.message, rows: importError.details });
            } else {
                toast.error(importError.message);
            }
        }
    }

    return (
        <Page>
            <div className="grid">
                <Card className="span-12 toolbar">
                    <Segmented name="tx-filter" label="Filter by type" options={TYPE_OPTIONS} value={type} onChange={setType} />
                    <label className="search">
                        <Search size={16} aria-hidden="true" />
                        <input
                            type="search"
                            placeholder="Search notes or categories"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            aria-label="Search transactions"
                        />
                    </label>
                    <div className="toolbar__actions">
                        <input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={handleFile} />
                        <button type="button" className="btn btn--ghost" onClick={() => fileInput.current?.click()} disabled={importCsv.isPending}>
                            <Upload size={16} />
                            <span>{importCsv.isPending ? "Importing…" : "Import CSV"}</span>
                        </button>
                        <a className="btn btn--ghost" href={api.transactions.exportUrl(filters)} download>
                            <Download size={16} />
                            <span>Export CSV</span>
                        </a>
                    </div>
                </Card>

                <Card className="span-4 totals">
                    <p className="eyebrow">{monthName(month)} in</p>
                    <p className="totals__value is-income">{formatMoney(totals.income, { sign: true })}</p>
                </Card>
                <Card className="span-4 totals">
                    <p className="eyebrow">{monthName(month)} out</p>
                    <p className="totals__value is-expense">{formatMoney(-totals.expenses, { sign: true })}</p>
                </Card>
                <Card className="span-4 totals">
                    <p className="eyebrow">Shown</p>
                    <p className="totals__value">{plural(visible.length, "entry", "entries")}</p>
                </Card>

                <Card className={`span-12 ledger${isFetching && !isLoading ? " is-refreshing" : ""}`}>
                    {isError && <ErrorNotice error={error} />}
                    {isLoading && <SkeletonRows rows={6} />}
                    {!isLoading && !isError && visible.length === 0 && (
                        <EmptyState
                            icon={Sparkles}
                            title={search ? "No matches" : `No transactions in ${monthName(month)}`}
                            text={search ? "Try a different word, or clear the search." : "Add one by hand or import a CSV file."}
                            action={
                                !search && (
                                    <button type="button" className="btn btn--primary btn--sm" onClick={() => openTransaction()}>
                                        Add transaction
                                    </button>
                                )
                            }
                        />
                    )}
                    <AnimatePresence initial={false}>
                        {groups.map(([day, items]) => (
                            <motion.section
                                key={day}
                                className="day"
                                layout="position"
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: EASE_OUT }}
                            >
                                <h3 className="day__title">{formatDay(day)}</h3>
                                <ul className="tx-list">
                                    <AnimatePresence initial={false}>
                                        {items.map((transaction) => (
                                            <TransactionRow
                                                key={transaction.id}
                                                transaction={transaction}
                                                onEdit={openTransaction}
                                                onDelete={handleDelete}
                                                deleting={deletingId === transaction.id}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </ul>
                            </motion.section>
                        ))}
                    </AnimatePresence>
                </Card>
            </div>

            <Modal
                open={Boolean(importErrors)}
                onClose={() => setImportErrors(null)}
                title="Import stopped"
                subtitle="Nothing was saved. Fix these lines in your file and import it again."
            >
                <div className="modal__body">
                    <ul className="import-errors">
                        {importErrors?.rows.map((row) => (
                            <li key={row.line}>
                                <span className="import-errors__line">
                                    <FileWarning size={14} /> Line {row.line}
                                </span>
                                <span>{row.problem}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="muted small">
                        Expected columns: <code>date,type,category,amount,note</code> — dates like <code>2026-09-15</code>, amounts in rupees like <code>1500.50</code>.
                    </p>
                    <div className="form__actions">
                        <button type="button" className="btn btn--primary" onClick={() => setImportErrors(null)}>
                            Got it
                        </button>
                    </div>
                </div>
            </Modal>
        </Page>
    );
}
