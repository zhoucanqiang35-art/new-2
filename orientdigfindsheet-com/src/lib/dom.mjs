import { categories, itemUrl, priceLabel } from './catalog.mjs';

export async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Data unavailable');
  return response.json();
}

export function element(tag, attributes = {}, text) {
  const node = document.createElement(tag);
  Object.assign(node, attributes);
  if (text !== undefined) node.textContent = text;
  return node;
}

export function card(product, image = product.image) {
  const link = element('a', {className:'card', href:itemUrl(product.weidianId)});
  const price = element('span', {className:'card-price'}, priceLabel(product.price));
  price.dataset.priceCny = product.price ?? '';
  const body = element('span', {className:'card-body'});
  body.append(
    element('span', {className:'small muted'}, categories[product.category]),
    element('strong', {title:product.name, translate:false}, product.name),
    price,
  );
  link.append(element('img',{src:image,alt:product.name,translate:false,loading:'lazy',width:360,height:265}),body);
  return link;
}
