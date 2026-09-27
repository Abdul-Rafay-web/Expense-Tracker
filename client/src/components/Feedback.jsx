import { motion } from "motion/react";
import { CircleAlert } from "lucide-react";

export function Skeleton({ height = 16, width = "100%", radius = 10, className = "" }) {
    return <div className={`skeleton ${className}`} style={{ height, width, borderRadius: radius }} aria-hidden="true" />;
}

export function SkeletonRows({ rows = 5 }) {
    return (
        <div className="skeleton-rows" aria-label="Loading">
            {Array.from({ length: rows }, (_, index) => (
                <div key={index} className="skeleton-row">
                    <Skeleton width={40} height={40} radius={14} />
                    <div className="skeleton-row__text">
                        <Skeleton width="42%" height={13} />
                        <Skeleton width="24%" height={11} />
                    </div>
                    <Skeleton width={90} height={15} />
                </div>
            ))}
        </div>
    );
}

export function EmptyState({ icon: Icon, title, text, action }) {
    return (
        <motion.div className="empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            {Icon && (
                <div className="empty__icon">
                    <Icon size={22} strokeWidth={1.6} />
                </div>
            )}
            <h3 className="empty__title">{title}</h3>
            {text && <p className="empty__text">{text}</p>}
            {action}
        </motion.div>
    );
}

export function ErrorNotice({ error }) {
    return (
        <div className="error-notice" role="alert">
            <CircleAlert size={18} />
            <span>{error?.message ?? "Something went wrong while loading this section."}</span>
        </div>
    );
}
