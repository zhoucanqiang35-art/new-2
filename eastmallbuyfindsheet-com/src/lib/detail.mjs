import {card, element, external, readJson, readCatalog, referencePrice, showQc} from './browser.mjs';
import {categoryLabel, officialFavicon, originalUrl, parseId, productImage, productUrl, sourceOrigin} from './catalog.mjs';
import {categoryFinds, categoryLanding} from './landing-paths.mjs';
import {agents, purchaseFor, shoppingOptions} from './shopping.mjs';

const target = document.querySelector('#product-detail');
const id = target.dataset.item || parseId(new URLSearchParams(location.search).get('id') ?? '');

function productMedia(type) {
  return readJson('/api/product-media?type=' + type + '&id=' + encodeURIComponent(id));
}

function gallery(product, images) {
  const photos = [...new Set([productImage(product), ...images])];
  const cover = element('img', {src: photos[0], alt: product.name, className: 'detail-image', translate: false, fetchPriority: 'high'});
  const counter = element('span', {className: 'gallery-count'});
  const previous = element('button', {type: 'button', className: 'gallery-arrow gallery-previous', textContent: '‹'});
  const next = element('button', {type: 'button', className: 'gallery-arrow gallery-next', textContent: '›'});
  previous.setAttribute('aria-label', 'Previous seller photo');
  next.setAttribute('aria-label', 'Next seller photo');
  const stage = element('div', {className: 'gallery-stage'}, [cover, previous, next, counter]);
  const heading = element('h2', {id: 'listing-photo-options', textContent: 'Seller photos'});
  const selectedLabel = element('span', {className: 'photo-option-label', translate: false});
  const thumbs = element('div', {className: 'detail-photo-options'});
  const options = element('section', {className: 'detail-options'}, [
    element('div', {className: 'media-heading'}, [heading, selectedLabel]),
    thumbs,
  ]);
  options.setAttribute('aria-labelledby', heading.id);
  let current = 0;
  let choices = photos.map((photo) => ({photo, label: ''}));

  function selectPhoto(url, label = '') {
    cover.src = url;
    cover.alt = label ? product.name + ' · ' + label : product.name;
    selectedLabel.textContent = label;
    const position = photos.indexOf(url);
    counter.textContent = label ? 'Style' : (position + 1) + ' / ' + photos.length;
    for (const button of thumbs.children) button.setAttribute('aria-pressed', String(button.dataset.photo === url));
  }

  function showPhoto(index) {
    current = (index + photos.length) % photos.length;
    selectPhoto(photos[current]);
  }

  function renderOptions(styles = false) {
    options.hidden = !styles && photos.length < 2;
    heading.textContent = styles ? 'Styles' : 'Seller photos';
    thumbs.replaceChildren(...choices.map(({photo, label}, index) => {
      const button = element('button', {type: 'button', title: label}, [
        element('img', {src: photo, alt: '', width: 74, height: 74, loading: 'lazy'}),
      ]);
      button.setAttribute('aria-label', label ? 'View style ' + label : 'View seller photo ' + (index + 1));
      button.setAttribute('aria-pressed', String(cover.getAttribute('src') === photo));
      button.dataset.photo = photo;
      button.draggable = false;
      button.addEventListener('click', () => {
        if (styles) selectPhoto(photo, label || String(index + 1));
        else showPhoto(index);
      });
      return button;
    }));
  }

  previous.hidden = next.hidden = photos.length < 2;
  previous.addEventListener('click', () => showPhoto(current - 1));
  next.addEventListener('click', () => showPhoto(current + 1));
  stage.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || photos.length < 2) return;
    event.preventDefault();
    showPhoto(current + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  cover.addEventListener('error', () => {
    if (cover.getAttribute('src') !== photos[0]) showPhoto(0);
  });
  let swipeStart;
  stage.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    swipeStart = {x: touch.clientX, y: touch.clientY};
  }, {passive: true});
  stage.addEventListener('touchend', (event) => {
    if (!swipeStart || photos.length < 2) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - swipeStart.x;
    const dy = touch.clientY - swipeStart.y;
    swipeStart = undefined;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) showPhoto(current + (dx < 0 ? 1 : -1));
  }, {passive: true});

  renderOptions();
  showPhoto(0);
  productMedia('styles').then(({styles}) => {
    if (!styles.length) return;
    choices = [...new Map(styles.map((style) => [style.photo, style])).values()];
    renderOptions(true);
  }).catch(() => {});
  return {stage, options};
}

