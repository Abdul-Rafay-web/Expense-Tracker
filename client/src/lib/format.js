const wholeFormat = new Intl.NumberFormat("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const paisaFormat = new Intl.NumberFormat("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compactFormat = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

export const CATEGORY_COLORS = ["#E8C88C", "#5CD6BC", "#FF8062", "#A99BFF", "#74C7F2", "#EE8FD0", "#C6DE7E", "#F2B45C"];

export function colorFor(id) {
    return CATEGORY_COLORS[Math.abs(Number(id) - 1) % CATEGORY_COLORS.length];
}

export function formatMoney(paisa, { sign = false } = {}) {
    const rounded = Math.round(paisa);
    const rupees = rounded / 100;
    const formatter = rounded % 100 === 0 ? wholeFormat : paisaFormat;
    const text = `Rs ${formatter.format(Math.abs(rupees))}`;
    if (rupees < 0) {
        return `−${text}`;
    }
    if (sign && rupees > 0) {
        return `+${text}`;
    }
    return text;
}

export function formatCompact(paisa) {
    return `Rs ${compactFormat.format(paisa / 100)}`;
}

export function paisaToInput(paisa) {
    return paisa % 100 === 0 ? String(paisa / 100) : (paisa / 100).toFixed(2);
}

export function rupeesToPaisa(value) {
    return Math.round(Number(value) * 100);
}

export function isValidRupees(value) {
    return /^\d+(\.\d{1,2})?$/.test(String(value).trim()) && Number(value) > 0;
}

function pad(number) {
    return String(number).padStart(2, "0");
}

export function currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}

export function todayInput() {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function shiftMonth(month, delta) {
    const [year, monthNumber] = month.split("-").map(Number);
    const total = year * 12 + (monthNumber - 1) + delta;
    return `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`;
}

function monthDate(month) {
    const [year, monthNumber] = month.split("-").map(Number);
    return new Date(Date.UTC(year, monthNumber - 1, 1));
}

export function monthLabel(month) {
    return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(monthDate(month));
}

export function monthName(month) {
    return new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(monthDate(month));
}

export function monthShort(month) {
    return new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(monthDate(month));
}

export function defaultDateForMonth(month) {
    return month === currentMonth() ? todayInput() : `${month}-01`;
}

export function formatDay(isoDate) {
    return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(isoDate));
}

export function formatShortDate(isoDate) {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(isoDate));
}

export function formatOriginal(transaction) {
    if (!transaction.currency || transaction.currency === "PKR" || transaction.originalAmount == null) {
        return "";
    }
    return `${transaction.currency} ${(transaction.originalAmount / 100).toFixed(2)}`;
}

export function plural(count, one, many) {
    return `${count} ${count === 1 ? one : many}`;
}
