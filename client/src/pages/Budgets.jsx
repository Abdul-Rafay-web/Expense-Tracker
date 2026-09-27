import { useEffect, useState } from "react";
import { useConfirm } from "../hooks/useConfirm";
import { AnimatePresence, motion } from "motion/react";
import { PiggyBank, Trash2, TriangleAlert } from "lucide-react";
import Page from "../components/Page";
import Card from "../components/Card";
import AnimatedNumber from "../components/AnimatedNumber";
import CategoryAvatar from "../components/CategoryAvatar";
import { useToast } from "../components/Toasts";
import { EmptyState, ErrorNotice, Skeleton } from "../components/Feedback";
import { useMonth } from "../context/MonthContext";
import { fieldErrorsFrom } from "../lib/api";
import { formatMoney, isValidRupees, monthLabel, monthName, paisaToInput, rupeesToPaisa } from "../lib/format";
import { useBudgets, useCategories, useDeleteBudget, useSetBudget } from "../lib/queries";
import { EASE_OUT } from "../lib/motion";

const STATUS = {
    OK: { label: "On track", tone: "ok" },
    WARNING: { label: "Close to limit", tone: "warning" },
    EXCEEDED: { label: "Over budget", tone: "exceeded" },
};

function BudgetForm({ month, budgets }) {
    const toast = useToast();
    const { data: categories = [] } = useCategories();
    const setBudget = useSetBudget();
    const [categoryId, setCategoryId] = useState("");
    const [limit, setLimit] = useState("");
    const [errors, setErrors] = useState({});

    const existing = budgets.find((budget) => String(budget.categoryId) === categoryId);

    useEffect(() => {
        if (existing) {
            setLimit(paisaToInput(existing.limitAmount));
        }
    }, [existing]);

    async function handleSubmit(event) {
        event.preventDefault();
        const found = {};
        if (!categoryId) {
            found.categoryId = "Choose a category";
        }
        if (!isValidRupees(limit)) {
            found.limitAmount = "Enter a limit like 5000 or 5000.50";
        }
        setErrors(found);
        if (Object.keys(found).length > 0) {
            return;
        }
        try {
            await setBudget.mutateAsync({ categoryId: Number(categoryId), month, limitAmount: rupeesToPaisa(limit) });
            toast.success(existing ? "Budget updated" : "Budget created");
            setCategoryId("");
            setLimit("");
        } catch (error) {
            setErrors(fieldErrorsFrom(error));
        }
    }

    return (
        <Card className="span-4 budget-form">
            <p className="eyebrow">Set a limit</p>
            <h3 className="card__title">
                Budget for <em>{monthName(month)}</em>
            </h3>
            <form className="form" onSubmit={handleSubmit} noValidate>
                <label className="field">
                    <span className="field__label">Category</span>
                    <select className={`input${errors.categoryId ? " has-error" : ""}`} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
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
                    <span className="field__label">Monthly limit</span>
                    <div className={`amount-input amount-input--compact${errors.limitAmount ? " has-error" : ""}`}>
                        <span className="amount-input__prefix">Rs</span>
                        <input inputMode="decimal" placeholder="0" value={limit} onChange={(event) => setLimit(event.target.value)} />
                    </div>
                    {errors.limitAmount && <span className="field__error">{errors.limitAmount}</span>}
                </label>
                {errors.form && <p className="form__error">{errors.form}</p>}
                <button type="submit" className="btn btn--primary btn--block" disabled={setBudget.isPending}>
                    {setBudget.isPending ? "Saving…" : existing ? "Update budget" : "Set budget"}
                </button>
                <p className="muted small">You'll get a warning at 80% and an alert when you go over.</p>
            </form>
        </Card>
    );
}

