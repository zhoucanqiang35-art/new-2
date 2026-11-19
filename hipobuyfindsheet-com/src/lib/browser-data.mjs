import { productUrl } from './catalog.mjs';
import { copy } from './messages.mjs';

const reads = new Map();
export function readJson(path) {
  if (!reads.has(path)) {
    reads.set(path, fetch(path).then((response) => {
      if (!response.ok) throw new Error('Catalog request failed');
      return response.json();
    }).catch((error) => {
      reads.delete(path);
      throw error;
    }));
  }
  return reads.get(path);
}

export function parseId(input) {
  const text = input.trim();
  if (/^\d{5,18}$/.test(text)) return text;
  try {
    const url = new URL(text);
    if (/^(?:www\.)?weidian\.com$/i.test(url.hostname)) {
      return /^\d{5,18}$/.test(url.searchParams.get('itemID') ?? '') ? url.searchParams.get('itemID') : '';
    }
    if (/^(?:www\.)?hipobuy\.com$/i.test(url.hostname)) {
      return /^\/product\/weidian\/(\d{5,18})\/?$/.exec(url.pathname)?.[1] ?? '';
    }
  } catch {
    return '';
  }
  return '';
}

export function element(tag, properties = {}, children = []) {
  const node = Object.assign(document.createElement(tag), properties);
  node.append(...children);
  return node;
}

export function localize(node, key, args = [], attribute) {
  const text = copy(key, ...args);
  if (args.length) node.dataset.i18nArgs = JSON.stringify(args);
  if (!attribute) {
    node.dataset.i18n = key;
    node.textContent = text;
  } else {
    node.setAttribute('data-i18n-' + attribute, key);
    node.setAttribute(attribute === 'label' ? 'aria-label' : attribute, text);
  }
  return node;
}

export function ui(tag, key, properties = {}, ...args) {
  return localize(element(tag, properties), key, args);
}

export function external(text, href, className = '') {
  return element('a', {textContent: text, href, target: '_blank', rel: 'noopener noreferrer', className});
}

export function imageLink(src, alt) {
  const anchor = external('', src);
  anchor.append(element('img', {src, alt, loading: 'lazy'}));
  return anchor;
}

export function favoriteButton(product, className = 'favorite-icon') {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('width', '18');
  icon.setAttribute('height', '18');
  icon.setAttribute('aria-hidden', 'true');
  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  shape.setAttribute('d', 'M20.8 8.6c0 4.3-8.8 9.5-8.8 9.5S3.2 12.9 3.2 8.6a4.3 4.3 0 0 1 8.8-.3 4.4 4.4 0 0 1 8.8.3Z');
  icon.append(shape);
  const button = localize(element('button', {type: 'button', className}, [icon]), 'save', [], 'label');
  button.dataset.favorite = product.weidianId;
  button.setAttribute('aria-pressed', 'false');
  return button;
}

export function referencePrice(tag, price, className) {
  const node = element(tag, {className, textContent: '¥' + price});
  node.dataset.priceAmount = price;
  return node;
}

export function card(product, matchPhoto) {
  const href = productUrl(product.weidianId);
  const picture = element('img', {src: matchPhoto || product.image, alt: product.name, loading: 'lazy', width: 350, height: 300});
  if (matchPhoto && matchPhoto !== product.image) picture.addEventListener('error', () => { picture.src = product.image; }, {once: true});
  return element('article', {className: 'product-card'}, [
    element('div', {className: 'product-media'}, [element('a', {href, className: 'product-photo'}, [picture]), favoriteButton(product)]),
    element('div', {className: 'product-info'}, [
      ui('span', 'category.' + product.category, {className: 'product-category'}),
      element('a', {href, className: 'product-name', textContent: product.name}),
      ...(product.price ? [referencePrice('strong', product.price, 'product-price')] : []),
    ]),
  ]);
}

export async function qcLookup(id) {
  const [featured, checks] = await Promise.all([
    readJson('/data/qc-featured.json'), readJson('/data/qc.json'),
  ]);
  return featured[id] ?? checks[id];
}

export function renderQc(target, id, entry) {
  const images = entry?.images ?? [];
  if (images.length) {
    target.append(ui('p', 'qcFor', {}, id));
    target.append(element('div', {className: 'qc-grid'}, images.map(({url, agent}, i) => {
      const photo = imageLink(url, '');
      localize(photo.querySelector('img'), 'qcPhoto', [i + 1, id], 'alt');
      return element('figure', {}, [photo, ...(agent ? [ui('figcaption', 'warehouseSource', {}, agent)] : [])]);
    })));
    return;
  }
  target.append(ui('p', entry?.status === 'none' ? 'qcNone' : 'qcUnsaved'));
}
