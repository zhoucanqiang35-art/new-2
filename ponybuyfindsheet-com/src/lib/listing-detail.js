import qc from '../data/qc.json';
import { listingPhotoShard } from './listing-photos';
import { photoThumbnail } from './catalog-photos';
import { refreshPrices, setUiText, ui } from './preferences';
import { catalogPhotoUrl, searchProducts, sourceSite } from './search-catalog';

function addPhotos(root, selector, photos, title) {
  const grid = root.querySelector(selector);
  const shown = new Set([...grid.querySelectorAll('a')].map(({ href }) => href));
  for (const image of photos) {
    const href = new URL(image, location.href).href;
    if (shown.has(href)) continue;
    shown.add(href);
    const link = document.createElement('a');
    link.href = image;
    link.target = '_blank';
    link.rel = 'noopener';
    link.append(photoElement(image, 360, 180, title));
    grid.append(link);
  }
  grid.closest('section').hidden = !grid.childElementCount;
}

function photoElement(url, thumbWidth, size, title = '') {
  const img = document.createElement('img');
  img.src = photoThumbnail(url, thumbWidth);
  img.alt = title;
  img.width = size;
  img.height = size;
  img.loading = 'lazy';
  img.decoding = 'async';
  return img;
}

function appendThumbnails(root, photos) {
  const strip = root.querySelector('.gallery-thumbs');
  const shown = new Set([...strip.querySelectorAll('[data-image]')].map(({ dataset }) => dataset.image));
  for (const image of photos) {
    if (shown.has(image)) continue;
    shown.add(image);
    const count = strip.childElementCount + 1;
    const button = document.createElement('button');
    button.className = 'thumb';
    button.type = 'button';
    button.dataset.image = image;
    button.dataset.ariaLabel = 'Show product image {count}';
    button.dataset.ariaCount = String(count);
    button.setAttribute('aria-label', ui('Show product image {count}', { count }));
    button.setAttribute('aria-pressed', String(count === 1));
    button.append(photoElement(image, 144, 64));
    strip.append(button);
  }
  root.querySelector('[data-photo-nav]').hidden = strip.childElementCount < 2;
}

export function loadListing(root) {
  const state = document.querySelector('#listing-state');
  const id = new URLSearchParams(location.search).get('id');
  const item = searchProducts.find((entry) => entry.id === id);
  if (!item) {
    setUiText(state, 'This product is not in the catalog.');
    return;
  }

  document.title = item.title + ' | PonyBuy Findsheet';
  root.querySelector('[data-detail-title]').textContent = item.title;
  setUiText(root.querySelector('[data-detail-category]'), item.categoryLabel);
  root.querySelector('[data-detail-id]').textContent = item.marketId;
  root.querySelector('[data-detail-market]').hidden = !item.marketId;

  const image = root.querySelector('#gallery-image');
  const photo = catalogPhotoUrl(item.photo);
  image.alt = item.title;
  image.src = photo;
  image.closest('a').href = photo;
  appendThumbnails(root, [photo]);
  addPhotos(root.parentElement, '[data-seller-photos]', [photo], item.title);
  root.querySelector('[data-search-photo]').href = '/image-search/?' + new URLSearchParams({ listing: item.id, photo });

  const price = root.querySelector('[data-detail-price]');
  root.querySelector('[data-detail-price-note]').hidden = item.price == null;
  if (item.price == null) setUiText(price, 'View source price');
  else {
    price.dataset.priceValue = String(item.price);
    price.dataset.priceSource = 'CNY';
    refreshPrices(price);
  }

  const original = sourceSite + item.path;
  root.querySelector('[data-detail-source]').href = original;
  const copy = root.querySelector('[data-copy]');
  copy.dataset.copy = original;
  if (/^\d{8,20}$/.test(item.marketId)) {
    const seller = 'https://weidian.com/item.html?' + new URLSearchParams({ itemID: item.marketId });
    const picker = root.querySelector('.agent-options');
    for (const link of picker.querySelectorAll('[data-agent-url]')) {
      link.href = link.dataset.agentUrl.replace('{id}', item.marketId);
    }
    picker.querySelector('.agent-source').href = seller;
    picker.hidden = false;
    const buy = root.querySelector('[data-detail-buy]');
    buy.href = 'https://m.ponybuy.com/pages/products/details?' + new URLSearchParams({ id: item.marketId, platform_id: '3' });
    buy.hidden = false;
    copy.dataset.copy = seller;
  }
  addPhotos(root.parentElement, '[data-qc-photos]', (qc[item.marketId] ?? []).map(({ image }) => image), 'QC photo for ' + item.title);
  state.hidden = true;
  root.hidden = false;
  return item;
}

