import platformLinks from '../../public/data/shopping-agents.json';
import rateTable from '../../public/data/rates.json';
import { sourceOrigin } from './catalog.mjs';

export const agents = [
  { id: 'findspreadsheet', name: 'Findspreadsheet' },
  ...platformLinks,
];
export const rates = rateTable.rates;
export const ratesDate = rateTable.date;
export const currencies = Object.keys(rates).sort();
export const defaultAgent = agents.find(({id}) => id === 'hipobuy');
export const defaultCurrency = 'USD';

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
let preferences;
let savedProducts;

export function currentShopping() {
  if (!preferences) {
    const stored = read('hipobuy.shopping', {});
    preferences = {
      agent: agents.find(({id}) => id === stored.agent) ?? defaultAgent,
      currency: Object.hasOwn(rates, stored.currency) ? stored.currency : defaultCurrency,
    };
  }
  return preferences;
}

export function changeShopping({agent, currency}) {
  const before = currentShopping();
  preferences = {agent: agent ?? before.agent, currency: currency ?? before.currency};
  write('hipobuy.shopping', {agent: preferences.agent.id, currency: preferences.currency});
}

export function agentUrl(agent, id, path) {
  return agent.template
    ? agent.template.replaceAll('{productId}', id)
    : new URL(path, sourceOrigin).href;
}

export function formatPrice(raw, currency, locale = 'en') {
  const amount = Number(raw) * rates[currency];
  return new Intl.NumberFormat(locale, {
    style: 'currency', currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: currency === 'CNY' ? 2 : undefined,
  }).format(amount);
}

export function savedIds() {
  if (!savedProducts) {
    const stored = read('hipobuy.saved', []);
    savedProducts = new Set(Array.isArray(stored) ? stored.filter((id) => /^\d{5,18}$/.test(id)) : []);
  }
  return savedProducts;
}
export function toggleSaved(id) {
  const ids = savedIds();
  if (ids.has(id)) ids.delete(id);
  else ids.add(id);
  write('hipobuy.saved', [...ids]);
}
