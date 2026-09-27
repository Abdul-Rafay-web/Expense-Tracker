function monthRange(month) {
    const [year, monthNumber] = month.split("-").map(Number);
    const start = new Date(Date.UTC(year, monthNumber - 1, 1));
    const end = new Date(Date.UTC(year, monthNumber, 1));
    return { start, end };
}

module.exports = { monthRange };
