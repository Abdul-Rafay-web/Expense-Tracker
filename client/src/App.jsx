import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Background from "./components/Background";
import Intro from "./components/Intro";
import Logo from "./components/Logo";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import OfflineBanner from "./components/OfflineBanner";
import { TransactionModalProvider } from "./context/TransactionModalContext";
import AuthScreen from "./pages/AuthScreen";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Categories from "./pages/Categories";
import { useHealth, useMe } from "./lib/queries";

const INTRO_KEY = "expensemate-intro-seen";

function shouldPlayIntro() {
    try {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return false;
        }
        return !sessionStorage.getItem(INTRO_KEY);
    } catch {
        return false;
    }
}

function Splash() {
    return (
        <div className="splash" role="status" aria-label="Loading ExpenseMate">
            <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
                <Logo size={56} />
            </motion.div>
        </div>
    );
}

function Workspace() {
    const location = useLocation();

    return (
        <motion.div
            className="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            transition={{ duration: 0.7 }}
        >
            <TransactionModalProvider>
                <Sidebar />
                <main className="main">
                    <OfflineBanner />
                    <Topbar />
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/transactions" element={<Transactions />} />
                            <Route path="/budgets" element={<Budgets />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AnimatePresence>
                </main>
            </TransactionModalProvider>
        </motion.div>
    );
}

export default function App() {
    const [showIntro, setShowIntro] = useState(shouldPlayIntro);
    const me = useMe();
    const health = useHealth();

    useEffect(() => {
        if (health.isSuccess && me.isError) {
            me.refetch();
        }
    }, [health.isSuccess, me]);

    const finishIntro = useCallback(() => {
        setShowIntro(false);
        try {
            sessionStorage.setItem(INTRO_KEY, "1");
        } catch {
            return;
        }
    }, []);

    const user = me.data;

    return (
        <>
            <Background />
            <AnimatePresence>{showIntro && <Intro key="intro" onDone={finishIntro} />}</AnimatePresence>
            {me.isPending ? (
                <Splash />
            ) : (
                <AnimatePresence mode="wait">{user ? <Workspace key={`workspace-${user.id}`} /> : <AuthScreen key="auth" />}</AnimatePresence>
            )}
        </>
    );
}
