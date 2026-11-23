import {element, external, readJson, referencePrice} from './browser.mjs';
import {categoryLabel, officialFavicon, originalUrl, parseId, productImage, productUrl, purchaseUrl, sourceOrigin} from './catalog.mjs';
import {isShopItem} from './landing-paths.mjs';
import {agents, purchaseFor} from './shopping.mjs';

const target = document.querySelector('#product-detail');
const id = target.dataset.item || parseId(new URLSearchParams(location.search).get('id') ?? '');

function productOptions() {
  return readJson('/api/product-media?type=styles&id=' + encodeURIComponent(id));
}

let savedMedia;
async function savedProductMedia() {
  savedMedia ??= readJson('/data/product-media-saved.json').catch(() => ({}));
  return (await savedMedia)[id] ?? {};
}

function gallery(product, images, purchasePhotos = []) {
  const catalogCover = productImage(product);
  const detailPhotos = [...new Set(images)].filter((photo) => photo !== catalogCover);
  let photos = purchasePhotos.length ? purchasePhotos : [catalogCover];
  const cover = element('img', {src: photos[0], alt: product.name, className: 'detail-image', translate: false, fetchPriority: 'high'});
  const counter = element('span', {className: 'gallery-count'});
  const previous = element('button', {type: 'button', className: 'gallery-arrow gallery-previous', textContent: '‹'});
  const next = element('button', {type: 'button', className: 'gallery-arrow gallery-next', textContent: '›'});
  previous.setAttribute('aria-label', 'Previous seller photo');
  next.setAttribute('aria-label', 'Next seller photo');
  const stage = element('div', {className: 'gallery-stage'}, [cover, previous, next, counter]);
  const sellerThumbs = element('div', {className: 'seller-photo-filmstrip'});
  sellerThumbs.setAttribute('aria-label', 'Purchase listing photos');
  const sellerGallery = element('div', {className: 'detail-gallery'}, [stage, sellerThumbs]);

  const heading = element('h2', {id: 'listing-photo-options', textContent: 'Catalog photos'});
  const count = element('span', {className: 'detail-photo-count'});
  const selectedLabel = element('span', {className: 'photo-option-label', translate: false});
  selectedLabel.setAttribute('aria-live', 'polite');
  const thumbs = element('div', {className: 'detail-photo-options'});
  const options = element('section', {className: 'detail-options'}, [
    element('div', {className: 'media-heading'}, [heading, count]), thumbs, selectedLabel,
  ]);
  options.setAttribute('aria-labelledby', heading.id);
  thumbs.tabIndex = 0;
  thumbs.setAttribute('role', 'group');
  thumbs.setAttribute('aria-labelledby', heading.id);
  let current = 0;
  let activeLabel = '';

  function selectPhoto(url, label = '') {
    cover.src = url;
    cover.alt = label ? product.name + ' · ' + label : product.name;
    selectedLabel.textContent = label;
    activeLabel = label;
    const position = photos.indexOf(url);
    counter.textContent = position < 0 ? 'Product photo' : (position + 1) + ' / ' + photos.length;
    for (const button of sellerThumbs.children) button.setAttribute('aria-pressed', String(button.dataset.photo === url));
    highlightPhoto();
  }

  function highlightPhoto() {
    for (const button of thumbs.children) {
      button.setAttribute('aria-pressed', String(button.dataset.photo === cover.getAttribute('src') &&
        (!activeLabel || button.title === activeLabel)));
    }
  }

  function showPhoto(index) {
    current = (index + photos.length) % photos.length;
    selectPhoto(photos[current]);
    const selected = sellerThumbs.children[current];
    if (selected) {
      const strip = sellerThumbs.getBoundingClientRect();
      const tile = selected.getBoundingClientRect();
      if (tile.left < strip.left || tile.right > strip.right) {
        sellerThumbs.scrollLeft += tile.left < strip.left ? tile.left - strip.left : tile.right - strip.right;
      }
    }
  }

  function thumbnail(photo, label, description, select) {
    const button = element('button', {type: 'button', title: label}, [
      element('img', {src: photo, alt: '', width: 74, height: 74, loading: 'lazy', draggable: false}),
    ]);
    button.setAttribute('aria-label', description);
    button.setAttribute('aria-pressed', 'false');
    button.dataset.photo = photo;
    button.addEventListener('click', select);
    return button;
  }

  function setPurchaseGallery(list) {
    const selectedUrl = cover.getAttribute('src');
    const focusedIndex = [...sellerThumbs.children].indexOf(document.activeElement);
    photos = list;
    sellerThumbs.replaceChildren(...photos.map((photo, index) =>
      thumbnail(photo, '', 'View purchase listing photo ' + (index + 1), () => showPhoto(index))
    ));
    previous.hidden = next.hidden = photos.length < 2;
    showPhoto(Math.max(0, photos.indexOf(selectedUrl)));
    if (focusedIndex >= 0) sellerThumbs.children[Math.min(focusedIndex, photos.length - 1)]?.focus({preventScroll: true});
  }

  previous.addEventListener('click', () => showPhoto(current - 1));
  next.addEventListener('click', () => showPhoto(current + 1));
  stage.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || photos.length < 2) return;
    event.preventDefault();
    showPhoto(current + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  cover.addEventListener('error', () => {
    if (cover.getAttribute('src') !== catalogCover) cover.src = catalogCover;
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

  function showPhotoOptions(styles, listingPhotos, name, label) {
    const available = new Map();
    for (const {photo, label: caption} of styles) {
      if (!available.has(photo)) available.set(photo, caption);
    }
    listingPhotos.forEach((photo, index) => {
      if (!available.has(photo)) available.set(photo, label + ' ' + (index + 1));
    });
    if (!available.size) return;
    heading.textContent = name;
    count.textContent = available.size + (available.size === 1 ? ' photo' : ' photos');
    thumbs.replaceChildren(...[...available].map(([photo, caption], index) => {
      const description = caption || 'Photo ' + (index + 1);
      return thumbnail(photo, description, 'View ' + description, () => selectPhoto(photo, description));
    }));
    if (activeLabel) {
      const caption = available.get(cover.getAttribute('src'));
      if (caption) activeLabel = selectedLabel.textContent = caption;
    }
    highlightPhoto();
  }

  setPurchaseGallery(photos);
  showPhotoOptions([], [catalogCover, ...detailPhotos], 'Catalog photos', 'Catalog photo');
  productOptions().then(async (media) => {
    if (media.photos?.length) return media;
    const saved = await savedProductMedia();
    return {...media, photos: saved.photos};
  }).catch(savedProductMedia).then(({styles = [], photos: listingPhotos = []}) => {
    showPhotoOptions(styles, listingPhotos, 'Weidian styles and photos', 'Listing photo');
    if (listingPhotos.length && (listingPhotos.length !== photos.length || listingPhotos.some((photo, index) => photo !== photos[index]))) {
      setPurchaseGallery(listingPhotos);
    }
  }).catch(() => {});
  return {sellerGallery, options, detailPhotos};
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

function shoppingDialog(product) {
  const trigger = element('button', {type: 'button', className: 'button agent-picker-button', textContent: 'Other shopping agents'});
  const title = element('h2', {id: 'agent-dialog-title', textContent: 'Other shopping agents'});
  const close = element('button', {type: 'button', className: 'button outline', textContent: 'Close'});
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
    options,
  ]);
  dialog.setAttribute('aria-labelledby', title.id);
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', () => {
    dialog.showModal();
    close.focus();
    trigger.setAttribute('aria-expanded', 'true');
  });
  dialog.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  });
  close.addEventListener('click', () => dialog.close());
  return [trigger, dialog];
}

