const BASE_CURRENCY = "PKR";

const CURRENCIES = {
    PKR: { name: "Pakistani rupee", rate: 1 },
    USD: { name: "US dollar", rate: 280 },
    EUR: { name: "Euro", rate: 305 },
    GBP: { name: "British pound", rate: 355 },
    AED: { name: "UAE dirham", rate: 76 },
    SAR: { name: "Saudi riyal", rate: 75 },
};

const CURRENCY_CODES = Object.keys(CURRENCIES);

function toBaseAmount(amount, currency) {
    return Math.round(amount * CURRENCIES[currency].rate);
}

function listCurrencies() {
    return CURRENCY_CODES.map((code) => ({ code, ...CURRENCIES[code] }));
}

module.exports = { BASE_CURRENCY, CURRENCY_CODES, toBaseAmount, listCurrencies };
