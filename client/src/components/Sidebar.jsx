import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeftRight, LayoutDashboard, PiggyBank, Tags } from "lucide-react";
import Logo from "./Logo";
import { useHealth } from "../lib/queries";

export const NAV_ITEMS = [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { to: "/budgets", label: "Budgets", icon: PiggyBank },
    { to: "/categories", label: "Categories", icon: Tags },
];

function ConnectionStatus() {
    const { isSuccess, isError } = useHealth();
    const state = isSuccess ? "online" : isError ? "offline" : "checking";
    const label = { online: "Server connected", offline: "Server offline", checking: "Connecting…" }[state];

    return (
        <div className={`connection connection--${state}`} role="status">
            <span className="connection__dot" />
            <span>{label}</span>
        </div>
    );
}

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar__brand">
                <Logo size={34} />
                <span className="sidebar__name">
                    Expense<em>Mate</em>
                </span>
            </div>

            <nav className="sidebar__nav" aria-label="Main navigation">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                    <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.span
                                        layoutId="nav-pill"
                                        className="nav-link__pill"
                                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                                    />
                                )}
                                <Icon size={18} strokeWidth={1.8} className="nav-link__icon" />
                                <span className="nav-link__label">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar__foot">
                <ConnectionStatus />
                <p className="sidebar__hint">
                    Press <kbd>N</kbd> to add a transaction
                </p>
            </div>
        </aside>
    );
}
