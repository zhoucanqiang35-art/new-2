import { formatMoney, hasCurrency } from './money';
import { locales, translate } from './translations';

const key = 'ponybuy-preferences-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch {}
let locale = Object.hasOwn(locales, saved.locale) ? saved.locale : 'en';
let currency = hasCurrency(saved.currency) ? saved.currency : locales[locale][1];

const originals = new WeakMap();
const attributeOriginals = new WeakMap();
const excluded = '[data-no-translate], [data-price-value], script, style, template';
const textExcluded = excluded + ', [data-ui-text]';

export function ui(message, replacements = {}) {
  let result = translate(locale, message);
  for (const [name, value] of Object.entries(replacements)) result = result.replaceAll('{' + name + '}', String(value));
  return result;
}

export function setUiText(element, message, replacements = {}) {
  if (!element) return;
  element.dataset.uiText = message;
  element.dataset.uiValues = JSON.stringify(replacements);
  const result = ui(message, replacements);
  if (element.textContent !== result) element.textContent = result;
}

export function refreshPrices(element) {
  const price = formatMoney(element.dataset.priceValue, element.dataset.priceSource, currency, locale);
  if (price && price !== element.textContent) element.textContent = price;
}

function translateTree(root) {
  if (!(root instanceof Element) || root.closest(excluded)) return;
  const nodes = [root, ...root.querySelectorAll('[placeholder], [aria-label], [title], [data-ui-text], [data-price-value]')];
  for (const element of nodes) {
    if (element.hasAttribute('data-price-value')) {
      refreshPrices(element);
      continue;
    }
    if (element.closest(excluded)) continue;
    if (element.dataset.uiText) setUiText(element, element.dataset.uiText, JSON.parse(element.dataset.uiValues || '{}'));
    let stored = attributeOriginals.get(element);
    if (!stored) {
      stored = Object.fromEntries(['placeholder', 'aria-label', 'title'].filter((attr) => element.hasAttribute(attr)).map((attr) => [attr, element.getAttribute(attr)]));
      attributeOriginals.set(element, stored);
    }
    for (const [attr, english] of Object.entries(stored)) {
      const next = attr === 'aria-label' && element.dataset.ariaLabel ? ui(element.dataset.ariaLabel, { count: element.dataset.ariaCount }) : ui(english);
      if (element.getAttribute(attr) !== next) element.setAttribute(attr, next);
    }
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.closest(textExcluded)) continue;
    const original = originals.get(node) ?? node.nodeValue;
    const text = original.trim();
    if (!text) continue;
    originals.set(node, original);
    const next = original.replace(text, () => ui(text));
    if (node.nodeValue !== next) node.nodeValue = next;
  }
}

function repaint() {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  translateTree(document.body);
  try { localStorage.setItem(key, JSON.stringify({ locale, currency })); } catch {}
}

function start() {
  const pickers = [...document.querySelectorAll('[data-preference]')];

  function syncPickers() {
    for (const picker of pickers) {
      const isLanguage = picker.dataset.preference === 'language';
      const current = isLanguage ? locale : currency;
      picker.querySelector('[data-preference-current]').textContent = isLanguage ? locales[locale][0] : currency;
      for (const button of picker.querySelectorAll('[data-preference-value]')) {
        button.setAttribute('aria-pressed', String(button.dataset.preferenceValue === current));
      }
    }
  }

  for (const picker of pickers) {
    const summary = picker.querySelector('summary');
    summary.addEventListener('click', () => {
      for (const other of pickers) if (other !== picker) other.open = false;
    });
    picker.addEventListener('click', (event) => {
      const value = event.target.closest('[data-preference-value]')?.dataset.preferenceValue;
      if (!value) return;
      if (picker.dataset.preference === 'language' && Object.hasOwn(locales, value)) {
        locale = value;
        currency = locales[value][1];
      } else if (picker.dataset.preference === 'currency' && hasCurrency(value)) {
        currency = value;
      }
      picker.open = false;
      summary.focus();
      syncPickers();
      repaint();
    });
    picker.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !picker.open) return;
      event.preventDefault();
      picker.open = false;
      summary.focus();
    });
  }
  document.addEventListener('click', (event) => {
    for (const picker of pickers) if (!picker.contains(event.target)) picker.open = false;
  });
  syncPickers();
  repaint();
  new MutationObserver((changes) => {
    for (const change of changes) {
      for (const node of change.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.hasAttribute('data-price-value')) refreshPrices(node);
        else if (!node.closest('[data-ui-text]')) translateTree(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
