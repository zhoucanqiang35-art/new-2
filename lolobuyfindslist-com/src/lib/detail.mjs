import {element, external, readJson, referencePrice, showQc} from './browser.mjs';
import {categoryLabel, originalUrl, parseId, productImage, sourceOrigin} from './catalog.mjs';
import {agents, purchaseFor, savedItems, shoppingOptions, toggleSaved} from './shopping.mjs';

const target = document.querySelector('#product-detail');
const id = parseId(new URLSearchParams(location.search).get('id') ?? '');

function gallery(product, images) {
  const primary = productImage(product);
  const photos = [...new Set([...images.map((url) => url === product.image ? primary : url), primary])];
  const cover = element('img', {src: photos[0], alt: product.name, className: 'detail-image', fetchPriority: 'high'});
  cover.addEventListener('error', () => {
    if (cover.getAttribute('src') !== primary) cover.src = primary;
  });
  const thumbs = element('div', {className: 'thumbs'});
  const count = element('span', {className: 'gallery-count', textContent: '1 / ' + photos.length});
  for (const [index, url] of photos.entries()) {
    if (photos.length < 2) break;
    const button = element('button', {type: 'button'}, [element('img', {src: url, alt: '', loading: 'lazy'})]);
    button.setAttribute('aria-label', 'View seller photo ' + (index + 1));
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      cover.src = url;
      count.textContent = (index + 1) + ' / ' + photos.length;
      for (const thumb of thumbs.children) thumb.setAttribute('aria-pressed', String(thumb === button));
    });
    thumbs.append(button);
  }
  const label = element('div', {className: 'gallery-label'}, [element('strong', {textContent: 'Seller photos'}), count]);
  return element('div', {className: 'listing-gallery'}, [label, cover, thumbs]);
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
    element('p', {textContent: 'Check size, stock and shipping with your selected agent before ordering. Agent links may contain a referral code.'}),
    element('div', {className: 'listing-source-links'}, [
      save,
      external('Original Weidian listing', originalUrl(id)),
      external('View on FindSpreadsheet', new URL(product.sourcePath, sourceOrigin).href),
    ]),
  ]);
  const qcStatus = element('div', {className: 'result-status'});
  qcStatus.setAttribute('role', 'status');
  const qc = element('section', {className: 'listing-qc', id: 'warehouse-qc'}, [
    element('h2', {textContent: 'Warehouse QC photos'}),
    qcStatus,
  ]);
  const comparison = element('div', {className: 'listing-layout', id: 'listing-media'}, [
    gallery(product, photos),
    info,
  ]);
  target.replaceChildren(comparison, qc);
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  showQc(qcStatus, id, product.sourcePath);
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
