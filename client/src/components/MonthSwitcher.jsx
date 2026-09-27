import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMonth } from "../context/MonthContext";
import { currentMonth, monthLabel } from "../lib/format";
import { EASE_OUT } from "../lib/motion";

const slide = {
    enter: (direction) => ({ y: direction >= 0 ? 18 : -18, opacity: 0, filter: "blur(4px)" }),
    center: { y: 0, opacity: 1, filter: "blur(0px)" },
    exit: (direction) => ({ y: direction >= 0 ? -18 : 18, opacity: 0, filter: "blur(4px)" }),
};

export default function MonthSwitcher() {
    const { month, direction, next, previous, reset } = useMonth();
    const isCurrent = month === currentMonth();

    return (
        <div className="month-switcher">
            <button type="button" className="icon-btn icon-btn--sm" aria-label="Previous month" onClick={previous}>
                <ChevronLeft size={16} />
            </button>
            <button type="button" className="month-switcher__label" onClick={reset} title="Jump to this month" aria-live="polite">
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                    <motion.span
                        key={month}
                        custom={direction}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45, ease: EASE_OUT }}
                    >
                        {monthLabel(month)}
                    </motion.span>
                </AnimatePresence>
                {!isCurrent && <span className="month-switcher__dot" aria-hidden="true" />}
            </button>
            <button type="button" className="icon-btn icon-btn--sm" aria-label="Next month" onClick={next}>
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
