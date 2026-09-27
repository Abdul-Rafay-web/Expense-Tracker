import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import MonthSwitcher from "./MonthSwitcher";
import { useTransactionModal } from "../context/TransactionModalContext";
import { EASE_OUT } from "../lib/motion";

const TITLES = {
    "/": { eyebrow: "Overview", lead: "The shape of", accent: "your month" },
    "/transactions": { eyebrow: "Transactions", lead: "Every rupee,", accent: "accounted for" },
    "/budgets": { eyebrow: "Budgets", lead: "Limits that", accent: "keep you free" },
    "/categories": { eyebrow: "Categories", lead: "Where it", accent: "all goes" },
};

export default function Topbar() {
    const { pathname } = useLocation();
    const openTransaction = useTransactionModal();
    const title = TITLES[pathname] ?? TITLES["/"];

    return (
        <header className="topbar">
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    className="topbar__titles"
                    initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(6px)", transition: { duration: 0.2 } }}
                    transition={{ duration: 0.7, ease: EASE_OUT }}
                >
                    <p className="eyebrow">{title.eyebrow}</p>
                    <h1 className="topbar__title">
                        {title.lead} <em>{title.accent}</em>
                    </h1>
                </motion.div>
            </AnimatePresence>

            <div className="topbar__actions">
                <MonthSwitcher />
                <motion.button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => openTransaction()}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <Plus size={17} strokeWidth={2.2} />
                    <span>New transaction</span>
                </motion.button>
            </div>
        </header>
    );
}