function BudgetCard({ budget, index }) {
    const toast = useToast();
    const deleteBudget = useDeleteBudget();
    const [confirming, setConfirming] = useConfirm();
    const status = STATUS[budget.status];
    const fill = Math.min(budget.percentUsed, 100) / 100;

    async function handleDelete() {
        if (!confirming) {
            setConfirming(true);
            return;
        }
        try {
            await deleteBudget.mutateAsync(budget.id);
            toast.success(`Budget for ${budget.category.name} removed`);
        } catch (error) {
            toast.error(error.message);
        }
    }

    return (
        <motion.article
            layout
            className={`budget budget--${status.tone}`}
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)", transition: { duration: 0.25 } }}
            transition={{ duration: 0.7, delay: index * 0.06, ease: EASE_OUT }}
        >
            <header className="budget__head">
                <CategoryAvatar category={budget.category} size={36} />
                <div className="budget__title">
                    <span className="budget__name">{budget.category.name}</span>
                    <span className={`chip chip--${status.tone}`}>
                        {budget.status !== "OK" && <TriangleAlert size={12} />}
                        {status.label}
                    </span>
                </div>
                <button
                    type="button"
                    className={`icon-btn icon-btn--sm${confirming ? " icon-btn--danger is-confirming" : ""}`}
                    aria-label={confirming ? "Click again to remove budget" : `Remove budget for ${budget.category.name}`}
                    onClick={handleDelete}
                >
                    <Trash2 size={15} />
                    {confirming && <span className="icon-btn__confirm">Remove?</span>}
                </button>
            </header>

            <div className="budget__figure">
                <span className="budget__spent">
                    <AnimatedNumber value={budget.spent} format={formatMoney} />
                </span>
                <span className="muted">of {formatMoney(budget.limitAmount)}</span>
            </div>

            <div className="meter meter--lg">
                <motion.div
                    className={`meter__fill meter__fill--${status.tone}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: fill }}
                    transition={{ duration: 1.3, delay: 0.2 + index * 0.06, ease: EASE_OUT }}
                />
                <span className="meter__mark" style={{ left: "80%" }} aria-hidden="true" />
            </div>

            <footer className="budget__foot">
                <span className="tabular">{budget.percentUsed}% used</span>
                <span className={budget.remaining < 0 ? "is-expense" : "muted"}>
                    {budget.remaining < 0 ? `${formatMoney(-budget.remaining)} over` : `${formatMoney(budget.remaining)} left`}
                </span>
            </footer>
        </motion.article>
    );
}

export default function Budgets() {
    const { month } = useMonth();
    const { data: budgets = [], isLoading, isError, error } = useBudgets(month);

    const totalLimit = budgets.reduce((sum, budget) => sum + budget.limitAmount, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const alerts = budgets.filter((budget) => budget.status !== "OK").length;
    const overall = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    return (
        <Page>
            <div className="grid">
                <BudgetForm month={month} budgets={budgets} />

                <Card className="span-8 budget-overview">
                    <p className="eyebrow">{monthLabel(month)}</p>
                    <div className="budget-overview__figures">
                        <div>
                            <span className="budget-overview__label">Budgeted</span>
                            <span className="budget-overview__value">
                                <AnimatedNumber value={totalLimit} format={formatMoney} />
                            </span>
                        </div>
                        <div>
                            <span className="budget-overview__label">Spent against budgets</span>
                            <span className="budget-overview__value">
                                <AnimatedNumber value={totalSpent} format={formatMoney} />
                            </span>
                        </div>
                        <div>
                            <span className="budget-overview__label">Alerts</span>
                            <span className={`budget-overview__value${alerts ? " is-expense" : ""}`}>{alerts}</span>
                        </div>
                    </div>
                    <div className="meter meter--xl">
                        <motion.div
                            className={`meter__fill meter__fill--${overall > 100 ? "exceeded" : overall >= 80 ? "warning" : "ok"}`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: Math.min(overall, 100) / 100 }}
                            transition={{ duration: 1.5, ease: EASE_OUT }}
                        />
                    </div>
                    <p className="muted small">{totalLimit > 0 ? `${overall}% of your total budget is used.` : "No budgets set for this month yet."}</p>
                </Card>

                <div className="span-12">
                    {isError && <ErrorNotice error={error} />}
                    {isLoading && (
                        <div className="budget-grid">
                            {[0, 1, 2].map((key) => (
                                <Skeleton key={key} height={190} radius={22} />
                            ))}
                        </div>
                    )}
                    {!isLoading && !isError && budgets.length === 0 && (
                        <Card>
                            <EmptyState
                                icon={PiggyBank}
                                title={`No budgets for ${monthName(month)}`}
                                text="Pick a category on the left and give it a monthly limit."
                            />
                        </Card>
                    )}
                    <div className="budget-grid">
                        <AnimatePresence>
                            {budgets.map((budget, index) => (
                                <BudgetCard key={budget.id} budget={budget} index={index} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </Page>
    );
}
