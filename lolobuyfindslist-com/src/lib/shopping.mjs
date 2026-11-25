import agentList from './agents.json';
import exchange from './rates.json';
import {purchaseUrl, sourceOrigin} from './catalog.mjs';

export const agents = agentList;
export const currencies = Object.keys(exchange.rates).sort();
export const rateDate = exchange.date;
const defaultOptions = {agent: 'lolobuy', currency: 'USD'};
const optionsKey = 'lolobuy-shopping';
const savedKey = 'lolobuy-saved';
const formats = new Map();
let sessionOptions = null;

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
  const saved = sessionOptions ?? stored(optionsKey, defaultOptions);
  return {
    agent: agents.some(({id}) => id === saved.agent) ? saved.agent : defaultOptions.agent,
    currency: currencies.includes(saved.currency) ? saved.currency : defaultOptions.currency,
  };
}

export function updateShopping(patch) {
  sessionOptions = {...shoppingOptions(), ...patch};
  write(optionsKey, sessionOptions);
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
  if (!agent || agentId === 'lolobuy') return {name: 'Buy on LoloBuy', url: purchaseUrl(itemId), sponsored: true};
  return {name: 'Buy on ' + agent.name, url: agent.template.replaceAll('{productId}', encodeURIComponent(itemId)), sponsored: true};
}

export function savedItems() {
  const ids = stored(savedKey, []);
  return Array.isArray(ids) ? ids : [];
}

export function toggleSaved(id) {
  const items = savedItems();
  const updated = items.includes(id) ? items.filter((item) => item !== id) : [id, ...items];
  write(savedKey, updated);
  window.dispatchEvent(new Event('saved-change'));
}
