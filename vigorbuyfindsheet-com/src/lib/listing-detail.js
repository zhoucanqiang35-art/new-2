import { agentHref } from './agent-links';
import { catalog } from './browser';
import { currentCurrency, paintPrice, translate } from './preferences';
import { buy, names, price, source, warehouse } from './site';
import { loadSku } from './sku';

export function initListing() {
  const root = document.querySelector('[data-listing]');
  const get = (name) => root.querySelector('[data-' + name + ']');
  const cover = get('cover');
  const gallery = get('gallery');
  const menu = get('agent-menu');
  let warehouseUrls = new Set();
  let sellerUrls = new Set();
  function setLabel(target, key, fallback) {
    const node = get(target);
    node.dataset.t = key;
    node.textContent = translate(key, fallback);
  }

  function showPhoto(url, index, reveal = false) {
    if (cover.getAttribute('src') !== url) cover.src = url;
    if (warehouseUrls.has(url)) setLabel('photo-source', 'warehouseLabel', 'Warehouse photos');
    else if (sellerUrls.has(url)) setLabel('photo-source', 'sellerLabel', 'Seller photos');
    else setLabel('photo-source', 'productPhotos', 'Product photos');
    for (const [position, option] of [...gallery.children].entries()) {
      const selected = position === index;
      option.setAttribute('aria-pressed', String(selected));
      if (selected && reveal) gallery.scrollLeft = option.offsetLeft - gallery.offsetLeft - (gallery.clientWidth - option.offsetWidth) / 2;
    }
    get('photo-count').textContent = index >= 0 ? (index + 1) + ' / ' + gallery.childElementCount : '—';
  }

  gallery.addEventListener('click', (event) => {
    const button = event.target.closest('[data-photo]');
    if (!button) return;
    showPhoto(button.dataset.photo, [...gallery.children].indexOf(button));
  });

  get('gallery-controls').addEventListener('click', (event) => {
    const control = event.target.closest('[data-photo-step]');
    if (!control || gallery.childElementCount < 2) return;
    const options = [...gallery.children];
    const active = options.findIndex((option) => option.getAttribute('aria-pressed') === 'true');
    const step = Number(control.dataset.photoStep);
    const index = active < 0 ? (step > 0 ? 0 : options.length - 1) : (active + step + options.length) % options.length;
    showPhoto(options[index].dataset.photo, index, true);
  });

  function closeMenu(restoreFocus) {
    if (!menu.open) return;
    menu.open = false;
    if (restoreFocus) menu.querySelector('summary').focus();
  }
  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      event.stopPropagation();
      closeMenu(true);
    }
  });
  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target)) closeMenu(false);
  });

  get('copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(get('weidian').href);
      setLabel('copy-status', 'linkCopied', 'Weidian link copied.');
    } catch {
      setLabel('copy-status', 'copyHelp', 'Open Weidian to copy the link.');
    }
  });

  function setGallery(urls) {
    const galleryUrls = [...new Set(urls.filter(Boolean))];
    if (galleryUrls.length === gallery.childElementCount &&
      galleryUrls.every((url, index) => new URL(url, location.origin).href === new URL(gallery.children[index].dataset.photo, location.origin).href)) return;
    const buttons = galleryUrls.map((url, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.photo = url;
      button.dataset.tAria = 'pickPhoto';
      button.dataset.tAriaSuffix = String(index + 1);
      button.setAttribute('aria-label', translate('pickPhoto', 'Show product photo') + ' ' + (index + 1));
      const thumbnail = document.createElement('img');
      thumbnail.src = url;
      thumbnail.alt = '';
      button.append(thumbnail);
      return button;
    });
    gallery.replaceChildren(...buttons);
    gallery.hidden = !buttons.length;
    get('gallery-controls').hidden = !buttons.length;
    for (const control of root.querySelectorAll('[data-photo-step]')) control.disabled = buttons.length < 2;
    get('photo-source').hidden = !buttons.length;
    const current = galleryUrls.indexOf(cover.getAttribute('src'));
    if (galleryUrls.length) showPhoto(galleryUrls[current < 0 ? 0 : current], current < 0 ? 0 : current);
  }

  function renderProductPhotos(urls) {
    const grid = get('product-grid');
    const unique = [...new Set(urls.filter(Boolean))];
    const existing = [...grid.children];
    const keep = existing.every((link, index) => index < unique.length && new URL(unique[index], location.origin).href === link.href)
      ? existing.length : 0;
    const links = unique.slice(keep).map((url, index) => {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const image = document.createElement('img');
      image.src = url;
      const number = String(keep + index + 1);
      image.alt = translate('productPhotos', 'Product photos') + ' ' + number;
      image.dataset.tAria = 'productPhotos';
      image.dataset.tAriaSuffix = number;
      image.decoding = 'async';
      link.append(image);
      return link;
    });
    if (keep) grid.append(...links);
    else grid.replaceChildren(...links);
    get('photo-shelf').hidden = unique.length === 0;
  }

  function showVariants(groups) {
    const panel = get('variants');
    const sections = groups.map(({ name, options }) => {
      const group = document.createElement('fieldset');
      const heading = document.createElement('legend');
      const key = /size|尺码|尺寸/i.test(name) ? 'size' : /style|color|colour|款式|颜色/i.test(name) ? 'style' : '';
      heading.textContent = key ? translate(key, name) : name;
      if (key) heading.dataset.t = key;
      group.append(heading);

      const choices = document.createElement('div');
      const withPhotos = options.some((option) => option.image);
      choices.className = withPhotos ? 'variant-grid variant-with-photos' : 'variant-grid';
      const selected = document.createElement('p');
      selected.className = 'variant-selection';
      selected.setAttribute('aria-live', 'polite');
      for (const { label, image } of options) {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-label', label);
        button.title = label;
        if (image) {
          const thumb = document.createElement('img');
          thumb.src = image;
          thumb.alt = '';
          button.append(thumb);
        } else {
          button.textContent = label;
        }
        button.addEventListener('click', () => {
          for (const option of choices.children) option.setAttribute('aria-pressed', String(option === button));
          selected.textContent = label;
          if (image) {
            const index = [...gallery.children].findIndex((option) => option.dataset.photo === image);
            showPhoto(image, index);
          }
        });
        choices.append(button);
      }
      group.append(choices, selected);
      return group;
    });
    panel.replaceChildren(...sections);
    panel.hidden = !sections.length;
  }

  async function archivedPhotos(item) {
    const record = item.path.match(/-(\d+)\.html$/)?.[1];
    if (!record) return [];
    const response = await fetch('/data/listing-photos/' + Math.floor(Number(record) / 100) + '.json');
    if (!response.ok) return [];
    const photos = await response.json();
    return (photos[record] || []).map((path) => new URL(path, source).href);
  }

  async function fillPhotos(item) {
    const listingPhotos = [item.image, ...(item.images || [])];
    const skuRequest = loadSku(item.id).catch(() => ({ groups: [], images: [] }));
    const archived = root.dataset.id ? [] : await archivedPhotos(item).catch(() => []);
    const warehousePhotos = (warehouse[item.id] || []).map(({ image }) => image);
    warehouseUrls = new Set(warehousePhotos);
    const combined = [...new Set([...listingPhotos, ...archived])].filter((url) => url && !warehouseUrls.has(url));

    function arrangePhotos(sellerDetails, productPhotos) {
      sellerUrls = new Set(sellerDetails.filter((url) => url && !warehouseUrls.has(url)));
      setGallery([...sellerUrls, ...warehouseUrls, ...productPhotos]);
      renderProductPhotos(productPhotos);
    }

    arrangePhotos(combined.slice(1), combined);
    const sku = await skuRequest;
    showVariants(sku.groups);
    const variantPhotos = sku.groups.flatMap(({ options }) => options.map(({ image }) => image)).filter(Boolean);
    const sellerDetails = [...sku.images, ...combined.slice(1)];
    const additionalPhotos = new Set([...sellerDetails, ...warehouseUrls, ...combined]).size < 2 ? variantPhotos : [];
    if (sku.images.length || additionalPhotos.length) {
      arrangePhotos(sellerDetails, [...combined, ...sku.images, ...additionalPhotos]);
    }
  }

  async function loadItem() {
    const id = new URLSearchParams(location.search).get('id');
    const { byId } = await catalog();
    const item = byId.get(id);
    if (!item) {
      setLabel('loading', 'itemMissing', 'This product is unavailable in the preview.');
      return;
    }
    cover.src = item.image;
    cover.alt = item.name;
    document.title = item.name + ' | VigorBuy Findsheets';
    get('title').textContent = item.name;
    const category = get('category');
    category.dataset.t = 'cat:' + item.category;
    category.textContent = translate(category.dataset.t, names[item.category] || 'Weidian product');
    const formatted = price(item.price);
    if (formatted) paintPrice(get('amount'), item.price);
    get('price').hidden = !formatted;
    root.querySelector('[data-currency-code]').textContent = currentCurrency();
    get('item').textContent = item.id;
    get('buy').href = buy(item.id);
    get('source').href = source + item.path;
    get('weidian').href = 'https://weidian.com/item.html?itemID=' + item.id;
    get('qc').href = '/qc/?q=' + item.id;
    warehouseUrls = new Set((warehouse[item.id] || []).map(({ image }) => image));
    const productPhotos = [item.image, ...(item.images || [])];
    setGallery([...warehouseUrls, ...productPhotos]);
    renderProductPhotos(productPhotos);
    for (const link of menu.querySelectorAll('[data-agent-link]')) link.href = agentHref(link.dataset.agentLink, item.id);
    get('detail').hidden = false;
    get('loading').hidden = true;
    void fillPhotos(item);
  }

  if (root.dataset.id) {
    void fillPhotos({
      id: root.dataset.id,
      path: new URL(get('source').href).pathname,
      images: [...get('product-grid').querySelectorAll('a')].map((link) => link.getAttribute('href')),
    });
  } else {
    void loadItem().catch(() => setLabel('loading', 'itemError', 'Could not load the product. Refresh to try again.'));
  }
}
