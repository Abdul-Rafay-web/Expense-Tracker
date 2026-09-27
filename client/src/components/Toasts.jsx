import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((list) => list.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback(
        (tone, message) => {
            const id = `${Date.now()}-${Math.random()}`;
            setToasts((list) => [...list.slice(-3), { id, tone, message }]);
            setTimeout(() => dismiss(id), 4800);
        },
        [dismiss]
    );

    const api = useMemo(
        () => ({
            success: (message) => push("success", message),
            error: (message) => push("error", message),
        }),
        [push]
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="toasts" role="status" aria-live="polite">
                <AnimatePresence initial={false}>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            layout
                            className={`toast toast--${toast.tone}`}
                            initial={{ opacity: 0, y: 28, scale: 0.94, filter: "blur(6px)" }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: 60, transition: { duration: 0.22 } }}
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        >
                            {toast.tone === "success" ? <CircleCheck size={18} /> : <CircleAlert size={18} />}
                            <span>{toast.message}</span>
                            <button type="button" className="toast__close" aria-label="Dismiss notification" onClick={() => dismiss(toast.id)}>
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
