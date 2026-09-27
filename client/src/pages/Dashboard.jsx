import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowDownRight, ArrowUpRight, PiggyBank, Sparkles, TriangleAlert } from "lucide-react";
import Page from "../components/Page";
import Card from "../components/Card";
import AnimatedNumber from "../components/AnimatedNumber";
import TrendChart from "../components/TrendChart";
import CategoryDonut from "../components/CategoryDonut";
import TransactionRow from "../components/TransactionRow";
import { EmptyState, ErrorNotice, Skeleton, SkeletonRows } from "../components/Feedback";
import { useMonth } from "../context/MonthContext";
import { useTransactionModal } from "../context/TransactionModalContext";
import { formatMoney, monthLabel, monthName, shiftMonth } from "../lib/format";
import { useBreakdown, useBudgets, useSummary, useTransactions, useTrend } from "../lib/queries";
import { EASE_OUT } from "../lib/motion";

const STATUS_LABEL = { OK: "On track", WARNING: "Close to limit", EXCEEDED: "Over budget" };

function heroCaption(summary, month) {
    const { totalIncome, totalExpenses, balance } = summary;
    if (totalIncome === 0 && totalExpenses === 0) {
        return `Nothing recorded for ${monthName(month)} yet. Add a transaction and watch this page come alive.`;
    }
    if (totalIncome === 0) {
        return `You spent ${formatMoney(totalExpenses)} in ${monthName(month)} with no income recorded.`;
    }
    if (balance >= 0) {
        return `You kept ${Math.round((balance / totalIncome) * 100)}% of everything you earned in ${monthName(month)}.`;
    }
    return `You spent ${formatMoney(-balance)} more than you earned in ${monthName(month)}.`;
}

function Hero({ month }) {
    const { data: summary, isLoading, isError, error } = useSummary(month);

    if (isError) {
        return (
            <Card className="hero span-7">
                <ErrorNotice error={error} />
            </Card>
        );
    }

    if (isLoading || !summary) {
        return (
            <Card className="hero span-7">
                <Skeleton width={160} height={12} />
                <Skeleton width="70%" height={80} radius={18} className="hero__skeleton" />
                <Skeleton width="85%" height={14} />
            </Card>
        );
    }

    const { totalIncome, totalExpenses, balance } = summary;
    const spentShare = totalIncome > 0 ? Math.min(totalExpenses / totalIncome, 1) : totalExpenses > 0 ? 1 : 0;

    return (
        <Card className="hero span-7">
            <div className="hero__top">
                <p className="eyebrow">Net balance · {monthLabel(month)}</p>
                <span className={`hero__badge ${balance >= 0 ? "is-positive" : "is-negative"}`}>
                    {balance >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {balance >= 0 ? "Surplus" : "Deficit"}
                </span>
            </div>

            <h2 className={`hero__value ${balance < 0 ? "is-negative" : ""}`}>
                <AnimatedNumber value={balance} format={formatMoney} duration={1.8} />
            </h2>
            <p className="hero__caption">{heroCaption(summary, month)}</p>

            <div className="flow" aria-hidden="true">
                <motion.div
                    className="flow__spent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: spentShare }}
                    transition={{ duration: 1.6, ease: EASE_OUT, delay: 0.2 }}
                />
            </div>

            <div className="hero__stats">
                <div className="stat stat--income">
                    <span className="stat__label">
                        <ArrowUpRight size={14} /> Income
                    </span>
                    <span className="stat__value">
                        <AnimatedNumber value={totalIncome} format={formatMoney} />
                    </span>
                </div>
                <div className="stat stat--expense">
                    <span className="stat__label">
                        <ArrowDownRight size={14} /> Expenses
                    </span>
                    <span className="stat__value">
                        <AnimatedNumber value={totalExpenses} format={formatMoney} />
                    </span>
                </div>
                <div className="stat">
                    <span className="stat__label">
                        <Sparkles size={14} /> Saved
                    </span>
                    <span className="stat__value">
                        {totalIncome > 0 ? `${Math.max(Math.round((balance / totalIncome) * 100), 0)}%` : "—"}
                    </span>
                </div>
            </div>
        </Card>
    );
}

function BudgetPulse({ month }) {
    const { data: budgets = [], isLoading, isError, error } = useBudgets(month);
    const sorted = [...budgets].sort((a, b) => b.percentUsed - a.percentUsed).slice(0, 4);
    const alerts = budgets.filter((budget) => budget.status !== "OK").length;

    return (
        <Card className="span-5 pulse">
            <div className="card__head">
                <div>
                    <p className="eyebrow">Budget pulse</p>
                    <h3 className="card__title">
                        {alerts > 0 ? (
                            <>
                                {alerts} {alerts === 1 ? "budget needs" : "budgets need"} <em>attention</em>
                            </>
                        ) : (
                            <>
                                Everything <em>on track</em>
                            </>
                        )}
                    </h3>
                </div>
                <Link to="/budgets" className="link-arrow">
                    Budgets <ArrowRight size={14} />
                </Link>
            </div>

            {isError && <ErrorNotice error={error} />}
            {isLoading && <SkeletonRows rows={3} />}
            {!isLoading && !isError && budgets.length === 0 && (
                <EmptyState
                    icon={PiggyBank}
                    title="No budgets this month"
                    text={`Set a limit for ${monthName(month)} and ExpenseMate will warn you at 80%.`}
                    action={
                        <Link to="/budgets" className="btn btn--ghost btn--sm">
                            Set a budget
                        </Link>
                    }
                />
            )}

            <ul className="pulse__list">
                {sorted.map((budget, index) => (
                    <motion.li
                        key={budget.id}
                        className="pulse__item"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + index * 0.08, duration: 0.6, ease: EASE_OUT }}
                    >
                        <div className="pulse__row">
                            <span className="pulse__name">{budget.category.name}</span>
                            <span className={`chip chip--${budget.status.toLowerCase()}`}>
                                {budget.status !== "OK" && <TriangleAlert size={12} />}
                                {STATUS_LABEL[budget.status]}
                            </span>
                        </div>
                        <div className="meter">
                            <motion.div
                                className={`meter__fill meter__fill--${budget.status.toLowerCase()}`}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: Math.min(budget.percentUsed, 100) / 100 }}
                                transition={{ delay: 0.35 + index * 0.08, duration: 1.2, ease: EASE_OUT }}
                            />
                        </div>
                        <div className="pulse__numbers">
                            <span>
                                {formatMoney(budget.spent)} <span className="muted">of {formatMoney(budget.limitAmount)}</span>
                            </span>
                            <span className="tabular">{budget.percentUsed}%</span>
                        </div>
                    </motion.li>
                ))}
            </ul>
        </Card>
    );
}

