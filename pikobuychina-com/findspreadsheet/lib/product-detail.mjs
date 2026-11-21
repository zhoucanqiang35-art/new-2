import {sourceOrigin, itemId, sourceItem, mainSearch, categoryName, catalogCategoryPath} from './platform.mjs';
import {formatPrice, purchaseFor, savedPaths, shoppingOptions, toggleSaved} from './shopping.mjs';
import {productCard} from './catalog-client.mjs';
import {showQc} from './qc-client.mjs';
import {setProductImage} from './product-images.mjs';
import {text} from './ui-text.mjs';

export function setupDetail() {
  const select = (selector) => document.querySelector(selector);
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
  const save = select('#find-save');
  const saveLabel = save.textContent;
  const alternatives = select('#other-agents');
  const agentLinks = [...alternatives.querySelectorAll('[data-agent]')];
  let product;
  let images = [];
  let active = 0;
  const failedPhotos = new Set();
  let qcId;

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
    if (images.length > 1) {
      for (const [index, image] of images.entries()) {
        const button = document.createElement('button');
        button.className = 'thumb';
        button.type = 'button';
        button.setAttribute('aria-label', 'Show seller photo ' + (index + 1));
        const thumbnail = document.createElement('img');
        setProductImage(thumbnail, image, 120);
        thumbnail.alt = '';
        thumbnail.loading = 'lazy';
        button.append(thumbnail);
        button.addEventListener('click', () => showImage(index));
        thumbs.append(button);
      }
    }
    showImage(0);
  }

  function refreshOptions() {
    if (!product) return;
    const {agent} = shoppingOptions();
    const purchase = purchaseFor(product,agent);
    select('#find-buy').hidden = false;
    select('#find-buy').href = purchase.href;
    select('#find-buy').textContent = purchase.label;
    select('#find-buy').rel = !product.id || agent === 'findspreadsheet' ? 'noopener' : 'sponsored noopener';
    alternatives.hidden = false;
    alternatives.querySelector('[data-no-agent-id]').hidden = Boolean(product.id);
    for (const link of agentLinks) {
      const target = link.dataset.agent;
      link.hidden = product.id ? target === agent : target !== 'findspreadsheet';
      if (!link.hidden) link.href = purchaseFor(product,target).href;
    }
    select('#find-price').textContent = product.price == null ? '' : formatPrice(product.price);
  }

  function refreshSaved() {
    const path = product?.path;
    save.hidden = !path;
    const selected = path ? savedPaths().includes(path) : false;
    save.setAttribute('aria-pressed',String(selected));
    save.textContent = selected ? save.dataset.removeLabel : saveLabel;
  }

  function render(item) {
    product = item;
    select('#find-detail').hidden = false;
    select('#find-title').textContent = item.title;
    select('#find-title').translate = false;
    document.title = item.title + ' | Pikobuy Spreadsheet';
    select('#find-id').textContent = item.id ? categoryName(item.category) + ' · Weidian item ID ' + item.id : categoryName(item.category);
    select('#find-source').href = item.path ? sourceOrigin + item.path : mainSearch(item.id);
    select('#find-source').hidden = false;
    const weidian = select('#find-weidian');
    weidian.hidden = !item.id;
    if (item.id) weidian.href = sourceItem(item.id);
    refreshOptions();
    refreshSaved();
    showGallery();
    qc.hidden = false;
    const originalQc = select('#original-qc');
    originalQc.hidden = !item.id || !item.path;
    if (!originalQc.hidden) originalQc.href = sourceOrigin + item.path + '#qcPhotosStatus';
    if (item.id && qcId !== item.id) {
      qcId = item.id;
      const isHeadphone = /\b(?:headphones?|headsets?|earbuds?|earphones?|airpods?)\b|耳[机機]/i.test(item.title);
      showQc(qcId, qc, isHeadphone ? 8 : undefined, item.path);
    } else if (!item.id) {
      qc.querySelector('[role=status]').textContent = 'This source listing has no Weidian item ID for a warehouse photo lookup.';
    }
    status.hidden = true;
  }

  function renderRelated(item, related) {
    select('#related-section').hidden = !related.length;
    if (related.length) {
      select('#related-category').href = catalogCategoryPath(item.category);
      select('#related-grid').replaceChildren(...related.map((entry) => productCard(entry)));
    }
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
  window.addEventListener('shopping-change', refreshOptions);
  save.addEventListener('click', () => {
    if (product?.path) {
      toggleSaved(product.path);
      refreshSaved();
    }
  });

  async function load() {
    if (!id && !from) {
      status.textContent = text('A product link or Weidian item ID is required.');
      return;
    }
    const query = new URLSearchParams({id, from});
    const read = (url, timeout) => fetch(url, {signal:AbortSignal.timeout(timeout)})
      .then((res) => res.ok ? res.json() : null).catch(() => null);
    const related = async (item, address) => {
      const result = await read('/api/related?' + address, 5000);
      if (product === item) renderRelated(item, result?.items || []);
    };
    const lookup = await read('/api/catalogitem?' + query, 5000);
    const saved = lookup?.product;
    if (saved) {
      render(saved);
      if (saved.path) query.set('from', saved.path);
      if (saved.id && saved.gallery?.length > 1) {
        void related(product,query);
        return;
      }
    }
    const live = await read('/api/product?' + query, 5500);
    if (live?.product) {
      const gallery = [...new Set([...(live.product.gallery || []), ...(saved?.gallery || [])])];
      render({...saved, ...live.product, id:live.product.id||saved?.id, gallery});
      void related(product,query);
    } else if (saved) {
      void related(product,query);
    } else if (id) {
      render({id, title: 'Weidian item ' + id});
      status.hidden = false;
      status.textContent = text('Open the original listing to review this item.');
    } else {
      status.textContent = text('The product could not be loaded. Return to the spreadsheet and try again.');
    }
  }

  void load();
}
