import { motion } from "motion/react";

export default function Segmented({ options, value, onChange, name, label }) {
    return (
        <div className="segmented" role="radiogroup" aria-label={label}>
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className={`segmented__option segmented__option--${option.tone ?? "neutral"}${active ? " is-active" : ""}`}
                        onClick={() => onChange(option.value)}
                    >
                        {active && (
                            <motion.span
                                layoutId={`segmented-${name}`}
                                className="segmented__pill"
                                transition={{ type: "spring", stiffness: 480, damping: 38 }}
                            />
                        )}
                        <span className="segmented__text">{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
