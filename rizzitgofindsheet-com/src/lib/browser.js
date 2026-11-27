import { categoryNames, price, productPath, productImage } from './shared.js';

let catalogRequest;
export function catalog() {
  catalogRequest ??= fetch('/data/catalog.json').then(async (response) => {
    if (!response.ok) throw new Error('Catalog unavailable');
    return { items: await response.json() };
  }).catch((error) => {
    catalogRequest = undefined;
    throw error;
  });
  return catalogRequest;
}

export function makeCard(item) {
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = '<a class="card-link"><div class="card-image"><img width="360" height="300" loading="lazy" decoding="async"></div><div class="card-text"><small></small><h3></h3><strong></strong></div></a>';
  card.querySelector('a').href = productPath(item.id);
  const image = card.querySelector('img');
  image.src = productImage(item);
  image.alt = item.name;
  image.dataset.catalogCopy = '';
  card.querySelector('small').textContent = categoryNames[item.category] || 'Finds';
  const title = card.querySelector('h3');
  title.dataset.catalogCopy = '';
  title.textContent = item.name;
  const amount = card.querySelector('strong');
  amount.dataset.priceCny = item.price;
  amount.textContent = price(item.price);
  return card;
}
