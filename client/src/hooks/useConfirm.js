import { useEffect, useState } from "react";

export function useConfirm(timeout = 3000) {
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (!confirming) {
            return undefined;
        }
        const timer = setTimeout(() => setConfirming(false), timeout);
        return () => clearTimeout(timer);
    }, [confirming, timeout]);

    return [confirming, setConfirming];
}
