export const EASE_OUT = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT = [0.76, 0, 0.24, 1];

export const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
    exit: { opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.22, ease: EASE_IN_OUT } },
};

export const riseVariants = {
    hidden: { opacity: 0, y: 26, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE_OUT } },
};

export const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
};

export const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};
