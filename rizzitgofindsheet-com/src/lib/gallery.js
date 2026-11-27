import { loadSku } from './sku.js';

const product = document.querySelector('[data-product]');
const gallery = product.querySelector('[data-gallery]');
const main = gallery.querySelector('.main-photo');
const mainImage = main.querySelector('img');
const thumbnails = gallery.querySelector('[data-thumbnails]');
const previous = gallery.querySelector('[data-gallery-previous]');
const next = gallery.querySelector('[data-gallery-next]');
const count = gallery.querySelector('[data-gallery-count]');
const sellerPhotos = product.querySelector('[data-seller-photos]');
const failedPhotos = new Set();
const options = product.querySelector('[data-options]');
const seller = product.querySelector('[data-seller]');
const copyStatus = product.querySelector('[data-copy-status]');

const absolute = (url) => new URL(url, location.href).href;

function availablePhotos() {
  return [...thumbnails.children].filter((button) => !failedPhotos.has(absolute(button.dataset.photo)));
}

function updateCarousel(reveal = false) {
  const photos = availablePhotos();
  const active = photos.findIndex((button) => absolute(button.dataset.photo) === mainImage.src);
  for (const button of thumbnails.children) {
    button.setAttribute('aria-pressed', String(button === photos[active]));
  }
  previous.hidden = next.hidden = count.hidden = photos.length < 2;
  const position = photos.length > 1 ? (active + 1) + ' / ' + photos.length : '';
  if (count.textContent !== position) count.textContent = position;
  if (reveal && active >= 0) {
    const rail = thumbnails.getBoundingClientRect();
    const tile = photos[active].getBoundingClientRect();
    if (tile.left < rail.left || tile.right > rail.right) {
      thumbnails.scrollLeft += tile.left - rail.left - (rail.width - tile.width) / 2;
    }
  }
}

function showPhoto(url, reveal = true) {
  if (failedPhotos.has(absolute(url))) return;
  mainImage.src = url;
  main.href = url;
  updateCarousel(reveal);
}

function stepPhoto(direction) {
  const photos = availablePhotos();
  if (photos.length < 2) return;
  const active = photos.findIndex((button) => absolute(button.dataset.photo) === mainImage.src);
  const start = active >= 0 ? active : direction < 0 ? 0 : photos.length - 1;
  const index = (start + direction + photos.length) % photos.length;
  showPhoto(photos[index].dataset.photo);
}

function handlePhotoFailure(image) {
  failedPhotos.add(image.src);
  if (image !== mainImage) image.parentElement.hidden = true;
  if (image === mainImage) {
    const available = availablePhotos()[0];
    if (available) showPhoto(available.dataset.photo);
  }
  updateCarousel();
}

product.addEventListener('error', (event) => {
  if (event.target.matches?.('[data-listing-photo]')) handlePhotoFailure(event.target);
}, true);
for (const image of product.querySelectorAll('[data-listing-photo]')) {
  if (image.complete && !image.naturalWidth) handlePhotoFailure(image);
}

function addPhotos(urls) {
  const known = new Set([...thumbnails.children].map((button) => absolute(button.dataset.photo)));
  for (const src of urls) {
    const url = absolute(src);
    if (known.has(url)) continue;
    known.add(url);
    const button = document.createElement('button');
    const position = thumbnails.children.length + 1;
    button.type = 'button';
    button.dataset.photo = src;
    button.setAttribute('aria-label', 'Show product photo ' + position);
    button.setAttribute('aria-pressed', 'false');
    const image = document.createElement('img');
    image.alt = '';
    image.loading = 'eager';
    image.decoding = 'async';
    image.dataset.listingPhoto = '';
    image.src = src;
    const link = document.createElement('a');
    link.href = src;
    link.target = '_blank';
    link.rel = 'noopener';
    const detail = image.cloneNode();
    detail.width = 220;
    detail.height = 200;
    detail.alt = 'Product detail photo ' + position;
    button.append(image);
    link.append(detail);
    thumbnails.append(button);
    sellerPhotos.append(link);
    if (failedPhotos.has(mainImage.src)) showPhoto(src);
  }
  updateCarousel();
}

