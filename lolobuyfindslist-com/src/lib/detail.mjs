import {element, external, getQcRecord, photoGrid, readJson, referencePrice} from './browser.mjs';
import {categoryLabel, originalUrl, parseId, productImage, sourceOrigin} from './catalog.mjs';
import {agents, priceFor, purchaseFor, savedItems, shoppingOptions, toggleSaved} from './shopping.mjs';
import {loadProductOptions, showProductOptions} from './product-options.mjs';

const target = document.querySelector('#product-detail');
const id = parseId(new URLSearchParams(location.search).get('id') ?? '');

function gallery(product, images, onPhotos) {
  const primary = productImage(product);
  const cover = element('img', {src: primary, alt: product.name, className: 'detail-image', fetchPriority: 'high'});
  cover.addEventListener('error', () => {
    if (cover.getAttribute('src') !== primary) select(primary);
  });
  const thumbs = element('div', {className: 'thumbs'});
  const count = element('span', {className: 'gallery-count'});
  const stage = element('div', {className: 'listing-stage'}, [cover, count]);
  stage.setAttribute('aria-label', 'Seller photos');
  const previous = element('button', {type: 'button', className: 'listing-gallery-nav', textContent: '‹'});
  const next = element('button', {type: 'button', className: 'listing-gallery-nav', textContent: '›'});
  previous.setAttribute('aria-label', 'Previous product image');
  next.setAttribute('aria-label', 'Next product image');
  const controls = element('div', {className: 'listing-gallery-controls'}, [previous, thumbs, next]);
  const node = element('div', {className: 'listing-gallery'}, [stage, controls]);
  let photos = [];
  let active = primary;
  function move(direction) {
    const available = [...thumbs.children].filter((thumb) => !thumb.hidden);
    if (!available.length) return;
    const index = available.findIndex((thumb) => thumb.dataset.image === active);
    const nextIndex = index === -1 ? (direction > 0 ? 0 : available.length - 1)
      : (index + direction + available.length) % available.length;
    const button = available[nextIndex];
    select(button.dataset.image);
    button.scrollIntoView({block: 'nearest', inline: 'nearest'});
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));

  function select(url, option = false) {
    active = url;
    cover.src = url;
    const index = photos.indexOf(url);
    count.textContent = index < 0 || option ? '' : (index + 1) + ' / ' + photos.length;
    count.hidden = !count.textContent || photos.length < 2;
    count.setAttribute('aria-hidden', String(count.hidden));
    for (const thumb of thumbs.children) thumb.setAttribute('aria-pressed', String(!option && thumb.dataset.image === url));
  }
  function setPhotos(newImages, preferSource = false) {
    const galleryImages = preferSource ? newImages : [...newImages, primary];
    photos = [...new Set(galleryImages.map((url) => url === product.image ? primary : url))];
    const buttons = photos.length > 1 ? photos.map((url, index) => {
      const button = element('button', {type: 'button'}, [element('img', {src: url, alt: '', loading: 'lazy'})]);
      button.dataset.image = url;
      button.firstElementChild.addEventListener('error', () => { button.hidden = true; }, {once: true});
      button.setAttribute('aria-label', 'View seller photo ' + (index + 1));
      button.addEventListener('click', () => select(url));
      return button;
    }) : [];
    thumbs.replaceChildren(...buttons);
    controls.hidden = photos.length < 2;
    onPhotos(photos);
    select(preferSource ? photos[0] : photos.includes(active) ? active : photos[0]);
  }
  setPhotos(images);
  return {node, setPhotos, selectStyle: (url) => { if (url) select(url, true); }};
}

function platformPicker(product) {
  const links = agents.filter(({id}) => id !== 'findspreadsheet').map((agent) => {
    const {url, sponsored} = purchaseFor(agent.id, product.weidianId, product.sourcePath);
    const link = external('', url, 'choice-tile agent-choice');
    link.dataset.agent = agent.id;
    if (sponsored) link.rel = 'sponsored noopener';
    link.append(
      element('img', {src: agent.logo, alt: '', width: 22, height: 22}),
      element('span', {textContent: agent.name, translate: false}),
    );
    return link;
  });
  const menu = element('details', {className: 'choice-menu listing-agent-menu'}, [
    element('summary', {textContent: 'Other shopping agents'}),
    element('div', {className: 'choice-panel'}, [element('div', {className: 'choice-grid'}, links)]),
  ]);
  function filterCurrentAgent() {
    for (const link of links) link.hidden = link.dataset.agent === shoppingOptions().agent;
  }
  window.addEventListener('shopping-change', filterCurrentAgent);
  window.addEventListener('pageshow', filterCurrentAgent);
  filterCurrentAgent();
  return menu;
}