export async function loadListingAlbum(root, item) {
  try {
    const response = await fetch(listingPhotoShard(item.id), { signal: AbortSignal.timeout(6500) });
    if (!response.ok) return;
    const record = await response.json();
    const photos = (record[item.id] ?? []).map(catalogPhotoUrl);
    appendThumbnails(root, photos);
    addPhotos(root.parentElement, '[data-seller-photos]', photos, item.title);
    const mainImage = root.querySelector('#gallery-image');
    if (mainImage.hidden && photos.length) mainImage.dispatchEvent(new CustomEvent('select-product-photo', { detail: photos[0] }));
  } catch {
    // Keep the catalog cover available if the saved album cannot be loaded.
  }
}

function sellerImage(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && /(^|\.)geilicdn\.com$/.test(url.hostname)) return url.href;
  } catch {}
  return '';
}

function renderOptions(root, attrs, skus) {
  const groups = attrs.map(({ attr_title, attr_values }) => ({
    name: String(attr_title ?? ''),
    options: (Array.isArray(attr_values) ? attr_values : []).filter(({ attr_value }) => attr_value)
      .map(({ attr_id, attr_value, img }) => ({ id: String(attr_id), name: String(attr_value), image: sellerImage(img) })),
  })).filter(({ name, options }) => name && options.length);
  const panel = root.querySelector('[data-variants]');
  const variants = Object.values(skus ?? {}).flatMap(({ attr_ids, price, stock }) => {
    const ids = String(attr_ids).split('-');
    const values = groups.map(({ options }) => options.find(({ id }) => ids.includes(id))?.name);
    if (!values.length || values.includes(undefined) || Number(stock) <= 0) return [];
    return [{ values, priceCny: price != null && Number.isFinite(Number(price)) ? Number(price) : null }];
  });
  panel.dataset.variants = JSON.stringify(variants);

  groups.forEach(({ name, options }, index) => {
    const fieldset = document.createElement('fieldset');
    fieldset.dataset.optionGroup = String(index);
    const legend = document.createElement('legend');
    legend.textContent = /^(尺寸|尺码|大小|size)$/i.test(name) ? 'Size' : /^(颜色|颜色分类|款式|规格|colour|color|style)$/i.test(name) ? 'Style' : name;
    const grid = document.createElement('div');
    const withPhotos = options.some(({ image }) => image);
    grid.className = withPhotos ? 'option-grid with-photos' : 'option-grid';

    for (const option of options) {
      if (withPhotos && !option.image) continue;
      const button = document.createElement('button');
      button.className = withPhotos ? 'option-pill photo-option' : 'option-pill';
      button.type = 'button';
      button.dataset.option = option.name;
      button.dataset.noTranslate = '';
      button.title = option.name;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', option.name);
      if (option.image) {
        button.dataset.optionPhoto = option.image;
        button.append(photoElement(option.image, 160, 66));
      } else button.textContent = option.name;
      grid.append(button);
    }
    fieldset.append(legend, grid);
    if (withPhotos) {
      const details = document.createElement('details');
      details.className = 'option-by-name';
      const summary = document.createElement('summary');
      summary.textContent = 'Choose by name';
      const select = document.createElement('select');
      select.dataset.optionSelect = '';
      select.setAttribute('aria-label', legend.textContent);
      select.append(new Option('Select an option', ''));
      for (const { name, image } of options) {
        const option = new Option(name, name);
        option.dataset.noTranslate = '';
        option.dataset.optionPhoto = image;
        select.append(option);
      }
      details.append(summary, select);
      fieldset.append(details);
    }
    panel.append(fieldset);
  });

  const status = document.createElement('p');
  status.className = 'variant-status muted small';
  status.setAttribute('aria-live', 'polite');
  panel.append(status);
  return groups;
}

export async function loadSellerOptions(root, item) {
  if (!/^\d{8,20}$/.test(item.marketId)) return;
  try {
    const url = sourceSite + '/api/Goods/getSkuData?' + new URLSearchParams({ weidian_id: item.marketId });
    const response = await fetch(url, { signal: AbortSignal.timeout(7000), credentials: 'omit' });
    if (!response.ok) return;
    const data = await response.json();
    if (String(data.weidian_id) !== item.marketId) return;

    const attrs = data.specifications?.attrs;
    const groups = renderOptions(root, Array.isArray(attrs) ? attrs : [], data.specifications?.skus);
    const used = new Set([...root.querySelectorAll('[data-image]')].map((thumb) => thumb.dataset.image));
    const gallery = (Array.isArray(data.images) ? data.images : []).map(sellerImage).filter(Boolean);
    const optionPhotos = groups.flatMap(({ options }) => options.map(({ image }) => image).filter(Boolean));
    const extra = [...new Set([...gallery, ...(gallery.length <= 1 ? optionPhotos.slice(0, 8) : [])])]
      .filter((url) => !used.has(url));
    appendThumbnails(root, extra);
    addPhotos(root.parentElement, '[data-seller-photos]', gallery, item.title);
    const mainImage = root.querySelector('#gallery-image');
    if (mainImage.hidden && extra.length) mainImage.dispatchEvent(new CustomEvent('select-product-photo', { detail: extra[0] }));
  } catch {
    // The catalog photo and purchase links remain available when the supplier is offline.
  }
}
