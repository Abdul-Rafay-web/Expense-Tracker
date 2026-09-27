import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { currentMonth, shiftMonth } from "../lib/format";

const MonthContext = createContext(null);

export function MonthProvider({ children }) {
    const [state, setState] = useState(() => ({ month: currentMonth(), direction: 0 }));

    const move = useCallback((delta) => {
        setState((previous) => ({ month: shiftMonth(previous.month, delta), direction: delta }));
    }, []);

    const value = useMemo(
        () => ({
            month: state.month,
            direction: state.direction,
            next: () => move(1),
            previous: () => move(-1),
            reset: () => setState((previous) => ({ month: currentMonth(), direction: currentMonth() > previous.month ? 1 : -1 })),
        }),
        [state, move]
    );

    return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>;
}

export function useMonth() {
    return useContext(MonthContext);
}
