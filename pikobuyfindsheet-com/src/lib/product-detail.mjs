import {sourceOrigin, itemId, sourceItem} from './platform.mjs';
import {formatPrice, purchaseFor} from './shopping.mjs';
import {showQc} from './qc-client.mjs';
import {setProductImage} from './product-images.mjs';
import {findCatalogItem} from './catalog-item.mjs';
import {lookupProductOptions} from './upstream.mjs';

export function setupDetail() {
  const select = (selector) => document.querySelector(selector);
  const catalogueLink = select('#find-back');
  if (URL.canParse(document.referrer)) {
    const referrer = new URL(document.referrer);
    if (referrer.origin === location.origin &&
        /^\/(?:spreadsheet|categories\/[\w-]+)\/?$/.test(referrer.pathname)) {
      catalogueLink.href = referrer.href;
      catalogueLink.addEventListener('click', (event) => {
        if (history.length>1 && event.button===0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          history.back();
        }
      });
    }
  }
  const params = new URLSearchParams(location.search);
  const id = itemId(params.get('id') || '');
  const from = params.get('from') || '';
  const status = select('#find-status');
  const cover = select('#find-image');
  const fullImage = select('#gallery-open');
  const emptyGallery = select('#gallery-empty');
  const position = select('#gallery-position');
  const thumbs = select('#find-gallery');
  const previous = select('#gallery-prev');
  const next = select('#gallery-next');
  const qc = select('#product-qc');
  let product;
  let images = [];
  let active = 0;
  const failedPhotos = new Set();
  let qcId;
  let sellerOptions;
  let variantPrice;
  const sellerDetails = select('#seller-details');
  const sellerDetailGrid = sellerDetails.querySelector('.detail-photo-grid');
  const productPrice = select('#find-price');
  const copy = select('#find-copy');
  const optionList = select('#find-options');

  function showImage(index) {
    if (!images.length || failedPhotos.size === images.length) return;
    const direction = index < active ? -1 : 1;
    active = (index + images.length) % images.length;
    while (failedPhotos.has(active)) active = (active + direction + images.length) % images.length;
    const width = fullImage.clientWidth <= 510 ? 520 : 900;
    setProductImage(cover, images[active], width);
    fullImage.href = new URL(images[active], sourceOrigin).href;
    cover.alt = product.title;
    for (const [n, button] of [...thumbs.children].entries()) {
      button.setAttribute('aria-current', n === active ? 'true' : 'false');
    }
    position.textContent = (active + 1) + ' of ' + images.length + ' seller photos';
  }

  function showGallery() {
    images = [...new Set([product.image, ...(product.gallery || [])].filter(Boolean))];
    failedPhotos.clear();
    fullImage.hidden = position.hidden = !images.length;
    emptyGallery.hidden = Boolean(images.length);
    previous.hidden = next.hidden = images.length < 2;
    thumbs.replaceChildren();
    thumbs.hidden = images.length < 2;
    if (images.length > 1) {
      for (const [index, image] of images.entries()) {
        const button = document.createElement('button');
        button.className = 'thumb';
        button.type = 'button';
        button.setAttribute('aria-label', 'Show seller photo ' + (index + 1));
        const thumbnail = document.createElement('img');
        thumbnail.alt = '';
        thumbnail.loading = 'lazy';
        setProductImage(thumbnail, image, 120);
        button.append(thumbnail);
        button.addEventListener('click', () => showImage(index));
        thumbs.append(button);
      }
    }
    showImage(0);
  }

  function showDetailPhotos(paths) {
    sellerDetailGrid.replaceChildren(...[...new Set(paths.filter(Boolean))].map((path, index) => {
      const link = document.createElement('a');
      link.href = new URL(path, sourceOrigin).href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const photo = document.createElement('img');
      photo.alt = product.title + ' · ' + (index + 1);
      photo.loading = 'lazy';
      photo.decoding = 'async';
      photo.addEventListener('product-image-unavailable', () => {
        link.remove();
        sellerDetails.hidden = !sellerDetailGrid.childElementCount;
      });
      setProductImage(photo, path, 320);
      link.append(photo);
      return link;
    }));
    sellerDetails.hidden = !sellerDetailGrid.childElementCount;
  }

  function renderSellerOptions(groups) {
    const selected = new Map();
    const skuPrices = new Map((sellerOptions?.variants || []).map(({key,price}) => [key, price]));
    optionList.hidden = !groups.length;
    optionList.replaceChildren(...groups.map(({name, values}, groupIndex) => {
      const group = document.createElement('fieldset');
      const title = document.createElement('legend');
      title.textContent = name.replace(/\.$/, '');
      title.translate = false;
      const grid = document.createElement('div');
      grid.className = 'listing-choices';
      const selection = document.createElement('p');
      selection.className = 'listing-selected';
      selection.translate = false;
      group.append(title, selection, grid);
      for (const {id: optionId, label, image} of values) {
        const button = document.createElement('button');
        button.type = 'button';
        button.title = label;
        button.setAttribute('aria-label', label);
        button.setAttribute('aria-pressed', 'false');
        button.translate = false;
        button.textContent = label;
        if (image) {
          const thumbnail = document.createElement('img');
          thumbnail.alt = label;
          thumbnail.loading = 'lazy';
          thumbnail.addEventListener('error', () => { button.textContent = label; }, {once:true});
          setProductImage(thumbnail, image, 120);
          button.replaceChildren(thumbnail);
        }
        button.addEventListener('click', () => {
          for (const choice of grid.children) choice.setAttribute('aria-pressed', String(choice === button));
          selection.textContent = label;
          if (optionId) selected.set(groupIndex, optionId);
          else selected.delete(groupIndex);
          variantPrice = selected.size === groups.length
            ? skuPrices.get([...selected.values()].sort().join('-')) : undefined;
          refreshPrice();
          const index = images.indexOf(image);
          if (index >= 0) showImage(index);
        });
        grid.append(button);
      }
      return group;
    }));
  }

  function refreshOptions() {
    if (!product) return;
    const purchase = purchaseFor(product, 'pikobuy');
    select('#find-buy').href = purchase.href;
    select('#find-buy').textContent = purchase.label;
    refreshPrice();
  }

  function refreshPrice() {
    if (!product) return;
    const price = variantPrice ?? product.price;
    productPrice.hidden = price == null;
    productPrice.textContent = price == null ? '' : formatPrice(price);

  }

  function render(item) {
    const optionPhotos = sellerOptions?.groups.flatMap(({values}) => values.map(({image}) => image).filter(Boolean)) || [];
    product = sellerOptions ? {
      ...item,
      image: sellerOptions.photos[0] || item.image,
      gallery: [...sellerOptions.photos, ...optionPhotos, item.image, ...(item.gallery || [])],
    } : item;
    select('#find-detail').hidden = false;
    select('#find-title').textContent = item.title;
    select('#find-title').translate = false;
    document.title = item.title + ' | Pikobuy Spreadsheet';
    select('#find-id').hidden = !item.id;
    select('#find-weidian-id').textContent = item.id || '';
    copy.hidden = !item.id;
    const others = select('#other-agents');
    others.hidden = !item.id;
    if (item.id) {
      for (const link of others.querySelectorAll('[data-agent]')) link.href = purchaseFor(item, link.dataset.agent).href;
    }
    refreshOptions();
    showGallery();
    showDetailPhotos([item.image, ...(item.gallery || []), ...(sellerOptions?.photos || [])]);
    const originalQc = select('#original-qc');
    originalQc.hidden = !item.path;
    if (!originalQc.hidden) originalQc.href = sourceOrigin + item.path + '#qcPhotosStatus';
    if (item.id && qcId !== item.id) {
      qcId = item.id;
      if (location.hash === '#product-qc') {
        qc.hidden = false;
        requestAnimationFrame(() => qc.scrollIntoView());
      }
      const isHeadphone = /\b(?:headphones?|headsets?|earbuds?|earphones?|airpods?)\b|耳[机機]/i.test(item.title);
      showQc(qcId, qc, isHeadphone ? 8 : undefined, item.path);
    }
    status.hidden = true;
  }

  cover.addEventListener('product-image-unavailable', () => {
    failedPhotos.add(active);
    const unavailable = thumbs.children[active];
    if (unavailable) unavailable.hidden = true;
    for (let step = 1; step < images.length; step++) {
      const alternative = (active + step) % images.length;
      if (!failedPhotos.has(alternative)) {
        showImage(alternative);
        return;
      }
    }
    fullImage.hidden = position.hidden = previous.hidden = next.hidden = true;
    emptyGallery.hidden = false;
  });

  previous.addEventListener('click', () => showImage(active - 1));
  next.addEventListener('click', () => showImage(active + 1));
  let swipeStart;
  cover.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    swipeStart = [touch.clientX, touch.clientY];
  }, {passive: true});
  cover.addEventListener('touchend', (event) => {
    if (!swipeStart || images.length < 2) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - swipeStart[0];
    const deltaY = touch.clientY - swipeStart[1];
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      showImage(active + (deltaX < 0 ? 1 : -1));
    }
    swipeStart = undefined;
  }, {passive: true});
  select('.listing-gallery').addEventListener('keydown', (event) => {
    if (images.length < 2) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(active + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  copy.addEventListener('click', async () => {
    const link = sourceItem(product.id);
    const message = select('#find-copy-status');
    try {
      await navigator.clipboard.writeText(link);
      copy.textContent = 'Link copied';
      message.textContent = 'Product link copied.';
    } catch {
      copy.textContent = 'Link could not be copied';
      message.textContent = 'Could not copy the product link. Please try again.';
    }
  });
  window.addEventListener('shopping-change', refreshPrice);
  async function load() {
    if (!id && !from) {
      status.textContent = 'A product link or Weidian item ID is required.';
      return;
    }
    const query = new URLSearchParams({id, from});
    const read = (url, timeout) => fetch(url, {signal:AbortSignal.timeout(timeout)})
      .then((res) => res.ok ? res.json() : null).catch(() => null);
    async function readOptions(itemId) {
      if (!itemId) return;
      try {
        const listing = await lookupProductOptions(itemId);
        if (listing) return listing;
      } catch {}
      return (await read('/api/sku?id=' + encodeURIComponent(itemId), 5500))?.listing;
    }
    const optionsRequest = id ? readOptions(id) : null;
    async function updateSellerOptions(item) {
      const options = await (optionsRequest ?? readOptions(item.id));
      if (!options) return false;
      sellerOptions = options;
      const current = product?.id === item.id ? product : item;
      render({...current, title: current.title || options.title, price: current.price ?? options.price});
      renderSellerOptions(options.groups);
      return true;
    }
    const lookup = await read('/api/catalogitem?' + query, 5000);
    const saved = lookup?.product || findCatalogItem((await read('/catalog-data.json', 12000))?.items || [], id, from);
    if (saved) {
      render(saved);
      void updateSellerOptions(saved);
      if (saved.gallery?.length > 1) return;
      if (saved.path) query.set('from', saved.path);
    }
    const liveRequest = read('/api/product?' + query, 5500);
    if (!saved && id) {
      const options = await optionsRequest;
      if (options) {
        sellerOptions = options;
        render({id, title:options.title, price:options.price});
        renderSellerOptions(options.groups);
      }
    }
    const live = await liveRequest;
    if (live?.product) {
      const gallery = [...new Set([...(live.product.gallery || []), ...(saved?.gallery || [])])];
      const item = {...saved, ...live.product, gallery};
      render(item);
      if (!saved) {
        if (!sellerOptions) void updateSellerOptions(item);
      }
    } else if (!saved && id && !sellerOptions) {
      render({id, title: 'Weidian item ' + id});
      status.hidden = false;
      status.textContent = 'Open the original listing to review this item.';
    } else if (!saved && !product) {
      status.textContent = 'The product could not be loaded. Return to the spreadsheet and try again.';
    }
  }

  void load();
}
