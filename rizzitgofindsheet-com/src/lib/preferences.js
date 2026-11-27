import { languages, translateCopy } from './locales.js';
import { currencies, price } from './shared.js';

const controls = document.querySelector('[data-preferences]');
const textNodes = new WeakMap();
const attributes = new WeakMap();
const excluded = '[data-catalog-copy], [data-price-cny], script, style, noscript, textarea, [aria-hidden="true"]';
const fields = ['placeholder', 'aria-label', 'alt', 'title'];
const dictionaries = new Map([['en', Promise.resolve({})]]);
let dictionary = {};
let language = 'en';
let currency = localStorage.getItem('rizzitgo-currency') || 'USD';
let pending = 0;
if (!currencies.includes(currency)) currency = 'USD';

function updateText(node) {
  if (!node.parentElement || node.parentElement.closest(excluded) || !/\p{L}/u.test(node.data)) return;
  const prev = textNodes.get(node);
  const source = prev && prev.current === node.data ? prev.source : node.data;
  const current = translateCopy(source, dictionary);
  textNodes.set(node, { source, current });
  if (node.data !== current) node.data = current;
}

function updateElement(element) {
  if (element.closest(excluded)) return;
  let tracked = attributes.get(element);
  for (const field of fields) {
    const value = element.getAttribute(field);
    if (!value) continue;
    const prev = tracked?.[field];
    const source = prev && prev.current === value ? prev.source : value;
    const current = translateCopy(source, dictionary);
    tracked ??= {};
    tracked[field] = { source, current };
    if (current !== value) element.setAttribute(field, current);
  }
  if (tracked) attributes.set(element, tracked);
}

function applyCopy(root) {
  if (root.nodeType === Node.TEXT_NODE) { updateText(root); return; }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  updateElement(root);
  for (const element of root.querySelectorAll('[placeholder],[aria-label],[alt],[title]')) updateElement(element);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) updateText(walker.currentNode);
}

function applyPrice(element) {
  const original = price(Number(element.dataset.priceCny), currency, language);
  const formatted = translateCopy(original, dictionary);
  if (element.textContent !== formatted) element.textContent = formatted;
}

function paintControls() {
  controls.querySelector('[data-current-language]').textContent = languages[language];
  controls.querySelector('[data-current-currency]').textContent = currency;
  for (const button of controls.querySelectorAll('[data-language],[data-currency]')) {
    button.setAttribute('aria-pressed', String(button.dataset.language === language || button.dataset.currency === currency));
  }
}

async function selectLanguage(code) {
  if (!Object.hasOwn(languages, code)) return;
  const request = ++pending;
  const status = controls.querySelector('[data-language-status]');
  try {
    if (!dictionaries.has(code)) {
      dictionaries.set(code, fetch('/locales/' + code + '.json').then((response) => {
        if (!response.ok) throw new Error('Language unavailable');
        return response.json();
      }).catch((error) => {
        dictionaries.delete(code);
        throw error;
      }));
    }
    const copy = await dictionaries.get(code);
    if (request !== pending) return;
    dictionary = copy;
    language = code;
    document.documentElement.lang = code;
    localStorage.setItem('rizzitgo-language', code);
    status.textContent = '';
    applyCopy(document.body);
    if (!document.querySelector('[data-product]')) applyCopy(document.querySelector('title'));
    document.querySelectorAll('[data-price-cny]').forEach(applyPrice);
    paintControls();
  } catch {
    if (request === pending) status.textContent = 'Could not load the selected language. Please try again.';
  }
}

controls.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const details = button.closest('details');
  details.open = false;
  details.querySelector('summary').focus();
  if (button.dataset.language) void selectLanguage(button.dataset.language);
  if (button.dataset.currency) {
    currency = button.dataset.currency;
    localStorage.setItem('rizzitgo-currency', currency);
    document.querySelectorAll('[data-price-cny]').forEach(applyPrice);
    paintControls();
  }
});

document.addEventListener('click', (event) => {
  for (const details of controls.querySelectorAll('details[open]')) if (!details.contains(event.target)) details.open = false;
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const details = [...document.querySelectorAll('.preferences details[open], .agent-menu[open]')].find((menu) => menu.contains(document.activeElement));
  if (details) {
    details.open = false;
    details.querySelector('summary').focus();
  }
});

new MutationObserver((changes) => {
  for (const change of changes) {
    if (change.type === 'characterData') updateText(change.target);
    if (change.type === 'attributes') updateElement(change.target);
    for (const node of change.addedNodes) {
      applyCopy(node);
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (node.matches('[data-price-cny]')) applyPrice(node);
      node.querySelectorAll('[data-price-cny]').forEach(applyPrice);
    }
  }
}).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: fields });

paintControls();
document.querySelectorAll('[data-price-cny]').forEach(applyPrice);
void selectLanguage(localStorage.getItem('rizzitgo-language') || 'en');