async function copyLink(url, status) {
  try {
    await navigator.clipboard.writeText(url);
    status.textContent = 'Link copied.';
  } catch {
    status.replaceChildren(element('label', {textContent: 'Copy this link'}, [
      element('input', {readOnly: true, value: url}),
    ]));
    const field = status.querySelector('input');
    field.focus();
    field.select();
  }
}

async function warehousePhotos(heading, status, grid, product) {
  try {
    const {status: state, photos} = await productMedia('qc');
    if (state === 'ready' && photos.length) {
      heading.textContent = photos.length + (photos.length === 1 ? ' photo' : ' photos');
      status.hidden = true;
      grid.replaceChildren(...photos.map((url, index) => {
        const label = 'Warehouse QC photo ' + (index + 1);
        const link = external('', url);
        link.setAttribute('aria-label', label + ' · open image');
        link.referrerPolicy = 'no-referrer';
        link.append(element('img', {src: url, alt: label, loading: 'lazy', width: 232, height: 177, referrerPolicy: 'no-referrer'}));
        return link;
      }));
      return;
    }
    status.textContent = state === 'pending' ? 'The main site is checking for warehouse QC photos.' :
      'Findspreadsheet currently has no warehouse QC photos for this item.';
  } catch {
    await showQc(status, id, product.sourcePath);
  }
}

function shoppingDialog(product) {
  const trigger = element('button', {type: 'button', className: 'button agent-picker-button', textContent: 'Other shopping agents'});
  const title = element('h2', {id: 'agent-dialog-title', textContent: 'Other shopping agents'});
  const close = element('button', {type: 'button', className: 'button outline', textContent: 'Close'});
  const search = element('input', {type: 'search', placeholder: 'Search buying agents', className: 'agent-dialog-search'});
  search.setAttribute('aria-label', 'Search buying agents');
  const options = element('div', {className: 'agent-dialog-options'}, agents.filter(({id}) => id !== 'findspreadsheet').map((agent) => {
    const destination = purchaseFor(agent.id, product.weidianId, product.sourcePath);
    const link = external('', destination.url, 'button agent-dialog-button');
    if (destination.sponsored) link.rel = 'sponsored noopener';
    link.append(
      element('img', {src: agent.id === 'eastmallbuy' ? officialFavicon : agent.logo, alt: '', width: 22, height: 22, loading: 'lazy'}),
      element('span', {textContent: agent.name, translate: false}),
    );
    return link;
  }));
  const dialog = element('dialog', {id: 'agent-dialog', className: 'agent-dialog'}, [
    element('div', {className: 'agent-dialog-heading'}, [title, close]),
    search,
    options,
  ]);
  search.addEventListener('input', () => {
    const term = search.value.trim().toLowerCase();
    for (const link of options.children) link.hidden = !link.textContent.toLowerCase().includes(term);
  });
  dialog.setAttribute('aria-labelledby', title.id);
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', () => {
    dialog.showModal();
    search.focus();
    trigger.setAttribute('aria-expanded', 'true');
  });
  dialog.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  });
  close.addEventListener('click', () => dialog.close());
  return [trigger, dialog];
}

