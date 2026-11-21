import thumbnails from '../data/product-thumbnails.json';
import {sourceOrigin} from './platform.mjs';

function sources(path, width) {
  if (!path) return [];
  if (/^\/qc-media\/\d+-\d+\.webp$/.test(path)) return [path];
  let original;
  try { original = new URL(path, sourceOrigin); } catch { return []; }
  if (original.protocol !== 'https:') return [];
  if (original.origin !== sourceOrigin || !original.pathname.startsWith('/uploads/')) return [original.href];

  const local = thumbnails[original.pathname];
  const query = new URLSearchParams({url: original.href, w: String(width), output: 'webp'});
  const resized = 'https://wsrv.nl/?' + query;
  const alternate = new URL(original.href);
  alternate.hostname = 'www.findspreadsheet.com';
  const backupResize = 'https://i0.wp.com/' + original.hostname + original.pathname + '?w=' + width;
  const preferLocal = width <= 520 && (width <= 200 || !local?.startsWith('/assets/catalog/single-'));
  const candidates = preferLocal
    ? [local, resized, original.href, backupResize, alternate.href]
    : [resized, original.href, backupResize, alternate.href, local];
  return candidates.filter(Boolean);
}

export function productImageSource(path, width = 480) {
  return sources(path, width)[0];
}

export function setProductImage(image, path, width = 480, backup = '') {
  image.dataset.productImage = path;
  image.dataset.imageSize = String(width);
  image.dataset.imageBackup = backup;
  image.referrerPolicy = 'no-referrer';
  delete image.dataset.imageExhausted;
  const source = productImageSource(path, width) || productImageSource(backup, width);
  if (source) image.src = source;
  else image.removeAttribute('src');
}

export function enableProductImageFallback() {
  function retry(image) {
    if (!(image instanceof HTMLImageElement) || !image.dataset.productImage) return;
    const width = Number(image.dataset.imageSize) || 480;
    const attempts = [...new Set([
      ...sources(image.dataset.productImage, width),
      ...sources(image.dataset.imageBackup, width),
    ])];
    const failed = attempts.indexOf(image.getAttribute('src'));
    if (failed < 0) return;
    if (failed + 1 < attempts.length) {
      image.src = attempts[failed + 1];
    } else if (!image.dataset.imageExhausted) {
      image.dataset.imageExhausted = 'true';
      image.dispatchEvent(new Event('product-image-unavailable'));
    }
  }

  document.addEventListener('error', (event) => retry(event.target), true);
  for (const image of document.querySelectorAll('img[data-product-image]')) {
    if (image.complete && image.naturalWidth === 0) retry(image);
  }
}
