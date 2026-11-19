import { languages, format, copy } from './messages.mjs';

const name = document.getElementById('language-name');
const menu = document.getElementById('language-menu');
const localeCodes = new Set(languages.map(([code]) => code));
const selectors = [
  ['data-i18n', 'textContent'],
  ['data-i18n-label', 'aria-label'],
  ['data-i18n-placeholder', 'placeholder'],
  ['data-i18n-alt', 'alt'],
];
const selector = selectors.map(([attribute]) => '[' + attribute + ']').join(',');
const query = new URLSearchParams(location.search);
let dictionary = {};
let revision = 0;
let active = 'en';

function selectedLanguage() {
  if (localeCodes.has(query.get('lang'))) return query.get('lang');
  try {
    const value = localStorage.getItem('hipobuy.language');
    return localeCodes.has(value) ? value : 'en';
  } catch {
    return 'en';
  }
}

function translate(node) {
  for (const [attribute, target] of selectors) {
    const key = node.getAttribute(attribute);
    if (!key) continue;
    const args = JSON.parse(node.dataset.i18nArgs || '[]');
    const text = dictionary[key] ? format(dictionary[key], args) : copy(key, ...args);
    if (target === 'textContent') {
      if (node.textContent !== text) node.textContent = text;
    } else {
      node.setAttribute(target, text);
    }
  }
}

function translateTree(root) {
  if (root instanceof Element && root.matches(selector)) translate(root);
  root.querySelectorAll?.(selector).forEach(translate);
}

async function select(code, remember) {
  const request = ++revision;
  try {
    const resource = code === 'en' ? {} : await fetch('/locales/' + code + '.json').then((response) => {
      if (!response.ok) throw new Error('Translation request failed');
      return response.json();
    });
    if (request !== revision) return;
    dictionary = resource;
    active = code;
    document.documentElement.lang = code;
    document.documentElement.dir = ['ar', 'he'].includes(code) ? 'rtl' : 'ltr';
    name.textContent = languages.find(([key]) => key === code)[1];
    for (const button of menu.querySelectorAll('[data-language]')) {
      button.setAttribute('aria-pressed', String(button.dataset.language === code));
    }
    document.getElementById('language-status').textContent = '';
    translateTree(document);
    document.dispatchEvent(new CustomEvent('hipobuy:language', {detail: code}));
    if (remember) {
      try { localStorage.setItem('hipobuy.language', code); } catch {}
      if (query.has('lang')) {
        const url = new URL(location.href);
        url.searchParams.set('lang', code);
        history.replaceState(history.state, '', url);
      }
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  } catch {
    if (request !== revision) return;
    document.getElementById('language-status').textContent = 'Unable to load the selected language.';
  }
}

menu.addEventListener('click', (event) => {
  const option = event.target.closest('[data-language]');
  if (option) select(option.dataset.language, true);
});
document.addEventListener('click', (event) => {
  if (menu.open && !menu.contains(event.target)) menu.open = false;
});
menu.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
document.addEventListener('hipobuy:translate', (event) => translateTree(event.target));
new MutationObserver((entries) => {
  if (active === 'en') return;
  for (const entry of entries) for (const node of entry.addedNodes) translateTree(node);
}).observe(document.body, {childList: true, subtree: true});
select(selectedLanguage(), false);
