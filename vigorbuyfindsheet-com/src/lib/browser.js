import { names as categoryNames, price, warehouse } from './site';
import { paintPrice, translate } from './preferences';
export { categoryNames };

function text(tag, value, className) {
  const result = document.createElement(tag);
  result.textContent = value;
  if (className) result.className = className;
  return result;
}
export function makeCard(item) {
  const card = document.createElement('a');
  card.className = 'product-card';
  card.href = '/products/' + item.id + '/';
  const media = document.createElement('div');
  media.className = 'product-photo';
  const image = document.createElement('img');
  image.src = item.image;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  media.append(image);
  const photos = warehouse[item.id]?.length;
  if (photos) media.append(text('span', photos + ' QC photos', 'photo-tag'));
  const body = document.createElement('div');
  body.className = 'product-copy';
  const category = text('div', translate('cat:' + item.category, categoryNames[item.category] || 'Product'), 'product-category');
  category.dataset.t = 'cat:' + item.category;
  body.append(category, text('h3',item.name));
  if (price(item.price)) {
    const amount = text('p', '', 'product-price');
    paintPrice(amount, item.price);
    body.append(amount);
  }
  card.append(media,body);
  return card;
}
export async function catalog() {
  const response = await fetch('/data/catalog.json');
  if (!response.ok) throw new Error('Catalog unavailable');
  const items = await response.json();
  return { items, byId: new Map(items.map((item) => [item.id, item])) };
}
