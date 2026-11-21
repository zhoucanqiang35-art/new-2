import { agentAction, agentByKey, agentUrl, currentAgent } from './agents.mjs';
import { getCurrency, preference, priceLabel, savePreference, setCurrency } from './currency.mjs';
import { itemUrl } from './catalog.mjs';
import { element } from './dom.mjs';

const settings = document.querySelector('#shopping-settings');
const favoritesDialog = document.querySelector('#favorites-dialog');
const favoriteList = document.querySelector('#favorite-list');
const selectedAgentLabel = document.querySelector('[data-selected-agent]');
const agentOptions = [...document.querySelectorAll('[data-select-agent]')];
const currencyOptions = [...document.querySelectorAll('[data-select-currency]')];
let activeAgent = currentAgent();
setCurrency(preference('currency', 'USD'));

function updateSettings() {
  if (selectedAgentLabel) selectedAgentLabel.textContent = agentByKey[activeAgent].name;
  const currency = getCurrency();
  for (const option of agentOptions) option.setAttribute('aria-pressed', String(option.dataset.selectAgent === activeAgent));
  for (const option of currencyOptions) option.setAttribute('aria-pressed', String(option.dataset.selectCurrency === currency));
  for (const node of document.querySelectorAll('[data-currency-code]')) node.textContent = currency;
  for (const node of document.querySelectorAll('[data-price-cny]')) node.textContent = priceLabel(node.dataset.priceCny);
  for (const link of document.querySelectorAll('[data-agent-product]')) {
    const { agentProduct, sourcePath } = link.dataset;
    link.href = agentUrl(activeAgent, agentProduct, sourcePath);
    link.textContent = agentAction(activeAgent);
  }
}

let favorites;
try {
  const stored = JSON.parse(preference('favorites', '[]'));
  favorites = Array.isArray(stored) ? stored.filter(item => /^\d{5,20}$/.test(item?.weidianId ?? '') && typeof item.name === 'string') : [];
} catch { favorites = []; }

function updateFavorites() {
  const counter = document.querySelector('[data-favorite-count]');
  if (counter) {
    counter.hidden = favorites.length === 0;
    counter.textContent = favorites.length;
  }
  const button = document.querySelector('[data-save-product]');
  if (button?.dataset.saveProduct) {
    const saved = favorites.some(item => item.weidianId === button.dataset.saveProduct);
    button.setAttribute('aria-pressed', String(saved));
    button.textContent = saved ? 'Saved to favorites' : 'Save product';
  }
  if (!favoritesDialog?.open) return;
  favoriteList.replaceChildren();
  if (!favorites.length) favoriteList.append(element('p', {}, 'Save an item from its product page to find it here.'));
  for (const item of favorites) {
    const row = element('div', { className: 'favorite-row' });
    const remove = element('button', { className: 'button outline', type: 'button' }, 'Remove');
    remove.setAttribute('aria-label', 'Remove ' + item.name);
    remove.addEventListener('click', () => toggleFavorite(item));
    row.append(element('a', { className: 'text-link', href: itemUrl(item.weidianId), translate: false }, item.name), remove);
    favoriteList.append(row);
  }
}

function toggleFavorite(item) {
  const index = favorites.findIndex(saved => saved.weidianId === item.weidianId);
  if (index >= 0) favorites.splice(index, 1);
  else favorites.unshift(item);
  savePreference('favorites', JSON.stringify(favorites));
  updateFavorites();
}

settings?.addEventListener('click', event => {
  const agent = event.target.closest('[data-select-agent]')?.dataset.selectAgent;
  const currency = event.target.closest('[data-select-currency]')?.dataset.selectCurrency;
  if (agent) {
    activeAgent = agent;
    savePreference('agent', agent);
  } else if (currency) {
    setCurrency(currency);
    savePreference('currency', currency);
  } else return;
  updateSettings();
});
document.addEventListener('click', event => {
  if (settings && !settings.contains(event.target)) settings.open = false;
  const button = event.target.closest('[data-save-product]');
  if (button?.dataset.saveProduct) toggleFavorite({ weidianId: button.dataset.saveProduct, name: button.dataset.productName });
});
settings?.addEventListener('keydown', event => {
  if (event.key === 'Escape' && settings.open) {
    settings.open = false;
    settings.querySelector('summary').focus();
  }
});
document.querySelector('[data-open-favorites]')?.addEventListener('click', () => {
  favoritesDialog.showModal();
  updateFavorites();
});
document.addEventListener('product:ready', () => {
  updateSettings();
  updateFavorites();
});
updateSettings();
updateFavorites();
