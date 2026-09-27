import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./styles.css";
import App from "./App";
import { ToastProvider } from "./components/Toasts";
import { MonthProvider } from "./context/MonthContext";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000,
            retry: 1,
            refetchOnWindowFocus: true,
        },
    },
});

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <MotionConfig reducedMotion="user">
                    <ToastProvider>
                        <MonthProvider>
                            <App />
                        </MonthProvider>
                    </ToastProvider>
                </MotionConfig>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
);
