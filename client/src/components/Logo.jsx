import { motion } from "motion/react";
import { EASE_OUT } from "../lib/motion";

export default function Logo({ size = 34, draw = false }) {
    const drawProps = draw
        ? { initial: { pathLength: 0 }, animate: { pathLength: 1 } }
        : {};

    return (
        <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
            <defs>
                <linearGradient id="logo-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F6E3B8" />
                    <stop offset="100%" stopColor="#C99A55" />
                </linearGradient>
            </defs>
            <motion.circle
                cx="32"
                cy="32"
                r="24"
                fill="none"
                stroke="url(#logo-ring)"
                strokeWidth="3.2"
                {...drawProps}
                transition={{ duration: 1.4, ease: EASE_OUT }}
            />
            <motion.path
                d="M18 40 L27 30 L34 37 L46 24"
                fill="none"
                stroke="#5CD6BC"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                {...drawProps}
                transition={{ duration: 1.1, delay: draw ? 0.45 : 0, ease: EASE_OUT }}
            />
        </svg>
    );
}
