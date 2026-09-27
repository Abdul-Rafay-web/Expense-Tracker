import { useEffect } from "react";
import { motion } from "motion/react";
import Logo from "./Logo";
import { EASE_IN_OUT, EASE_OUT } from "../lib/motion";

const WORD = "ExpenseMate";

export default function Intro({ onDone }) {
    useEffect(() => {
        const timer = setTimeout(onDone, 2600);
        return () => clearTimeout(timer);
    }, [onDone]);

    return (
        <motion.div
            className="intro"
            onClick={onDone}
            initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 1, ease: EASE_IN_OUT } }}
        >
            <motion.div className="intro__glow" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2, ease: EASE_OUT }} />
            <div className="intro__inner">
                <Logo size={72} draw />
                <h1 className="intro__word" aria-label={WORD}>
                    {WORD.split("").map((letter, index) => (
                        <span key={index} className="intro__mask">
                            <motion.span
                                className={index >= 7 ? "intro__letter intro__letter--accent" : "intro__letter"}
                                initial={{ y: "110%" }}
                                animate={{ y: "0%" }}
                                transition={{ delay: 0.55 + index * 0.045, duration: 0.9, ease: EASE_OUT }}
                            >
                                {letter}
                            </motion.span>
                        </span>
                    ))}
                </h1>
                <motion.div className="intro__rule" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.9, duration: 1.3, ease: EASE_OUT }} />
                <motion.p className="intro__tagline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.35, duration: 0.8, ease: EASE_OUT }}>
                    Every rupee, accounted for.
                </motion.p>
            </div>
        </motion.div>
    );
}
