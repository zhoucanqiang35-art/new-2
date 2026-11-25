// Euro reference rates, 20 November 2026. Catalog amounts are in CNY.
const perEuro = {
  "USD": 1.099,
  "JPY": 174.35,
  "CZK": 24.469,
  "DKK": 7.4746,
  "GBP": 0.83735,
  "HUF": 373.55,
  "PLN": 4.4583,
  "RON": 5.3493,
  "SEK": 11.2125,
  "CHF": 0.9223,
  "ISK": 137.2,
  "NOK": 10.718,
  "TRY": 55.5788,
  "AUD": 1.6487,
  "BRL": 6.5259,
  "CAD": 1.5723,
  "CNY": 7.3388,
  "HKD": 8.615,
  "IDR": 20071.37,
  "ILS": 3.6737,
  "INR": 101.85,
  "KRW": 1472.04,
  "MXN": 20.9547,
  "MYR": 4.5196,
  "NZD": 1.9968,
  "PHP": 70.091,
  "SGD": 1.416,
  "THB": 37.262,
  "ZAR": 19.1987,
  "EUR": 1,
  "RUB": 89.8597,
  "UAH": 89.8597 / 1.81251,
  "SAR": 1.099 * 3.75
};
export const currencies = Object.keys(perEuro).sort();
export const defaultCurrency = 'USD';
export const rateDate = '20 Nov 2026';
export const rateSources = [
  ['ECB', 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html'],
  ['CBR', 'https://www.cbr.ru/eng/currency_base/daily/?UniDbQuery.Posted=True&UniDbQuery.To=20.11.2026'],
  ['SAMA', 'https://www.sama.gov.sa/en-US/MediaCenter/News/Pages/news-557.aspx'],
];

export function preference(key, fallback) {
  try { return window.localStorage.getItem('ootdbuy-findsheet-' + key) ?? fallback; }
  catch { return fallback; }
}

export function savePreference(key, value) {
  try { window.localStorage.setItem('ootdbuy-findsheet-' + key, value); }
  catch {}
}

let activeCurrency = defaultCurrency;
export function setCurrency(currency) {
  activeCurrency = Object.hasOwn(perEuro, currency) ? currency : defaultCurrency;
}

export function getCurrency() { return activeCurrency; }

export function priceLabel(value, currency = activeCurrency) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Check seller price';
  const converted = amount * perEuro[currency] / perEuro.CNY;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'symbol' }).format(converted);
}
