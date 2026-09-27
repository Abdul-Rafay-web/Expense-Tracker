import { useCallback, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import Background from "./components/Background";
import Intro from "./components/Intro";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import OfflineBanner from "./components/OfflineBanner";
import { TransactionModalProvider } from "./context/TransactionModalContext";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Categories from "./pages/Categories";

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

export default function App() {
    const location = useLocation();
    const [showIntro, setShowIntro] = useState(shouldPlayIntro);

    const finishIntro = useCallback(() => {
        setShowIntro(false);
        try {
            sessionStorage.setItem(INTRO_KEY, "1");
        } catch {
            return;
        }
    }, []);

    return (
        <TransactionModalProvider>
            <Background />
            <AnimatePresence>{showIntro && <Intro key="intro" onDone={finishIntro} />}</AnimatePresence>
            <div className="app">
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
            </div>
        </TransactionModalProvider>
    );
}
