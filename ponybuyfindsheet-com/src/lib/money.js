import exchange from '../data/exchange-rates.json';

export const exchangeDate = exchange.date;
export const currencyCodes = Object.keys(exchange.rates);

export function hasCurrency(currency) {
  return Object.hasOwn(exchange.rates, currency);
}

export function formatMoney(amount, source = 'CNY', currency = 'USD', locale = 'en') {
  const value = Number(amount);
  if (amount == null || amount === '' || !Number.isFinite(value) || !hasCurrency(source) || !hasCurrency(currency)) return '';
  const converted = value * exchange.rates[currency] / exchange.rates[source];
  return new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'symbol' }).format(converted);
}
