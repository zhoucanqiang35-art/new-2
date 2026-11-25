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

export function card(product, matchedPhoto, hasQc = false) {
  const primary = productImage(product);
  const price = referencePrice(product.price);
  const image = element('img', {src: matchedPhoto || primary, alt: product.name, translate: false, loading: 'lazy', width: 350, height: 280});
  if (matchedPhoto && matchedPhoto !== primary) image.addEventListener('error', () => { image.src = primary; }, {once: true});
  return element('a', {href: productUrl(product.weidianId), className: 'product-card'}, [
    element('div', {className: 'product-pic'}, [image, ...(hasQc ? [element('span', {className: 'qc-card-label', textContent: 'QC photos'})] : [])]),
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

async function savedQc(id) {
  qcData ??= Promise.all([readJson('/data/qc-featured.json'), readJson('/data/qc.json')])
    .catch((error) => { qcData = undefined; throw error; });
  const [photos, checks] = await qcData;
  return photos[id] ?? checks[id];
}

async function currentQc(id) {
  const record = await readJson('/api/warehouse-qc?item=' + encodeURIComponent(id));
  if (record.itemId !== id || !['ready', 'none', 'pending'].includes(record.status) || !Array.isArray(record.images)) {
    throw new Error('Invalid warehouse QC response');
  }
  return record;
}

export async function showQc(target, id, sourcePath = '') {
  target.textContent = 'Checking warehouse QC photos…';
  const live = await currentQc(id).catch(() => null);
  const saved = live ? null : await savedQc(id).catch(() => null);
  if (target.dataset.item && target.dataset.item !== id) return;
  const photos = live?.images ?? saved?.images ?? [];
  if (photos.length) {
    const description = live ? 'Warehouse QC photos for Weidian item ' : 'Historical warehouse photos for Weidian item ';
    target.replaceChildren(element('p', {textContent: description + id + '.'}),
      element('div', {className: 'qc-grid'}, photos.map(({url, agent}, index) => {
        const alt = 'Warehouse QC photo ' + (index + 1) + (agent ? ' · ' + agent : '');
        const image = element('img', {src: url, loading: 'lazy', decoding: 'async', alt});
        const link = external('', url);
        link.append(image);
        return link;
      })));
    return;
  }

  const message = {
    none: 'FindSpreadsheet has no published warehouse QC photos for this item.',
    pending: 'The warehouse QC photos are still processing.',
  };
  target.replaceChildren(element('p', {textContent: message[live?.status] ?? 'Warehouse QC photos could not load. Try again in a moment.'}));
  if (sourcePath) target.append(external('Check the current listing on Findspreadsheet', new URL(sourcePath, sourceOrigin).href));
}
