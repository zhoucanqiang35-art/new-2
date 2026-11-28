import { catalogDetail } from './catalog-product.js';
import { savedSellerOptions } from './catalog-options.js';
import { savedQc } from './catalog-qc.js';

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function productDocument(html, path, indexable = false) {
  const product = catalogDetail(path);
  if (!product) return html;
  const seed = { ...product, options: savedSellerOptions(product.id), qc: savedQc(product.id) };
  const json = JSON.stringify(seed).replaceAll('<', '\\u003c');
  const photo = escapeHtml(product.images[0]);
  const name = escapeHtml(product.name);
  const canonical = new URL('/product/', 'https://fansbuyfindsheet.com');
  canonical.searchParams.set('path', path);
  const metadata = `<link rel="canonical" href="${escapeHtml(canonical.href)}"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}">`;
  return html
    .replace(/<title>[^<]*<\/title>/, () => `<title>${name} | Fansbuy Findsheet</title>`)
    .replace('<meta name="robots" content="noindex,follow">', () => metadata)
    .replace(/(name="description" content=")[^"]*"/, (_, start) => `${start}View listing photos, price, available warehouse QC and the Fansbuy purchase link for ${name}."`)
    .replace('id="product-seed" type="application/json">null</script>', () => `id="product-seed" type="application/json">${json}</script>`)
    .replace('<img id="primary-image"', () => `<img src="${photo}" id="primary-image"`);
}
