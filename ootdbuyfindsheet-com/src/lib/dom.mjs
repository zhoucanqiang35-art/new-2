import { categories, coverUrl, itemUrl, priceLabel, productCategory } from './settings.mjs';

export function element(tag, properties = {}, text) {
  const node = Object.assign(document.createElement(tag), properties);
  if (text != null) node.textContent = text;
  return node;
}

export async function readJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw Object.assign(new Error('Could not read ' + url), {status:response.status});
  return response.json();
}

export function productPhoto(product) {
  const image = element('img', { src: coverUrl(product), alt: product.name, loading: 'lazy' });
  image.addEventListener('error', () => {
    image.closest('.product-media')?.classList.add('image-unavailable');
    image.hidden = true;
  }, { once: true });
  return image;
}

export function card(product) {
  const link = element('a', { className: 'product-card', href: itemUrl(product.weidianId) });
  const media = element('div', { className: 'product-media' });
  media.append(productPhoto(product));
  const info = element('div', { className: 'product-info' });
  const category = categories[productCategory(product)] ?? 'Other finds';
  info.append(element('span', { className: 'eyebrow' }, category));
  const title = element('strong', {}, product.name);
  title.translate = false;
  info.append(title);
  const price = element('span', { className: 'price' }, priceLabel(product.price));
  price.dataset.priceCny = product.price ?? '';
  info.append(price);
  link.append(media, info);
  return link;
}
