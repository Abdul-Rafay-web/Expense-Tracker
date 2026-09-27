import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Pencil, Trash2 } from "lucide-react";
import CategoryAvatar from "./CategoryAvatar";
import { formatMoney, formatShortDate } from "../lib/format";
import { EASE_OUT } from "../lib/motion";

export default function TransactionRow({ transaction, onEdit, onDelete, deleting = false, showDate = false }) {
    const [confirming, setConfirming] = useState(false);
    const isIncome = transaction.type === "INCOME";

    useEffect(() => {
        if (!confirming) {
            return undefined;
        }
        const timer = setTimeout(() => setConfirming(false), 3000);
        return () => clearTimeout(timer);
    }, [confirming]);

    function handleDelete() {
        if (confirming) {
            onDelete(transaction);
            setConfirming(false);
        } else {
            setConfirming(true);
        }
    }

    return (
        <motion.li
            layout="position"
            className="tx-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: deleting ? 0.4 : 1, y: 0 }}
            exit={{ opacity: 0, x: -30, filter: "blur(4px)", transition: { duration: 0.25 } }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
        >
            <CategoryAvatar category={transaction.category} />
            <div className="tx-row__main">
                <span className="tx-row__title">{transaction.note || transaction.category.name}</span>
                <span className="tx-row__meta">
                    {transaction.category.name}
                    {showDate && <> · {formatShortDate(transaction.date)}</>}
                </span>
            </div>
            <span className={`tx-row__amount ${isIncome ? "is-income" : "is-expense"}`}>
                {formatMoney(isIncome ? transaction.amount : -transaction.amount, { sign: true })}
            </span>
            {(onEdit || onDelete) && (
                <div className="tx-row__actions">
                    {onEdit && (
                        <button type="button" className="icon-btn icon-btn--sm" aria-label={`Edit ${transaction.note || transaction.category.name}`} onClick={() => onEdit(transaction)}>
                            <Pencil size={15} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            className={`icon-btn icon-btn--sm${confirming ? " icon-btn--danger is-confirming" : ""}`}
                            aria-label={confirming ? "Click again to confirm delete" : `Delete ${transaction.note || transaction.category.name}`}
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            <Trash2 size={15} />
                            {confirming && <span className="icon-btn__confirm">Delete?</span>}
                        </button>
                    )}
                </div>
            )}
        </motion.li>
    );
}