thumbnails.addEventListener('click', (event) => {
  const button = event.target.closest('[data-photo]');
  if (button) showPhoto(button.dataset.photo);
});

previous.addEventListener('click', () => stepPhoto(-1));
next.addEventListener('click', () => stepPhoto(1));
gallery.addEventListener('keydown', (event) => {
  const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
  if (!direction || availablePhotos().length < 2) return;
  event.preventDefault();
  stepPhoto(direction);
  if (thumbnails.contains(document.activeElement)) {
    thumbnails.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
  }
});

let touchStart;
let suppressTapUntil = 0;
main.addEventListener('touchstart', (event) => {
  touchStart = event.touches.length === 1 ? event.touches[0] : undefined;
}, { passive: true });
main.addEventListener('touchcancel', () => { touchStart = undefined; }, { passive: true });
main.addEventListener('touchend', (event) => {
  const start = touchStart;
  touchStart = undefined;
  if (!start || availablePhotos().length < 2) return;
  const end = event.changedTouches[0];
  if (!end) return;
  const horizontal = end.clientX - start.clientX;
  const vertical = end.clientY - start.clientY;
  if (Math.abs(horizontal) < 36 || Math.abs(horizontal) < Math.abs(vertical) * 1.3) return;
  suppressTapUntil = Date.now() + 450;
  stepPhoto(horizontal < 0 ? 1 : -1);
}, { passive: true });
main.addEventListener('click', (event) => {
  if (Date.now() < suppressTapUntil) event.preventDefault();
});
updateCarousel();

product.querySelector('[data-copy-seller]').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(seller.href);
    copyStatus.textContent = 'Weidian link copied.';
  } catch {
    copyStatus.textContent = 'Open the Weidian listing to copy its link.';
  }
});

function renderOptions(groups) {
  for (const { name, options: entries } of groups) {
    const field = document.createElement('fieldset');
    const label = document.createElement('legend');
    label.textContent = /size|尺码|尺寸/i.test(name) ? 'Size' : /style|color|colour|款式|颜色/i.test(name) ? 'Style' : name;
    const choices = document.createElement('div');
    choices.className = entries.some((entry) => entry.image) ? 'variant-options variant-pictures' : 'variant-options';
    const selected = document.createElement('p');
    selected.setAttribute('role', 'status');
    selected.dataset.catalogCopy = '';
    for (const entry of entries) {
      let imageReady = Boolean(entry.image);
      const button = document.createElement('button');
      button.type = 'button';
      button.title = entry.label;
      button.setAttribute('aria-label', entry.label);
      button.setAttribute('aria-pressed', 'false');
      button.dataset.catalogCopy = '';
      if (entry.image) {
        const image = document.createElement('img');
        image.src = entry.image;
        image.alt = '';
        image.loading = 'eager';
        image.decoding = 'async';
        image.addEventListener('error', () => {
          imageReady = false;
          button.textContent = entry.label;
        }, { once: true });
        button.append(image);
      } else {
        button.textContent = entry.label;
      }
      button.addEventListener('click', () => {
        for (const choice of choices.children) choice.setAttribute('aria-pressed', String(choice === button));
        selected.textContent = entry.label;
        if (imageReady) {
          addPhotos([entry.image]);
          showPhoto(entry.image);
        }
      });
      choices.append(button);
    }
    field.append(label, choices, selected);
    options.append(field);
  }
  options.hidden = !groups.length;
}

if (thumbnails.children.length < 2) {
  fetch('/api/gallery?path=' + encodeURIComponent(gallery.dataset.path)).then(async (response) => {
    if (response.ok) addPhotos((await response.json()).images);
  }).catch(() => {});
}
loadSku(product.dataset.product).then(({ groups, images }) => {
  renderOptions(groups);
  addPhotos(images);
}).catch(() => {});
