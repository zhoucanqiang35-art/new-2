import {isShopItem} from './landing-paths.mjs';
import {categoryLabel, productImage, productUrl, purchaseUrl} from './catalog.mjs';
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
async function readSavedQc(id) {
  qcData ??= readJson('/data/qc.json').catch((error) => { qcData = undefined; throw error; });
  return (await qcData)[id];
}

export async function showQc(target, id, signal) {
  target.textContent = 'Checking warehouse QC…';
  target.setAttribute('aria-busy', 'true');
  try {
    const live = await fetch('/api/product-media?type=qc&id=' + encodeURIComponent(id), {signal})
      .then((response) => {
        if (!response.ok) throw new Error('Live QC unavailable');
        return response.json();
      }).catch(() => null);
    if (signal.aborted) return;
    const saved = live ? undefined : await readSavedQc(id).catch(() => undefined);
    if (signal.aborted) return;

    const photos = live?.status === 'ready' && Array.isArray(live.photos) ? live.photos : [];
    const record = live ?? saved;
    const heading = photos.length ? 'Warehouse QC photos' :
      record?.status === 'pending' ? 'QC check pending' :
      record?.status === 'none' ? 'No warehouse QC photos available' : 'QC lookup temporarily unavailable';
    const children = [
      element('p', {}, [element('strong', {textContent: heading})]),
    ];
    if (!live && saved) {
      children.push(element('p', {textContent: 'Live QC is temporarily unavailable. Showing the last saved status.'}));
    } else if (!live) {
      children.push(element('p', {textContent: 'Try again in a moment or check the item on EastMallBuy.'}));
    }
    if (photos.length) {
      children.push(element('div', {className: 'qc-grid'}, photos.map((photo, index) => {
        const label = 'Warehouse QC photo ' + (index + 1);
        const link = external('', photo);
        link.append(element('img', {src: photo, alt: label, loading: 'lazy', decoding: 'async', width: 240, height: 240}));
        return link;
      })));
    }
    children.push(element('div', {className: 'actions'}, [
      element('a', {textContent: 'View product details', className: 'button outline', href: productUrl(id)}),
      external('Open on EastMallBuy', purchaseUrl(id), 'button outline'),
    ]));
    target.replaceChildren(...children);
  } finally {
    if (!signal.aborted) target.removeAttribute('aria-busy');
  }
}
