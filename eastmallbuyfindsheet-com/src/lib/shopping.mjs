import agentList from './agents.json';
import exchange from './rates.json';
import {purchaseUrl, sourceOrigin} from './catalog.mjs';
import {isShopItem} from './landing-paths.mjs';

export const agents = agentList;
export const currencies = Object.keys(exchange.rates).sort();
export const rateDate = exchange.date;
const defaultOptions = {agent: 'eastmallbuy', currency: 'USD'};
const optionsKey = 'eastmallbuy-shopping';
const savedKey = 'eastmallbuy-saved';
const formats = new Map();

function stored(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function shoppingOptions() {
  const saved = stored(optionsKey, defaultOptions);
  return {
    agent: agents.some(({id}) => id === saved.agent) ? saved.agent : defaultOptions.agent,
    currency: currencies.includes(saved.currency) ? saved.currency : defaultOptions.currency,
  };
}

export function updateShopping(patch) {
  write(optionsKey, {...shoppingOptions(), ...patch});
  window.dispatchEvent(new Event('shopping-change'));
}

export function priceFor(amount, currency = 'USD') {
  if (amount === '' || amount == null || !Number.isFinite(Number(amount))) return '';
  if (!formats.has(currency)) {
    formats.set(currency, new Intl.NumberFormat('en-US', {style: 'currency', currency, currencyDisplay: 'symbol'}));
  }
  return formats.get(currency).format(Number(amount) * exchange.rates[currency]);
}

export function purchaseFor(agentId, itemId, sourcePath) {
  if (agentId === 'findspreadsheet') {
    return {name: 'View on Findspreadsheet', url: new URL(sourcePath, sourceOrigin).href, sponsored: false};
  }
  const agent = agents.find(({id}) => id === agentId);
  if (!agent || agentId === 'eastmallbuy') return {name: 'Buy on EastMallBuy', url: purchaseUrl(itemId), sponsored: true};
  return {name: 'Buy on ' + agent.name, url: agent.template.replaceAll('{productId}', encodeURIComponent(itemId)), sponsored: true};
}

export function savedItems() {
  const ids = stored(savedKey, []);
  return Array.isArray(ids) ? [...new Set(ids.filter(isShopItem))] : [];
}

export function toggleSavedItem(id) {
  if (!isShopItem(id)) return;
  const ids = new Set(savedItems());
  if (!ids.delete(id)) ids.add(id);
  window.localStorage.setItem(savedKey, JSON.stringify([...ids]));
}
