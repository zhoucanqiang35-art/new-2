import { catalogResponse } from '../../src/lib/catalog-browse.js';
import { savedQc } from '../../src/lib/catalog-qc.js';
import { load } from 'cheerio/slim';
import { savedSellerOptions } from '../../src/lib/catalog-options.js';
import { fetchSellerOptions } from '../../src/lib/sku.js';
import { catalogDetail, imageProductCatalog } from '../../src/lib/catalog-product.js';
import { findspreadsheet, productPath, purchase, weidianId } from '../../src/lib/fansbuy.js';

function json(body, status = 200, cache = false) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': cache ? 'public, max-age=60, s-maxage=180' : 'no-store' }
  });
}

function safeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value, findspreadsheet);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function image($element) {
  return safeUrl($element.attr('data-src') || $element.attr('src'));
}

async function upstream(path) {
  const response = await fetch(new URL(path, findspreadsheet), {
    signal: AbortSignal.timeout(9000),
    redirect: 'manual',
    headers: { Accept: 'text/html, application/json' }
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('FindSpreadsheet request failed');
  return response;
}

async function product(parameters) {
  const path = parameters.get('path') ?? '';
  if (!productPath.test(path)) return json({ error: 'Invalid product link.' }, 400);
  const local = catalogDetail(path);
  if (local) return json(local, 200, true);
  const response = await upstream(path);
  if (!response) return json({ error: 'This product is no longer available in the catalog.' }, 404);
  const $ = load(await response.text());
  const $product = $('.product-detail').first();
  const name = $product.find('h1.product-title').first().text().trim();
  if (!name) throw new Error('FindSpreadsheet product markup changed');
  const id = $product.find('[data-cart-weidian]').first().attr('data-cart-weidian');
  const images = $product.find('.product-gallery img').toArray().map(element => image($(element))).filter(Boolean);
  return json({
    name, id: weidianId.test(id ?? '') ? id : null,
    images: [...new Set(images)], buy: purchase(id),
    price: $product.find('.product-price').first().text().trim(),
    source: new URL(path, findspreadsheet).href
  }, 200, true);
}

async function sku(parameters) {
  const id = parameters.get('id') ?? '';
  if (!weidianId.test(id)) return json({ error: 'Invalid Weidian item ID.' }, 400);
  const saved = savedSellerOptions(id);
  if (saved) return json(saved, 200, true);
  if (parameters.get('snapshot') === '1') return json({ groups: [], images: [] });
  const data = await fetchSellerOptions(id);
  return data ? json(data, 200, true) : json({ error: 'The requested results were unavailable.' }, 502);
}

async function qc(parameters) {
  const id = parameters.get('id') ?? '';
  if (!weidianId.test(id)) return json({ error: 'Invalid Weidian item ID.' }, 400);
  const cached = savedQc(id);
  if (cached) return json(cached, 200, true);
  const response = await upstream('/qcradar-qc.php?' + new URLSearchParams({ item: id }));
  if (!response) throw new Error('FindSpreadsheet QC endpoint missing');
  const data = await response.json();
  if (String(data.itemId) !== id || !['ready', 'pending', 'none'].includes(data.status) || data.degraded) {
    throw new Error('FindSpreadsheet QC response unavailable');
  }
  const images = Array.isArray(data.images) ? data.images.slice(0, 24).flatMap(photo => {
    const url = safeUrl(photo.display);
    return url ? [{ url, video: Boolean(photo.isVideo || photo.mimeType?.startsWith('video/')), label: photo.skuLabel ?? '' }] : [];
  }) : [];
  return json({ status: data.status, images }, 200, true);
}

export async function onRequestGet({ request }) {
  const { pathname, searchParams } = new URL(request.url);
  try {
    switch (pathname.replace(/\/$/, '')) {
      case '/api/catalog': return catalogResponse(searchParams);
      case '/api/product': return await product(searchParams);
      case '/api/image-products': {
        const ids = (searchParams.get('ids') ?? '').split(',').slice(0, 48);
        return json({ products: imageProductCatalog(ids) }, 200, true);
      }
      case '/api/sku': return await sku(searchParams);
      case '/api/qc': return await qc(searchParams);
      default: return json({ error: 'Unknown endpoint.' }, 404);
    }
  } catch (error) {
    console.error(error);
    return json({ error: 'FindSpreadsheet is temporarily unavailable. Please try again.' }, 502);
  }
}
