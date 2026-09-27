import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, subtitle, children, width = 540 }) {
    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const handleKey = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKey);
        };
    }, [open, onClose]);

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    className="modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    onMouseDown={(event) => event.target === event.currentTarget && onClose()}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        className="modal"
                        style={{ maxWidth: width }}
                        initial={{ opacity: 0, y: 48, scale: 0.95, filter: "blur(12px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 24, scale: 0.97, filter: "blur(8px)", transition: { duration: 0.18 } }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <header className="modal__head">
                            <div>
                                <h2 id="modal-title" className="modal__title">{title}</h2>
                                {subtitle && <p className="modal__subtitle">{subtitle}</p>}
                            </div>
                            <button type="button" className="icon-btn" aria-label="Close dialog" onClick={onClose}>
                                <X size={18} />
                            </button>
                        </header>
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
