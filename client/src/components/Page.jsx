import { useEffect } from "react";
import { motion } from "motion/react";
import { pageVariants } from "../lib/motion";

export default function Page({ children, className = "" }) {
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    return (
        <motion.div className={`page ${className}`} variants={pageVariants} initial="hidden" animate="visible" exit="exit">
            {children}
        </motion.div>
    );
}
