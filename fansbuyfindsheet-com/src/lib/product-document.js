import { catalogDetail } from './catalog-product.js';
import { savedSellerOptions } from './catalog-options.js';
import { savedQc } from './catalog-qc.js';

export function productDocument(html, path) {
  const product = catalogDetail(path);
  if (!product) return html;
  const seed = { ...product, options: savedSellerOptions(product.id), qc: savedQc(product.id) };
  const json = JSON.stringify(seed).replaceAll('<', '\\u003c');
  const photo = product.images[0].replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  return html
    .replace('id="product-seed" type="application/json">null</script>', () => `id="product-seed" type="application/json">${json}</script>`)
    .replace('<img id="primary-image"', () => `<img src="${photo}" id="primary-image"`);
}