function copyProductLink(id) {
  const label = element('span', {textContent: 'Copy product link'});
  const button = element('button', {type: 'button', className: 'button outline listing-copy'}, [label]);
  const status = element('span', {className: 'visually-hidden'});
  status.setAttribute('role', 'status');
  let reset;
  button.addEventListener('click', async () => {
    const url = originalUrl(id);
    try {
      await navigator.clipboard.writeText(url);
      label.textContent = 'Link copied';
      status.textContent = 'Link copied';
      clearTimeout(reset);
      reset = setTimeout(() => { label.textContent = 'Copy product link'; }, 2200);
    } catch {
      const field = element('input', {type: 'url', value: url, readOnly: true, className: 'listing-link-field'});
      field.setAttribute('aria-label', 'Original Weidian listing');
      button.parentElement.after(field);
      field.focus();
      field.select();
      field.addEventListener('blur', () => field.remove(), {once: true});
    }
  });
  return [button, status];
}

function detailPhotos(product) {
  const heading = element('h2', {textContent: 'Detail photos'});
  const description = element('p', {textContent: 'Seller listing photos from FindSpreadsheet.'});
  const section = element('section', {className: 'listing-qc', id: 'warehouse-qc'});
  section.dataset.photoSource = 'listing';
  section.append(heading, description);
  let listingUrls = [];

  function showListing(urls) {
    listingUrls = urls;
    if (section.dataset.photoSource !== 'listing') return;
    heading.textContent = 'Detail photos';
    description.textContent = 'Seller listing photos from FindSpreadsheet.';
    const images = urls.map((url) => ({url}));
    section.replaceChildren(heading, description, photoGrid(images, 'Seller listing photo', productImage(product)));
  }

  async function showVerified() {
    const {photos, historical} = await getQcRecord(product.weidianId);
    if (!photos.length) return;
    section.dataset.photoSource = 'warehouse';
    heading.textContent = 'Warehouse QC photos';
    description.textContent = historical ? 'Historical warehouse photos for Weidian item ' + product.weidianId + '.'
      : 'Warehouse QC photos for Weidian item ' + product.weidianId + '.';
    section.replaceChildren(heading, description, photoGrid(photos, 'Warehouse QC photo', '', () => {
      section.dataset.photoSource = 'listing';
      showListing(listingUrls);
    }));
  }

  return {section, showListing, showVerified};
}

function render(product, photos) {
  document.title = product.name + ' | LoloBuy Findslist';
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
  const save = element('button', {type: 'button', className: 'button outline'});
  const updateSaved = () => {
    const active = savedItems().includes(id);
    save.textContent = active ? 'Saved' : 'Save find';
    save.setAttribute('aria-pressed', String(active));
  };
  save.addEventListener('click', () => toggleSaved(id));
  window.addEventListener('saved-change', updateSaved);
  window.addEventListener('pageshow', updateSaved);
  updateSaved();
  const estimate = referencePrice(product.price);
  const options = element('div', {className: 'listing-options', textContent: 'Loading listing options…'});
  const galleryPanel = detailPhotos(product);
  const media = gallery(product, photos, galleryPanel.showListing);
  const categoryPath = '/spreadsheet/?category=' + encodeURIComponent(product.category);
  const title = element('header', {className: 'listing-title'}, [
    element('a', {textContent: categoryLabel(product.category), href: categoryPath}),
    element('h1', {textContent: product.name, translate: false}),
    element('p', {textContent: 'Weidian item ' + id}),
  ]);
  buy.classList.add('listing-buy');
  const info = element('div', {className: 'listing-purchase'}, [
    title,
    ...(estimate ? [element('p', {className: 'detail-estimate'}, [estimate, ' estimated item price'])] : []),
    buy,
    element('div', {className: 'listing-primary-actions'}, [platformPicker(product), ...copyProductLink(id)]),
    options,
    element('div', {className: 'listing-source-links'}, [
      save,
      external('Original Weidian listing', originalUrl(id)),
      external('View on FindSpreadsheet', new URL(product.sourcePath, sourceOrigin).href),
    ]),
  ]);
  const comparison = element('div', {className: 'listing-layout', id: 'listing-media'}, [
    media.node,
    info,
  ]);
  target.replaceChildren(comparison, galleryPanel.section);
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  void galleryPanel.showVerified();
  loadProductOptions(id).catch(() => null).then((data) => {
    if (data?.images.length) media.setPhotos(data.images, true);
    showProductOptions(options, data, id, (image, amount) => {
      media.selectStyle(image);
      if (!estimate) return;
      const nextAmount = Number.isFinite(amount) ? amount : product.price;
      estimate.dataset.referencePrice = nextAmount;
      estimate.textContent = priceFor(nextAmount, shoppingOptions().currency);
    });
  });
}

async function init() {
  try {
    const catalog = await readJson('/data/catalog.json');
    const product = catalog.find((item) => id && item.weidianId === id);
    if (!product) {
      target.textContent = 'This item is missing from the saved catalog.';
      return;
    }
    const galleries = await readJson('/data/gallery-' + id.slice(0, 4) + '.json').catch(() => ({}));
    render(product, Array.isArray(galleries[id]) ? galleries[id] : []);
  } catch {
    target.textContent = 'The listing could not load. Reload the page to try again.';
  }
}

init();
