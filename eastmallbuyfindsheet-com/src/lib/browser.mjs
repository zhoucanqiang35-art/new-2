import {categoryLabel, productImage, productUrl, sourceOrigin} from './catalog.mjs';
import {priceFor, shoppingOptions} from './shopping.mjs';

export async function readJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Data unavailable');
  return response.json();
}

export function element(tag, properties = {}, children = []) {
  const node = Object.assign(document.createElement(tag), properties);
  node.append(...children);
  return node;
}

export function referencePrice(amount) {
  const text = priceFor(amount, shoppingOptions().currency);
  if (!text) return null;
  const price = element('strong', {textContent: text, className: 'reference-price'});
  price.dataset.referencePrice = amount;
  return price;
}

export function card(product, matchedPhoto) {
  const primary = productImage(product);
  const price = referencePrice(product.price);
  const image = element('img', {src: matchedPhoto || primary, alt: product.name, translate: false, loading: 'lazy', width: 350, height: 280});
  if (matchedPhoto && matchedPhoto !== primary) image.addEventListener('error', () => { image.src = primary; }, {once: true});
  return element('a', {href: productUrl(product.weidianId), className: 'product-card'}, [
    element('div', {className: 'product-pic'}, [image]),
    element('div', {className: 'product-info'}, [
      element('small', {textContent: categoryLabel(product.category)}),
      element('strong', {textContent: product.name, translate: false}),
      ...(price ? [price] : []),
    ]),
  ]);
}

export function external(text, href, className = '') {
  return element('a', {textContent: text, href, target: '_blank', rel: 'noopener', className});
}

let qcData;
export async function showQc(target, id, sourcePath = '') {
  target.textContent = 'Checking saved QC records…';
  try {
    qcData ??= Promise.all([readJson('/data/qc-featured.json'), readJson('/data/qc.json')])
      .catch((error) => { qcData = undefined; throw error; });
    const [photos, checks] = await qcData;
    if (target.dataset.item && target.dataset.item !== id) return;
    const record = photos[id] ?? checks[id];
    if (record?.status === 'available') {
      const publishedQc = new URL('/image-search/', 'https://eastmallbuyfindsheet-preview.zhoucanqiang35.chatgpt.site');
      publishedQc.searchParams.set('id', id);
      publishedQc.hash = 'qc-finder';
      target.replaceChildren(
        element('p', {textContent: 'Historical warehouse photos for Weidian item ' + id + '.'}),
        external('View QC example', publishedQc.href, 'button outline'),
      );
      if (sourcePath) target.append(external('Check the current listing on Findspreadsheet', new URL(sourcePath, sourceOrigin).href));
      return;
    }
    const message = {none: 'The saved QC check found no warehouse photos for this item.', pending: 'The last saved QC check was pending.'};
    target.replaceChildren(element('p', {textContent: message[record?.status] ?? 'This item has no saved QC record here.'}));
    if (sourcePath) target.append(external('Check the current listing on Findspreadsheet', new URL(sourcePath, sourceOrigin).href));
  } catch {
    if (!target.dataset.item || target.dataset.item === id) target.textContent = 'Saved QC records could not load. Try again in a moment.';
  }
}
