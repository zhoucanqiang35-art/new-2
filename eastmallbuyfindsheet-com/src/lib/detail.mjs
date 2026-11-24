import {element, external, readJson, referencePrice} from './browser.mjs';
import {categoryLabel, officialFavicon, originalUrl, parseId, productImage, productThumbnail, productUrl, purchaseUrl, sourceOrigin} from './catalog.mjs';
import {isShopItem} from './landing-paths.mjs';
import {agents, purchaseFor} from './shopping.mjs';

const target = document.querySelector('#product-detail');
const id = target.dataset.item || parseId(new URLSearchParams(location.search).get('id') ?? '');

function productOptions() {
  return readJson('/api/product-media?type=styles&id=' + encodeURIComponent(id));
}

function gallery(product, images, purchaseMedia) {
  const catalogCover = productImage(product);
  const detailPhotos = [...new Set(images)].filter((photo) => photo !== catalogCover);
  let photos = purchaseMedia?.photos?.length ? purchaseMedia.photos : [catalogCover];
  const sellerGallery = target.querySelector('.detail-gallery');
  const stage = sellerGallery.querySelector('.gallery-stage');
  const cover = stage.querySelector('img');
  const counter = stage.querySelector('.gallery-count');
  const previous = stage.querySelector('.gallery-previous');
  const next = stage.querySelector('.gallery-next');
  const sellerThumbs = sellerGallery.querySelector('.seller-photo-filmstrip');

  const options = target.querySelector('.detail-options');
  const heading = options.querySelector('h2');
  const count = options.querySelector('.detail-photo-count');
  const thumbs = options.querySelector('.detail-photo-options');
  const selectedLabel = element('span', {className: 'photo-option-label', translate: false});
  selectedLabel.setAttribute('aria-live', 'polite');
  options.append(selectedLabel);
  let current = 0;
  let activeLabel = '';
  let selectedPhoto = photos[0];
  let interacted = false;

  function selectPhoto(url, label = '') {
    if (cover.getAttribute('src') !== url) cover.src = url;
    selectedPhoto = url;
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
      button.setAttribute('aria-pressed', String(button.dataset.photo === selectedPhoto &&
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
    const image = element('img', {loading: 'lazy', fetchPriority: 'low', decoding: 'async',
      src: productThumbnail(photo), alt: '', width: 74, height: 74, draggable: false});
    const button = element('button', {type: 'button', title: label}, [image]);
    button.setAttribute('aria-label', description);
    button.setAttribute('aria-pressed', 'false');
    button.dataset.photo = photo;
    button.addEventListener('click', () => {
      interacted = true;
      select();
    });
    return button;
  }

  function setPurchaseGallery(list) {
    const focusedIndex = [...sellerThumbs.children].indexOf(document.activeElement);
    photos = list;
    sellerThumbs.replaceChildren(...photos.map((photo, index) =>
      thumbnail(photo, '', 'View purchase listing photo ' + (index + 1), () => showPhoto(index))
    ));
    previous.hidden = next.hidden = photos.length < 2;
    current = photos.indexOf(selectedPhoto);
    selectPhoto(selectedPhoto, activeLabel);
    if (focusedIndex >= 0) sellerThumbs.children[Math.min(focusedIndex, photos.length - 1)]?.focus({preventScroll: true});
    if (current < 0 && !interacted) {
      // Keep the existing photo visible while the first purchase photo loads.
      const first = new Image();
      first.src = photos[0];
      first.decode().then(() => {
        if (!interacted) showPhoto(0);
      }).catch(() => {});
    }
  }

  function movePhoto(step) {
    interacted = true;
    showPhoto(current < 0 ? (step < 0 ? photos.length - 1 : 0) : current + step);
  }

  previous.addEventListener('click', () => movePhoto(-1));
  next.addEventListener('click', () => movePhoto(1));
  stage.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || photos.length < 2) return;
    event.preventDefault();
    movePhoto(event.key === 'ArrowLeft' ? -1 : 1);
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
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) movePhoto(dx < 0 ? 1 : -1);
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
      const caption = available.get(selectedPhoto);
      if (caption) activeLabel = selectedLabel.textContent = caption;
    }
    highlightPhoto();
  }

  setPurchaseGallery(photos);
  showPhotoOptions([], [catalogCover, ...detailPhotos], 'Catalog photos', 'Catalog photo');
  if (purchaseMedia?.styles?.length || purchaseMedia?.photos?.length) {
    showPhotoOptions(purchaseMedia.styles ?? [], purchaseMedia.photos ?? [], 'Weidian styles and photos', 'Listing photo');
  }
  productOptions().then(({styles = [], photos: listingPhotos = []}) => {
    const purchasePhotos = listingPhotos.length ? listingPhotos : purchaseMedia?.photos ?? [];
    showPhotoOptions(styles.length ? styles : purchaseMedia?.styles ?? [], purchasePhotos, 'Weidian styles and photos', 'Listing photo');
    if (listingPhotos.length && (listingPhotos.length !== photos.length || listingPhotos.some((photo, index) => photo !== photos[index]))) {
      setPurchaseGallery(listingPhotos);
    }
  }).catch(() => {});
  return {options, detailPhotos};
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

function render(product, photos, purchaseMedia) {
  const buy = external('Buy on EastMallBuy', purchaseUrl(id), 'button dark');
  buy.rel = 'sponsored noopener';
  const [otherAgents, agentDialog] = shoppingDialog(product);
  const estimate = referencePrice(product.price);
  const {options, detailPhotos} = gallery(product, photos, purchaseMedia);
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
      link.append(element('img', {src: productThumbnail(url, 480), alt: label, loading: 'lazy', fetchPriority: 'low', decoding: 'async', width: 232, height: 177}));
      return link;
    })),
  ]);
  target.querySelector('.detail-copy').replaceWith(info);
  if (detailPhotos.length) target.append(sellerDetails);
}

async function init() {
  if (!isShopItem(id)) {
    target.textContent = 'This item is unavailable in our Weidian store catalog.';
    return;
  }
  try {
    if (target.dataset.listing) {
      const {product, photos, purchaseMedia} = JSON.parse(target.dataset.listing);
      render(product, photos, purchaseMedia);
      return;
    }
    location.replace(productUrl(id));
  } catch {
    target.textContent = 'The listing could not load. Reload the page to try again.';
  }
}

init();
