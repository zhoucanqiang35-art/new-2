import agents from './agents.json';
import exchange from './rates.json';
import {buyUrl, sourceOrigin} from './platform.mjs';

export {agents};
export const currencies = Object.keys(exchange.rates).sort();
export const rateDate = exchange.date;
const defaults = {agent: 'pikobuy', currency: 'USD', currencyMode: 'language'};
let preferences = defaults;
if (typeof window !== 'undefined') {
  try {
    const stored = JSON.parse(localStorage.getItem('pikobuy-shopping')) ?? {};
    preferences = {
      agent: agents.some(({id}) => id === stored.agent) ? stored.agent : defaults.agent,
      currency: currencies.includes(stored.currency) ? stored.currency : defaults.currency,
      currencyMode: stored.currencyMode ?? (stored.currency && stored.currency !== defaults.currency ? 'manual' : 'language'),
    };
  } catch {}
}
export const shoppingOptions = () => preferences;
export function updateShopping(patch) {
  preferences = {...preferences, ...patch};
  try { localStorage.setItem('pikobuy-shopping', JSON.stringify(preferences)); } catch {}
  window.dispatchEvent(new Event('shopping-change'));
}
const languageCurrencies = {
  en: 'USD', 'zh-Hans': 'CNY', es: 'EUR', fr: 'EUR', de: 'EUR', it: 'EUR', pt: 'EUR',
  ru: 'RUB', ja: 'JPY', ko: 'KRW', ar: 'AED', tr: 'TRY', pl: 'PLN', nl: 'EUR', sv: 'SEK',
  da: 'DKK', fi: 'EUR', no: 'NOK', hu: 'HUF', ro: 'RON', cs: 'CZK', uk: 'UAH',
};
export function followLanguageCurrency(language) {
  if (preferences.currencyMode === 'language') {
    const currency = languageCurrencies[language] ?? defaults.currency;
    if (currency !== preferences.currency) updateShopping({currency});
  }
}
export function selectCurrency(currency, language = document.documentElement.lang) {
  if (currency === 'auto') {
    updateShopping({currencyMode: 'language', currency: languageCurrencies[language] ?? defaults.currency});
  } else if (currencies.includes(currency)) {
    updateShopping({currency, currencyMode: 'manual'});
  }
}
export function formatPrice(amount, currency = preferences.currency) {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency, currencyDisplay: currency === 'USD' ? 'symbol' : 'code'})
    .format(Number(amount) * (currency === 'USD' ? 1 / 7.26 : exchange.rates[currency]));
}
export function refreshPrices(root = document) {
  const nodes = root.matches?.('[data-cny-price]') ? [root] : root.querySelectorAll('[data-cny-price]');
  for (const node of nodes) {
    if (node.dataset.cnyPrice === '') continue;
    const text = formatPrice(node.dataset.cnyPrice);
    if (node.textContent !== text) node.textContent = text;
  }
}
export function purchaseFor(item, agentId = preferences.agent) {
  const agent = agents.find(({id}) => id === agentId);
  if (!item.id || agent.id === 'findspreadsheet') {
    return {label: 'View on FindSpreadsheet', href: item.path ? sourceOrigin + item.path : sourceOrigin};
  }
  const href = agent.id === 'pikobuy' ? buyUrl(item.id) : agent.template.replaceAll('{productId}', encodeURIComponent(item.id));
  return {label: 'Buy on ' + agent.name, href};
}

export function savedPaths() {
  try {
    const list = JSON.parse(localStorage.getItem('pikobuy-saved')) ?? [];
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}
export function toggleSaved(path) {
  const list = savedPaths();
  const next = list.includes(path) ? list.filter((item) => item !== path) : [...list, path];
  try { localStorage.setItem('pikobuy-saved', JSON.stringify(next)); } catch {}
  return next.includes(path);
}
