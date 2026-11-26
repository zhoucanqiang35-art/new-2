import { applyPageCopy } from './page-copy.js';
import { controlLabel } from './locale-controls.js';
import { interfaceLabel } from './locale-interface.js';
import { languages, euroRates, keys, money } from './locale.js';

const preferenceKey = 'fansbuy-preferences';

function readPreferences() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(preferenceKey)); } catch {}
  const lang = Object.hasOwn(languages, saved?.lang) ? saved.lang : 'en';
  const currency = Object.hasOwn(euroRates, saved?.currency) ? saved.currency : 'USD';
  const region = Object.hasOwn(languages, saved?.region) && languages[saved.region][1] === currency
    ? saved.region
    : Object.keys(languages).find(code => languages[code][1] === currency);
  return { lang, currency, region };
}

let { lang, currency, region } = readPreferences();

const translations = Object.fromEntries(Object.entries(languages).map(([code, [, , row]]) => [code, row.split('|')]));

export function translate(key) {
  return translations[lang][keys.indexOf(key)] ?? interfaceLabel(lang, key) ?? controlLabel(lang, key) ?? key;
}

export function setLabel(node, key) {
  node.dataset.t = key;
  node.textContent = translate(key);
}
export function paintPrice(node, value) {
  if (!String(value ?? '').trim() || !Number.isFinite(Number(value))) return;
  node.dataset.cny = String(value);
  node.textContent = money(value, lang, currency);
  node.title = translate('reference') + ' · ECB 2026-11-24';
}
function apply() {
  const languageChanged = document.documentElement.lang !== lang;
  document.documentElement.lang = lang;
  for (const node of document.querySelectorAll('[data-t]')) node.textContent = translate(node.dataset.t);
  for (const node of document.querySelectorAll('[data-t-placeholder]')) node.placeholder = translate(node.dataset.tPlaceholder);
  for (const node of document.querySelectorAll('[data-cny]')) paintPrice(node,node.dataset.cny);
  const langButton = document.querySelector('[data-active-language]');
  langButton.textContent = languages[lang][0];
  langButton.setAttribute('aria-label', translate('language') + ': ' + languages[lang][0]);
  const currencyButton = document.querySelector('[data-active-currency]');
  currencyButton.textContent = currency;
  currencyButton.setAttribute('aria-label', translate('currency') + ': ' + currency);
  for (const button of document.querySelectorAll('[data-language]')) button.setAttribute('aria-pressed', String(button.dataset.language === lang));
  for (const button of document.querySelectorAll('[data-region]')) button.setAttribute('aria-pressed', String(button.dataset.region === region));
  if (languageChanged) void applyPageCopy(lang);
}
const selectors = Array.from(document.querySelectorAll('.preferences details'));
for (const details of selectors) {
  details.querySelector('summary').addEventListener('click', () => {
    for (const other of selectors) if (other !== details) other.open = false;
  });
}
document.querySelector('.preferences').addEventListener('click', event => {
  const button = event.target.closest('[data-language], [data-region]');
  if (!button) return;
  if (button.dataset.language) {
    lang = button.dataset.language;
  } else {
    region = button.dataset.region;
    currency = languages[region][1];
  }
  const details = button.closest('details');
  details.open = false;
  try { localStorage.setItem(preferenceKey, JSON.stringify({ lang, currency, region })); } catch {}
  apply();
  details.querySelector('summary').focus({ preventScroll: true });
});
document.addEventListener('click', event => {
  if (!event.target.closest('.preferences')) for (const details of selectors) details.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  for (const details of selectors) if (details.open) {
    details.open = false;
    details.querySelector('summary').focus();
  }
});
function refreshPreferences() {
  ({ lang, currency, region } = readPreferences());
  apply();
}

window.addEventListener('pageshow', event => {
  if (event.persisted) refreshPreferences();
});
window.addEventListener('storage', event => {
  if (event.key === preferenceKey || event.key === null) refreshPreferences();
});
apply();
if (lang === 'en') void applyPageCopy(lang);
