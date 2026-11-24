import { categoryLabel, detailsUrl, priceLabel, type Product } from './catalog';

export function productCard(product: Product, photo = product.image) {
  const card = document.createElement('article');
  card.className = 'product-card';
  const link = document.createElement('a');
  link.href = detailsUrl(product.weidianId);
  const image = new Image();
  image.decoding='async';image.referrerPolicy='no-referrer';
  image.src = photo;
  image.addEventListener('error',()=>{if(image.src!==product.image)image.src=product.image},{once:true});
  image.alt = product.name;
  image.loading = 'lazy';
  image.width = image.height = 360;
  const info = document.createElement('div');
  info.className = 'product-info';
  const category = document.createElement('span');
  category.className = 'product-category';
  category.textContent = categoryLabel(product.category);
  const title = document.createElement('h3');
  title.textContent = product.name;
  title.dataset.productName = product.weidianId;
  const price = document.createElement('strong');
  price.textContent = priceLabel(product.price);
  price.dataset.priceCny = product.price;
  price.setAttribute('data-i18n-ignore', '');
  info.append(category, title, price);
  link.append(image, info);
  card.append(link);
  return card;
}
