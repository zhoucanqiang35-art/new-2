import featured from '../featured.json';
import catalog from '../../public/catalog.json';
import galleries from '../../public/galleries.json';

// Keep the first release small enough to review every listing and URL.
const additionalIds = ['15', '6250', '5985', '5970', '9018', '9015', '5983', '5966'];
export const pilotProducts = [...featured, ...additionalIds.map(id => catalog.find(item => item.id === id))];

for (const product of pilotProducts) {
  if (!product?.image || !/^\d+$/.test(product.weidianId) || !product.sourcePath?.startsWith('/') ||
      !Number.isFinite(Number(product.price)) || Number(product.price) <= 0) {
    throw new Error('Incomplete LoongBuy pilot product');
  }
}

export const pilotPath = id => `/products/${id}/`;
export const pilotPaths = Object.fromEntries(pilotProducts.map(({ id }) => [id, pilotPath(id)]));
export const sellerPhotos = product => [...new Set([product.image, ...(galleries[product.id] ?? [])])];
export const buyUrl = id => 'https://loongbuy.com/product-details?' +
  new URLSearchParams({ url: 'https://weidian.com/item.html?itemID=' + id });
