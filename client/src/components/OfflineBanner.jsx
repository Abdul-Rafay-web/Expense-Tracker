import { AnimatePresence, motion } from "motion/react";
import { WifiOff } from "lucide-react";
import { useHealth } from "../lib/queries";

export default function OfflineBanner() {
    const { isError } = useHealth();

    return (
        <AnimatePresence>
            {isError && (
                <motion.div
                    className="offline-banner"
                    role="alert"
                    initial={{ opacity: 0, y: -12, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -12, height: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <WifiOff size={16} />
                    <span>
                        The ExpenseMate server isn't responding. Run <code>npm run dev</code> inside the <code>server</code> folder, and this page will reconnect on its own.
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
