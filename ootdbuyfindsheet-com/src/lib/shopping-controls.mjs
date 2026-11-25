import { currencyByLanguage } from './languages.mjs';
import { defaultCurrency, getCurrency, preference, priceLabel, savePreference, setCurrency } from './currency.mjs';
import { itemUrl } from './settings.mjs';
import { element } from './dom.mjs';

const picker = document.querySelector('#site-currency');
const currencySummary = picker.querySelector('summary');
const currencyOptions = [...picker.querySelectorAll('[data-select-currency]')];
const favoritesDialog = document.querySelector('#favorites-dialog');
const favoriteList = document.querySelector('#favorite-list');
const preferredLanguageCurrency = () => {
  const locale = preference('language', 'en');
  return currencyByLanguage[locale === 'zh-Hant' ? 'zh-Hans' : locale] ?? defaultCurrency;
};
setCurrency(preference('currency', preferredLanguageCurrency()));

function updatePrices() {
  const currency = getCurrency();
  for (const option of currencyOptions) option.setAttribute('aria-pressed', String(option.dataset.selectCurrency === currency));
  for (const node of document.querySelectorAll('[data-currency-code]')) node.textContent = currency;
  for (const node of document.querySelectorAll('[data-price-cny]')) node.textContent = priceLabel(node.dataset.priceCny);
}

function chooseCurrency(currency) {
  setCurrency(currency);
  savePreference('currency', currency);
  updatePrices();
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
    row.append(element('a', { className: 'text-link', href: itemUrl(item.weidianId) }, item.name), remove);
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

picker.addEventListener('click', event => {
  const currency = event.target.closest('[data-select-currency]')?.dataset.selectCurrency;
  if (!currency) return;
  chooseCurrency(currency);
  picker.open = false;
  currencySummary.focus();
});
picker.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !picker.open) return;
  picker.open = false;
  currencySummary.focus();
});
document.addEventListener('language:changed', () => chooseCurrency(preferredLanguageCurrency()));
document.addEventListener('click', event => {
  if (picker.open && !picker.contains(event.target)) picker.open = false;
  const button = event.target.closest('[data-save-product]');
  if (button?.dataset.saveProduct) toggleFavorite({ weidianId: button.dataset.saveProduct, name: button.dataset.productName });
});
document.querySelector('[data-open-favorites]')?.addEventListener('click', () => {
  favoritesDialog.showModal();
  updateFavorites();
});
document.addEventListener('product:ready', () => {
  updatePrices();
  updateFavorites();
});
updatePrices();
updateFavorites();
