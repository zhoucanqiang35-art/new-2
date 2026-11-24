import reference from '../data/currency-rates.json';

export const { rates, asOf, source } = reference;
const formatters = new Map();
// The November 23 iTaoBuy product screens show ¥128 ≈ $22.65 and ¥368 ≈ $65.12.
const usdPerCny = 0.17695;

export function selectedCurrency() {
  if (typeof document === 'undefined') return 'USD';
  return document.documentElement.dataset.currency || 'USD';
}

export function formatMoney(value, code = selectedCurrency()) {
  if (value === null || !Number.isFinite(value)) return 'Price on iTaoBuy';
  const currency = Object.hasOwn(rates, code) ? code : 'USD';
  if (!formatters.has(currency)) {
    formatters.set(currency, new Intl.NumberFormat('en-US', { style: 'currency', currency }));
  }
  return formatters.get(currency).format(currency === 'CNY' ? value : value * usdPerCny * rates[currency]);
}
