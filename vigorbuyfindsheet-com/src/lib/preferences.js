import { languages, label } from './locale';
import { currencies, price } from './money';

const storageKey = 'vigorbuy-preferences';

function readPreference() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return {
      language: Object.hasOwn(languages, saved.language) ? saved.language : 'en',
      currency: currencies.includes(saved.currency) ? saved.currency : 'USD',
    };
  } catch {
    return { language: 'en', currency: 'USD' };
  }
}

const preferences = readPreference();

export function translate(key, fallback) {
  return label(preferences.language, key) || fallback;
}

export function paintPrice(node, amount) {
  node.dataset.cny = String(amount);
  node.textContent = price(amount, preferences.currency, preferences.language);
}

function apply(root) {
  document.documentElement.lang = preferences.language;
  for (const node of document.querySelectorAll('[data-t]')) {
    node.textContent = translate(node.dataset.t, node.textContent);
  }
  for (const node of document.querySelectorAll('[data-t-aria]')) {
    const suffix = node.dataset.tAriaSuffix ? ' ' + node.dataset.tAriaSuffix : '';
    node.setAttribute('aria-label', translate(node.dataset.tAria, '') + suffix);
  }
  for (const input of document.querySelectorAll('[data-t-placeholder]')) {
    input.placeholder = translate(input.dataset.tPlaceholder, input.placeholder);
  }
  for (const node of document.querySelectorAll('[data-cny]')) paintPrice(node, node.dataset.cny);
  for (const node of document.querySelectorAll('[data-currency-code]')) node.textContent = preferences.currency;

  const languageButton = root.querySelector('[data-active-language]');
  const currencyButton = root.querySelector('[data-active-currency]');
  languageButton.textContent = languages[preferences.language][0];
  currencyButton.textContent = preferences.currency;
  languageButton.setAttribute('aria-label', translate('language', 'Language') + ': ' + languageButton.textContent);
  currencyButton.setAttribute('aria-label', translate('currency', 'Currency') + ': ' + currencyButton.textContent);
  for (const option of root.querySelectorAll('[data-language]')) option.setAttribute('aria-pressed', String(option.dataset.language === preferences.language));
  for (const option of root.querySelectorAll('[data-currency]')) option.setAttribute('aria-pressed', String(option.dataset.currency === preferences.currency));
  try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch {}
}

export function initPreferences() {
  const root = document.querySelector('[data-preferences]');
  if (!root) return;
  const menus = [...root.querySelectorAll('details')];

  for (const menu of menus) menu.addEventListener('toggle', () => {
    if (menu.open) for (const other of menus) if (other !== menu) other.open = false;
  });
  root.addEventListener('click', (event) => {
    const option = event.target.closest('button[data-language], button[data-currency]');
    if (!option) return;
    if (option.dataset.language) preferences.language = option.dataset.language;
    if (option.dataset.currency) preferences.currency = option.dataset.currency;
    const menu = option.closest('details');
    menu.open = false;
    apply(root);
    menu.querySelector('summary').focus();
  });
  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) for (const menu of menus) menu.open = false;
  });
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const menu = menus.find((node) => node.open);
    if (menu) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  apply(root);
}

export function currentCurrency() {
  return preferences.currency;
}
