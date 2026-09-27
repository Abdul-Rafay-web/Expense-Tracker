import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    CATEGORY_COLORS,
    colorFor,
    currentMonth,
    defaultDateForMonth,
    formatCompact,
    formatMoney,
    isValidRupees,
    monthLabel,
    paisaToInput,
    plural,
    rupeesToPaisa,
    shiftMonth,
} from "./format";

describe("formatMoney", () => {
    it("shows whole rupees without decimals", () => {
        expect(formatMoney(150000)).toBe("Rs 1,500");
    });

    it("shows two decimals when there are paisa", () => {
        expect(formatMoney(150050)).toBe("Rs 1,500.50");
    });

    it("marks negative amounts with a minus sign", () => {
        expect(formatMoney(-50000)).toBe("−Rs 500");
    });

    it("adds a plus sign only when asked and only for positive amounts", () => {
        expect(formatMoney(1000, { sign: true })).toBe("+Rs 10");
        expect(formatMoney(0, { sign: true })).toBe("Rs 0");
    });

    it("groups large amounts with commas", () => {
        expect(formatMoney(1285000000)).toBe("Rs 12,850,000");
    });
});

describe("formatCompact", () => {
    it("shortens large amounts for chart axes", () => {
        expect(formatCompact(4650000)).toBe("Rs 46.5K");
    });
});

describe("rupee and paisa conversion", () => {
    it("converts rupees to whole paisa without floating point errors", () => {
        expect(rupeesToPaisa("19.99")).toBe(1999);
        expect(rupeesToPaisa("1500.5")).toBe(150050);
    });

    it("prefills inputs with the shortest correct rupee value", () => {
        expect(paisaToInput(150000)).toBe("1500");
        expect(paisaToInput(150050)).toBe("1500.50");
    });

    it("accepts only positive amounts with up to two decimals", () => {
        expect(isValidRupees("1500")).toBe(true);
        expect(isValidRupees("1500.50")).toBe(true);
        expect(isValidRupees("0")).toBe(false);
        expect(isValidRupees("-5")).toBe(false);
        expect(isValidRupees("1,500")).toBe(false);
        expect(isValidRupees("12.345")).toBe(false);
        expect(isValidRupees("abc")).toBe(false);
    });
});

describe("month helpers", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 8, 27, 10, 0, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("moves forward and backward across year boundaries", () => {
        expect(shiftMonth("2026-12", 1)).toBe("2027-01");
        expect(shiftMonth("2026-01", -1)).toBe("2025-12");
        expect(shiftMonth("2026-09", -5)).toBe("2026-04");
    });

    it("reads the current month from the clock", () => {
        expect(currentMonth()).toBe("2026-09");
    });

    it("defaults new transactions to today in the current month and the 1st in other months", () => {
        expect(defaultDateForMonth("2026-09")).toBe("2026-09-27");
        expect(defaultDateForMonth("2026-08")).toBe("2026-08-01");
    });

    it("labels a month in words", () => {
        expect(monthLabel("2026-09")).toBe("September 2026");
    });
});

describe("small helpers", () => {
    it("gives each category a stable colour that cycles through the palette", () => {
        expect(colorFor(1)).toBe(CATEGORY_COLORS[0]);
        expect(colorFor(1 + CATEGORY_COLORS.length)).toBe(colorFor(1));
    });

    it("pluralises labels", () => {
        expect(plural(1, "entry", "entries")).toBe("1 entry");
        expect(plural(3, "entry", "entries")).toBe("3 entries");
    });
});