function render(product, photos, catalog) {
  if (!target.dataset.listing) document.title = product.name + ' | EastMallBuy Findsheet';
  const buy = external('', '', 'button dark');
  const updatePurchase = () => {
    const destination = purchaseFor(shoppingOptions().agent, id, product.sourcePath);
    buy.textContent = destination.name;
    buy.href = destination.url;
    buy.rel = destination.sponsored ? 'sponsored noopener' : 'noopener';
  };
  updatePurchase();
  window.addEventListener('shopping-change', updatePurchase);
  window.addEventListener('pageshow', updatePurchase);
  const [otherAgents, agentDialog] = shoppingDialog(product);
  const estimate = referencePrice(product.price);
  const {stage, options} = gallery(product, photos);
  const copy = element('button', {type: 'button', className: 'button outline', textContent: 'Copy Weidian link'});
  const copyStatus = element('div', {className: 'copy-link-status'});
  copyStatus.setAttribute('role', 'status');
  copy.addEventListener('click', () => copyLink(originalUrl(id), copyStatus));
  const info = element('div', {className: 'detail-copy'}, [
    element('p', {className: 'eyebrow', textContent: categoryLabel(product.category).toUpperCase()}),
    element('h1', {textContent: product.name, translate: false}),
    element('p', {className: 'detail-item-id', textContent: 'Weidian item ' + id}),
    ...(estimate ? [element('p', {className: 'detail-estimate'}, [estimate, ' estimated item price'])] : []),
    element('div', {className: 'detail-buy'}, [buy]),
    element('div', {className: 'detail-secondary-actions'}, [otherAgents, copy]),
    copyStatus,
    agentDialog,
    options,
    element('div', {className: 'detail-listing-links'}, [
      external('Original Weidian listing', originalUrl(id)),
      external('View on Findspreadsheet', new URL(product.sourcePath, sourceOrigin).href),
      element('a', {href: '#warehouse-qc', textContent: 'Warehouse QC photos'}),
    ]),
    element('p', {className: 'detail-purchase-note', textContent: 'Check sizing and availability with the seller. Agent links may contain a referral code.'}),
  ]);
  const qcStatus = element('div', {className: 'result-status', textContent: 'Checking Findspreadsheet for warehouse photos…'});
  qcStatus.setAttribute('role', 'status');
  const qcCount = element('span', {className: 'qc-photo-count'});
  const qcGrid = element('div', {className: 'detail-qc-grid'});
  const qcSection = element('section', {className: 'subsection detail-qc', id: 'warehouse-qc'}, [
    element('div', {className: 'media-heading'}, [element('h2', {textContent: 'Warehouse QC photos'}), qcCount]),
    qcStatus,
    qcGrid,
  ]);
  const related = catalog.filter((item) => item.category === product.category && item.weidianId !== id && /^\d+$/.test(item.weidianId ?? '')).slice(0, 4);
  target.replaceChildren(
    element('div', {className: 'detail-grid'}, [stage, info]),
    qcSection,
    element('section', {className: 'subsection'}, [element('div', {className: 'section-title'}, [element('h2', {textContent: 'More in ' + categoryLabel(product.category)}), element('a', {textContent: 'Browse category', href: categoryLanding(product.category) || categoryFinds(product.category)})]), element('div', {className: 'product-grid'}, related.map((item) => card(item)))]),
  );
  void warehousePhotos(qcCount, qcStatus, qcGrid, product);
}

async function init() {
  try {
    if (target.dataset.listing) {
      const {product, photos, related} = JSON.parse(target.dataset.listing);
      const sizeGuide = target.querySelector('[data-size-guide]');
      render(product, photos, related);
      if (sizeGuide) target.querySelector('#warehouse-qc').after(sizeGuide);
      return;
    }
    const canonical = productUrl(id);
    if (canonical.startsWith('/products/')) {
      location.replace(canonical);
      return;
    }
    const catalog = await readCatalog();
    const product = catalog.find((item) => id && item.weidianId === id);
    if (!product) {
      target.textContent = 'This item is missing from the saved catalog.';
      return;
    }
    const galleries = await readJson('/data/gallery-' + id.slice(0, 4) + '.json').catch(() => ({}));
    render(product, Array.isArray(galleries[id]) ? galleries[id] : [], catalog);
  } catch {
    target.textContent = 'The listing could not load. Reload the page to try again.';
  }
}

init();