function render(product, photos, purchasePhotos) {
  if (!target.dataset.listing) document.title = product.name + ' | EastMallBuy Findsheet';
  const buy = external('Buy on EastMallBuy', purchaseUrl(id), 'button dark');
  buy.rel = 'sponsored noopener';
  const [otherAgents, agentDialog] = shoppingDialog(product);
  const estimate = referencePrice(product.price);
  const {sellerGallery, options, detailPhotos} = gallery(product, photos, purchasePhotos);
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
      external('View on Findspreadsheet', new URL(product.sourcePath, sourceOrigin).href),
    ]),
    element('p', {className: 'detail-purchase-note', textContent: 'Confirm available options on Weidian. Agent links may contain a referral code.'}),
  ]);
  const sellerDetails = element('section', {className: 'subsection detail-seller-photos'}, [
    element('div', {className: 'media-heading'}, [
      element('h2', {textContent: 'Product detail photos'}),
      element('span', {className: 'detail-photo-count', textContent: detailPhotos.length + (detailPhotos.length === 1 ? ' photo' : ' photos')}),
    ]),
    element('div', {className: 'detail-seller-photo-grid'}, detailPhotos.map((url, index) => {
      const label = 'Seller detail photo ' + (index + 1);
      const link = external('', url);
      link.append(element('img', {src: url, alt: label, loading: 'lazy', width: 232, height: 177}));
      return link;
    })),
  ]);
  target.replaceChildren(
    element('div', {className: 'detail-grid'}, [sellerGallery, info]),
    ...(detailPhotos.length ? [sellerDetails] : []),
  );
}

async function init() {
  if (!isShopItem(id)) {
    target.textContent = 'This item is unavailable in our Weidian store catalog.';
    return;
  }
  try {
    if (target.dataset.listing) {
      const {product, photos, purchasePhotos} = JSON.parse(target.dataset.listing);
      render(product, photos, purchasePhotos);
      return;
    }
    location.replace(productUrl(id));
  } catch {
    target.textContent = 'The listing could not load. Reload the page to try again.';
  }
}

init();
