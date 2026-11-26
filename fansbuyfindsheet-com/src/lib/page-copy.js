const templates = new Map();
const attributes = new Map();
const dictionaries = new Map();
let language = 'en';
let messages = {};
let pageReady = false;

function phrase(source, values = []) {
  const text = Object.hasOwn(messages, source) ? messages[source] : source;
  return text.replace(/\[V(\d+)\]/g, (_, index) => {
    const value = values[index];
    return typeof value === 'number' ? new Intl.NumberFormat(language).format(value) : value ?? '';
  });
}

function renderCopy(node, { source, inline, values }) {
  if (!inline?.length) {
    node.textContent = phrase(source, values);
    return;
  }

  // Reuse the page's own elements so translated copy cannot alter links or insert HTML.
  const fragment = document.createDocumentFragment();
  let parent = fragment;
  const stack = [];
  for (const part of phrase(source).split(/(\[\/?A\d+\])/)) {
    if (/^\[\/A\d+\]$/.test(part)) {
      parent = stack.pop();
    } else if (/^\[A\d+\]$/.test(part)) {
      const child = inline[Number(part.slice(2, -1))].cloneNode(false);
      parent.append(child);
      stack.push(parent);
      parent = child;
    } else {
      parent.append(part);
    }
  }
  node.replaceChildren(fragment);
}

export function setCopy(node, source, ...values) {
  const copy = { source, values };
  templates.set(node, copy);
  renderCopy(node, copy);
}

export function clearCopy(node) {
  templates.delete(node);
}

export function setCopyAttribute(node, name, source, ...values) {
  const copy = attributes.get(node) ?? {};
  copy[name] = { source, values };
  attributes.set(node, copy);
  node.setAttribute(name, phrase(source, values));
}

function collectPageCopy() {
  if (pageReady) return;
  pageReady = true;
  for (const node of document.querySelectorAll('title, [data-copy]')) {
    const inline = [];
    const encode = parent => Array.from(parent.childNodes, child => {
      if (child.nodeType === Node.TEXT_NODE) return child.textContent;
      if (child.nodeType !== Node.ELEMENT_NODE) return '';
      const index = inline.push(child) - 1;
      return `[A${index}]${encode(child)}[/A${index}]`;
    }).join('');
    templates.set(node, { source: encode(node).replace(/\s+/g, ' ').trim(), inline });
  }

  for (const node of document.querySelectorAll('[data-copy-attrs]')) {
    const names = node.dataset.copyAttrs || 'aria-label alt placeholder content';
    for (const name of names.split(' ')) {
      const source = node.getAttribute(name);
      if (source) setCopyAttribute(node, name, source);
    }
  }
}

export async function applyPageCopy(locale) {
  collectPageCopy();
  language = locale;
  if (locale === 'en') {
    messages = {};
  } else {
    if (!dictionaries.has(locale)) {
      dictionaries.set(locale, fetch('/locales/' + locale + '.json').then(response => {
        if (!response.ok) throw new Error('Page translations unavailable');
        return response.json();
      }).catch(error => {
        dictionaries.delete(locale);
        throw error;
      }));
    }
    try {
      const next = await dictionaries.get(locale);
      if (language !== locale) return;
      messages = next;
    } catch {
      if (language !== locale) return;
      messages = {};
    }
  }

  for (const [node, copy] of templates) {
    if (node.isConnected) renderCopy(node, copy);
    else templates.delete(node);
  }
  for (const [node, copy] of attributes) {
    if (!node.isConnected) {
      attributes.delete(node);
      continue;
    }
    for (const [name, { source, values }] of Object.entries(copy)) {
      node.setAttribute(name, phrase(source, values));
    }
  }
  document.dispatchEvent(new Event('fansbuy-copychange'));
}
