import {isShopItem} from './landing-paths.mjs';
import {categoryLabel, productImage, productUrl, sourceOrigin} from './catalog.mjs';
import {priceFor, shoppingOptions} from './shopping.mjs';

export async function readJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Data unavailable');
  return response.json();
}

let catalogData;
export function readCatalog() {
  catalogData ??= readJson('/data/catalog.json')
    .then((items) => items.filter((item) => isShopItem(item.weidianId)))
    .catch((error) => { catalogData = undefined; throw error; });
  return catalogData;
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
export async function readQc(id) {
  qcData ??= Promise.all([readJson('/data/qc-featured.json'), readJson('/data/qc.json')])
    .catch((error) => { qcData = undefined; throw error; });
  const [photos, checks] = await qcData;
  return photos[id] ?? checks[id];
}

export async function showQc(target, id, sourcePath = '') {
  target.textContent = 'Checking saved QC records…';
  try {
    const record = await readQc(id);
    if (target.dataset.item && target.dataset.item !== id) return;
    const destinations = [];
    let heading;
    let explanation;
    if (record?.status === 'available') {
      heading = 'Historical QC available';
      explanation = 'The saved photos are hosted on the EastMallBuy Findsheet preview.';
      const publishedQc = new URL('/image-search/', 'https://eastmallbuyfindsheet-preview.zhoucanqiang35.chatgpt.site');
      publishedQc.searchParams.set('id', id);
      publishedQc.hash = 'qc-finder';
      destinations.push(external('View saved QC on the preview site', publishedQc.href, 'button outline'));
    } else if (record?.status === 'pending') {
      heading = 'QC check pending';
      explanation = 'The last saved QC check was pending.';
    } else {
      heading = 'No saved QC record here';
      explanation = record?.status === 'none' ? 'The saved QC check found no warehouse photos for this item.' :
        'Check the current listing for newer warehouse photos.';
    }
    if (sourcePath) destinations.push(external('Check the current listing on Findspreadsheet', new URL(sourcePath, sourceOrigin).href, 'button outline'));
    target.replaceChildren(element('p', {}, [element('strong', {textContent: heading})]), element('p', {textContent: explanation}),
      ...(destinations.length ? [element('div', {className: 'actions'}, destinations)] : []));
  } catch {
    if (!target.dataset.item || target.dataset.item === id) target.textContent = 'Saved QC records could not load. Try again in a moment.';
  }
}
