import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";
import { EASE_OUT } from "../lib/motion";

export default function AnimatedNumber({ value, format, duration = 1.4 }) {
    const ref = useRef(null);
    const previous = useRef(0);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const from = previous.current;
        previous.current = value;
        const controls = animate(from, value, {
            duration: reduceMotion ? 0 : duration,
            ease: EASE_OUT,
            onUpdate: (latest) => {
                if (ref.current) {
                    ref.current.textContent = format(Math.round(latest));
                }
            },
        });
        return () => controls.stop();
    }, [value, format, duration, reduceMotion]);

    return (
        <span ref={ref} className="tabular">
            {format(0)}
        </span>
    );
}
