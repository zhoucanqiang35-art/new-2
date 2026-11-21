import { agents } from './agents.mjs';
import { languages } from './languages.mjs';
import { preference, savePreference } from './currency.mjs';

const controls = document.querySelector('#site-language');
const status = document.querySelector('#language-status');
const supported = new Set(languages.map(([locale]) => locale));
const skipped = 'script, style, noscript, [translate="no"], [data-price-cny], [data-currency-code], #language-status';
const attributes = ['placeholder', 'aria-label', 'alt', 'title'];
const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const names = agents.map(agent => agent.name).sort((a, b) => b.length - a.length);
let dictionary = {};
let active = 'en';
let request = 0;
const normalize = source => source.replace(/\s+/g, ' ').trim();

function translated(source) {
  const agent = names.find(name => source === 'Buy on ' + name);
  if (agent && dictionary['Buy on ZZ1ZZ']) return dictionary['Buy on ZZ1ZZ'].replace('ZZ1ZZ', agent);
  const parts = [];
  const pattern = source.replace(/\d+(?:,\d{3})*/g, part => 'ZZ' + parts.push(part) + 'ZZ');
  if (parts.length && Object.hasOwn(dictionary, pattern) && dictionary[pattern] !== pattern) {
    return dictionary[pattern].replace(/ZZ(\d+)ZZ/g, (_, index) => parts[Number(index) - 1] ?? '');
  }
  return Object.hasOwn(dictionary, source) ? dictionary[source] : source;
}

function apply(node) {
  if (node instanceof Element) {
    if (node.closest(skipped)) return;
    let originals = originalAttributes.get(node);
    for (const attr of attributes) {
      const value = node.getAttribute(attr);
      if (!value?.trim()) continue;
      const saved = originals?.get(attr);
      const source = saved?.translated === value ? saved.source : value;
      const next = translated(normalize(source));
      if (next === value) continue;
      originals ??= new Map();
      originals.set(attr, { source, translated: next });
      originalAttributes.set(node, originals);
      node.setAttribute(attr, next);
    }
  } else if (node instanceof Text) {
    if (node.parentElement?.closest(skipped) || !node.data.trim()) return;
    const source = originalText.get(node) ?? node.data;
    const next = source.replace(/\S(?:[\s\S]*\S)?/, text => translated(normalize(text)));
    if (next !== node.data) {
      originalText.set(node, source);
      node.data = next;
    }
  }
  for (const child of node.childNodes) apply(child);
}

async function setLanguage(locale) {
  if (!supported.has(locale)) return;
  const id = ++request;
  try {
    let next = {};
    if (locale !== 'en') {
      const response = await fetch('/data/languages/' + locale + '.json');
      if (!response.ok) throw new Error('Translation unavailable');
      next = await response.json();
    }
    if (id !== request) return;
    dictionary = next;
    active = locale;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    controls.value = locale;
    status.textContent = '';
    apply(document.querySelector('title'));
    apply(document.body);
    savePreference('language', locale);
  } catch {
    if (id !== request) return;
    controls.value = active;
    status.textContent = 'Could not load that language. Please try again.';
  }
}

const observer = new MutationObserver(changes => {
  if (active === 'en') return;
  for (const change of changes) for (const added of change.addedNodes) apply(added);
});
observer.observe(document.body, {childList:true, subtree:true});
observer.observe(document.querySelector('title'), {childList:true});
controls.addEventListener('change', () => void setLanguage(controls.value));
const initial = preference('language', 'en');
if (initial !== 'en') void setLanguage(initial === 'zh-Hant' ? 'zh-Hans' : initial);
