import { useRef } from "react";
import { motion } from "motion/react";
import { riseVariants } from "../lib/motion";

export default function Card({ className = "", children, ...rest }) {
    const ref = useRef(null);

    function handlePointerMove(event) {
        const element = ref.current;
        if (!element) {
            return;
        }
        const bounds = element.getBoundingClientRect();
        element.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
        element.style.setProperty("--my", `${event.clientY - bounds.top}px`);
    }

    return (
        <motion.section ref={ref} className={`card ${className}`} variants={riseVariants} onPointerMove={handlePointerMove} {...rest}>
            {children}
        </motion.section>
    );
}
