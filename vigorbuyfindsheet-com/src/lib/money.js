import exchange from '../data/exchange-rates.json';

export const rateDate = exchange.date;
export const currencies = Object.keys(exchange.rates);
const cnyPerDollar = 7.26;
const formatters = new Map();

export function price(cny, currency = 'USD', language = 'en') {
  const number = Number(cny);
  if (!Number.isFinite(number) || number <= 0 || !Object.hasOwn(exchange.rates, currency)) return '';
  const dollars = number / cnyPerDollar;
  const value = currency === 'USD' ? Number(dollars.toFixed(2)) : number * exchange.rates[currency] / exchange.rates.CNY;
  const locale = currency === 'USD' ? 'en-US' : language;
  const key = locale + ':' + currency;
  if (!formatters.has(key)) formatters.set(key, new Intl.NumberFormat(locale, { style:'currency', currency }));
  return formatters.get(key).format(value);
}