function Trend({ month }) {
    const from = shiftMonth(month, -5);
    const { data = [], isLoading, isError, error } = useTrend(from, month);

    return (
        <Card className="span-7">
            <div className="card__head">
                <div>
                    <p className="eyebrow">Six-month rhythm</p>
                    <h3 className="card__title">
                        Income <em>against</em> expenses
                    </h3>
                </div>
                <div className="legend-inline">
                    <span>
                        <span className="swatch swatch--income" /> Income
                    </span>
                    <span>
                        <span className="swatch swatch--expense" /> Expenses
                    </span>
                </div>
            </div>
            {isError && <ErrorNotice error={error} />}
            {isLoading ? <Skeleton height={270} radius={16} /> : !isError && <TrendChart data={data} activeMonth={month} />}
        </Card>
    );
}

function Breakdown({ month }) {
    const { data = [], isLoading, isError, error } = useBreakdown(month, "EXPENSE");

    return (
        <Card className="span-5">
            <div className="card__head">
                <div>
                    <p className="eyebrow">Where it went</p>
                    <h3 className="card__title">
                        Spending by <em>category</em>
                    </h3>
                </div>
            </div>
            {isError && <ErrorNotice error={error} />}
            {isLoading && <Skeleton height={220} radius={110} width={220} className="centered" />}
            {!isLoading && !isError && data.length === 0 && (
                <EmptyState icon={Sparkles} title="No spending yet" text="Expenses you add this month will appear here as a breakdown." />
            )}
            {!isLoading && data.length > 0 && <CategoryDonut data={data} />}
        </Card>
    );
}

function Recent({ month }) {
    const { data = [], isLoading, isError, error } = useTransactions({ month });
    const openTransaction = useTransactionModal();
    const recent = data.slice(0, 6);

    return (
        <Card className="span-12">
            <div className="card__head">
                <div>
                    <p className="eyebrow">Latest movement</p>
                    <h3 className="card__title">
                        Recent <em>transactions</em>
                    </h3>
                </div>
                <Link to="/transactions" className="link-arrow">
                    View all <ArrowRight size={14} />
                </Link>
            </div>
            {isError && <ErrorNotice error={error} />}
            {isLoading && <SkeletonRows rows={4} />}
            {!isLoading && !isError && recent.length === 0 && (
                <EmptyState
                    icon={Sparkles}
                    title={`A quiet ${monthName(month)}`}
                    text="No transactions recorded for this month."
                    action={
                        <button type="button" className="btn btn--primary btn--sm" onClick={() => openTransaction()}>
                            Add the first one
                        </button>
                    }
                />
            )}
            <ul className="tx-list">
                <AnimatePresence initial={false}>
                    {recent.map((transaction) => (
                        <TransactionRow key={transaction.id} transaction={transaction} onEdit={openTransaction} showDate />
                    ))}
                </AnimatePresence>
            </ul>
        </Card>
    );
}

export default function Dashboard() {
    const { month } = useMonth();

    return (
        <Page>
            <div className="grid">
                <Hero month={month} />
                <BudgetPulse month={month} />
                <Trend month={month} />
                <Breakdown month={month} />
                <Recent month={month} />
            </div>
        </Page>
    );
}
