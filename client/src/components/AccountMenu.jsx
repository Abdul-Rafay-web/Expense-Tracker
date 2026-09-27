import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, LogOut } from "lucide-react";
import { useToast } from "./Toasts";
import { useLogout, useMe } from "../lib/queries";
import { firstName, initials, memberSince } from "../lib/user";
import { EASE_OUT } from "../lib/motion";

export default function AccountMenu() {
    const { data: user } = useMe();
    const logout = useLogout();
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const container = useRef(null);

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        function handlePointer(event) {
            if (container.current && !container.current.contains(event.target)) {
                setOpen(false);
            }
        }
        function handleKey(event) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }
        document.addEventListener("pointerdown", handlePointer);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("pointerdown", handlePointer);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    if (!user) {
        return null;
    }

    async function handleLogout() {
        const name = firstName(user);
        setOpen(false);
        try {
            await logout.mutateAsync();
        } finally {
            toast.success(`Signed out. See you soon, ${name}.`);
        }
    }

    return (
        <div className="account" ref={container}>
            <motion.button
                type="button"
                className="account__trigger"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`Account menu for ${user.name}`}
                onClick={() => setOpen((current) => !current)}
                whileTap={{ scale: 0.95 }}
            >
                <span className="account__avatar">{initials(user)}</span>
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="account__menu"
                        role="menu"
                        initial={{ opacity: 0, y: -8, scale: 0.96, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.35, ease: EASE_OUT }}
                    >
                        <div className="account__profile">
                            <span className="account__avatar account__avatar--lg">{initials(user)}</span>
                            <div className="account__identity">
                                <span className="account__name">{user.name}</span>
                                <span className="account__email">{user.email}</span>
                            </div>
                        </div>
                        <p className="account__since">
                            <CalendarDays size={14} /> Member since {memberSince(user)}
                        </p>
                        <button type="button" role="menuitem" className="account__logout" onClick={handleLogout} disabled={logout.isPending}>
                            <LogOut size={16} />
                            <span>{logout.isPending ? "Signing out…" : "Log out"}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
