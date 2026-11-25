import {sourceOrigin, itemId, sourceItem, mainSearch, categoryName} from './platform.mjs';
import {formatPrice, purchaseFor, savedPaths, toggleSaved} from './shopping.mjs';
import {productCard} from './catalog-client.mjs';
import {showQc} from './qc-client.mjs';
import {setProductImage} from './product-images.mjs';
import {findCatalogItem} from './catalog-item.mjs';

function relatedProducts(item, items) {
  const words = new Set(item.title.toLowerCase().match(/[a-z0-9]{4,}/g) || []);
  const candidates = items.filter((product) => product.path !== item.path &&
    (!item.id || item.id !== product.id) && product.category === item.category);
  const scored = candidates.map((product) => {
    const shared = new Set(product.title.toLowerCase().match(/[a-z0-9]{4,}/g) || []);
    const overlap = [...shared].filter((word) => words.has(word)).length;
    const nearPrice = item.price != null && product.price != null ? 1 / (1 + Math.abs(item.price - product.price) / 50) : 0;
    return {product, score: overlap * 2 + nearPrice};
  });
  scored.sort((a, b) => b.score - a.score || b.product.views - a.product.views);
  const seen = new Set();
  return scored.map(({product}) => product).filter((product) => {
    const identifier = product.id || product.path;
    if (seen.has(identifier)) return false;
    seen.add(identifier);
    return true;
  }).slice(0, 8);
}

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
  const save = select('#find-save');
  const qc = select('#product-qc');
  let product;
  let images = [];
  let active = 0;
  const failedPhotos = new Set();
  let qcId;
  let sellerOptions;
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

  function renderSellerOptions(groups) {
    optionList.hidden = !groups.length;
    optionList.replaceChildren(...groups.map(({name, values}) => {
      const group = document.createElement('fieldset');
      const title = document.createElement('legend');
      title.textContent = name;
      title.translate = false;
      const grid = document.createElement('div');
      grid.className = 'listing-choices';
      const selection = document.createElement('p');
      selection.className = 'listing-selected';
      selection.translate = false;
      group.append(title, selection, grid);
      for (const {label, image} of values) {
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
    const purchase = purchaseFor(product);
    select('#find-buy').href = purchase.href;
    select('#find-buy').textContent = purchase.label;
    select('#find-price').textContent = product.price == null ? '' : formatPrice(product.price);
  }

  function refreshSaved() {
    const enabled = savedPaths().includes(product?.path);
    save.setAttribute('aria-pressed', String(enabled));
    save.textContent = enabled ? 'Remove saved product' : 'Save product';
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
    select('#find-id').textContent = item.id ? categoryName(item.category) + ' · Weidian item ID ' + item.id : categoryName(item.category);
    select('#find-source').href = item.path ? sourceOrigin + item.path : mainSearch(item.id);
    const weidian = select('#find-weidian');
    weidian.hidden = copy.hidden = !item.id;
    if (item.id) weidian.href = sourceItem(item.id);
    const others = select('#other-agents');
    others.hidden = !item.id;
    if (item.id) {
      for (const link of others.querySelectorAll('[data-agent]')) link.href = purchaseFor(item, link.dataset.agent).href;
    }
    save.hidden = !item.path;
    refreshOptions();
    refreshSaved();
    showGallery();
    qc.hidden = false;
    const originalQc = select('#original-qc');
    originalQc.hidden = !item.path;
    if (!originalQc.hidden) originalQc.href = sourceOrigin + item.path + '#qcPhotosStatus';
    if (item.id && qcId !== item.id) {
      qcId = item.id;
      if (location.hash === '#product-qc') requestAnimationFrame(() => qc.scrollIntoView());
      const isHeadphone = /\b(?:headphones?|headsets?|earbuds?|earphones?|airpods?)\b|耳[机機]/i.test(item.title);
      showQc(qcId, qc, isHeadphone ? 8 : undefined, item.path);
    } else if (!item.id) {
      qc.querySelector('[role=status]').textContent = 'This source listing has no Weidian item ID for a warehouse photo lookup.';
    }
    status.hidden = true;
  }

  function renderRelated(item, local) {
    const related = relatedProducts(item, local);
    select('#related-section').hidden = !related.length;
    if (related.length) {
      select('#related-category').href = '/categories/' + item.category + '/';
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
  copy.addEventListener('click', async () => {
    const link = sourceItem(product.id);
    const message = select('#find-copy-status');
    try {
      await navigator.clipboard.writeText(link);
      copy.textContent = 'Link copied';
      message.textContent = 'Product link copied.';
    } catch {
      copy.textContent = 'Use the Weidian link';
      message.textContent = 'Could not copy the link. Open the Weidian listing to copy it.';
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
      status.textContent = 'A product link or Weidian item ID is required.';
      return;
    }
    const query = new URLSearchParams({id, from});
    const read = (url, timeout) => fetch(url, {signal:AbortSignal.timeout(timeout)})
      .then((res) => res.ok ? res.json() : null).catch(() => null);
    const readOptions = (itemId) => itemId
      ? read('/api/sku?id=' + encodeURIComponent(itemId), 6500).then((data) => data?.listing)
      : Promise.resolve(undefined);
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
    let catalog;
    const items = () => catalog ??= read('/catalog-data.json', 12000).then((data) => data?.items || []);
    const lookup = await read('/api/catalogitem?' + query, 5000);
    const saved = lookup?.product || findCatalogItem(await items(), id, from);
    if (saved) {
      render(saved);
      requestAnimationFrame(() => setTimeout(() => {
        void items().then((all) => renderRelated(product, all));
      }, 0));
      void updateSellerOptions(saved);
      if (saved.gallery?.length > 1) return;
      if (saved.path) query.set('from', saved.path);
    }
    const live = await read('/api/product?' + query, 5500);
    if (live?.product) {
      const gallery = [...new Set([...(live.product.gallery || []), ...(saved?.gallery || [])])];
      const item = {...saved, ...live.product, gallery};
      render(item);
      if (!saved) {
        void updateSellerOptions(item);
        void items().then((all) => renderRelated(product, all));
      }
    } else if (!saved && id) {
      if (!await updateSellerOptions({id})) {
        render({id, title: 'Weidian item ' + id});
        status.hidden = false;
        status.textContent = 'Open the original listing to review this item.';
      }
    } else if (!saved) {
      status.textContent = 'The product could not be loaded. Return to the spreadsheet and try again.';
    }
  }

  void load();
}
