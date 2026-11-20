import {card, element, external, readJson, referencePrice, showQc} from './browser.mjs';
import {categoryLabel, originalUrl, parseId, productImage, sourceOrigin} from './catalog.mjs';
import {agents, purchaseFor, savedItems, shoppingOptions, toggleSaved} from './shopping.mjs';

const target = document.querySelector('#product-detail');
const id = parseId(new URLSearchParams(location.search).get('id') ?? '');

function gallery(product, images) {
  const photos = [...new Set([productImage(product), ...images.filter((image) => image !== product.image)])];
  const cover = element('img', {src: photos[0], alt: product.name, className: 'detail-image'});
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
  const trigger = element('button', {type: 'button', className: 'button outline agent-picker-button', textContent: 'Other shopping agents'});
  const title = element('h2', {id: 'other-agents-title', textContent: 'Other shopping agents'});
  const close = element('button', {type: 'button', className: 'button outline', textContent: 'Close'});
  const links = agents.filter(({id}) => id !== 'findspreadsheet').map((agent) => {
    const {url, sponsored} = purchaseFor(agent.id, product.weidianId, product.sourcePath);
    const link = external('', url, 'button agent-choice');
    if (sponsored) link.rel = 'sponsored noopener';
    link.append(
      element('img', {src: agent.logo, alt: '', loading: 'lazy', width: 22, height: 22}),
      element('span', {textContent: agent.name, translate: false}),
    );
    return link;
  });
  const dialog = element('dialog', {id: 'other-agents', className: 'agent-picker'}, [
    element('div', {className: 'agent-picker-head'}, [title, close]),
    element('div', {className: 'agent-picker-list'}, links),
  ]);
  dialog.setAttribute('aria-labelledby', title.id);
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', () => {
    dialog.showModal();
    trigger.setAttribute('aria-expanded', 'true');
  });
  dialog.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  });
  close.addEventListener('click', () => dialog.close());
  return {trigger, dialog};
}

function render(product, photos, catalog) {
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
  const {trigger, dialog} = platformPicker(product);
  const info = element('aside', {className: 'listing-purchase'}, [
    element('h2', {textContent: 'Open listing'}),
    ...(estimate ? [element('p', {className: 'detail-estimate'}, [estimate, ' estimated item price'])] : []),
    buy,
    trigger,
    save,
    element('p', {textContent: 'Check size, stock and shipping with your selected agent before ordering. Agent links may contain a referral code.'}),
    external('Original Weidian listing', originalUrl(id)),
    external('View on FindSpreadsheet', new URL(product.sourcePath, sourceOrigin).href),
  ]);
  const qcStatus = element('div', {className: 'result-status'});
  qcStatus.setAttribute('role', 'status');
  const related = catalog.filter((item) => item.category === product.category && item.weidianId !== id && /^\d+$/.test(item.weidianId ?? '')).slice(0, 4);
  const qc = element('section', {className: 'listing-qc', id: 'warehouse-qc'}, [
    element('h2', {textContent: 'Warehouse QC photos'}),
    qcStatus,
  ]);
  const tabs = element('nav', {className: 'listing-jumps'}, [
    element('a', {href: '#listing-media', textContent: 'Seller and QC photos'}),
    element('a', {href: '#related', textContent: 'Related finds'}),
  ]);
  tabs.setAttribute('aria-label', 'Listing sections');
  const relatedSection = element('section', {className: 'listing-related', id: 'related'}, [
    element('div', {className: 'section-title'}, [
      element('h2', {textContent: 'More in ' + categoryLabel(product.category)}),
      element('a', {textContent: 'Browse category', href: categoryPath}),
    ]),
    element('div', {className: 'product-grid'}, related.map((item) => card(item))),
  ]);
  const side = element('div', {className: 'listing-side'}, [qc, info]);
  const comparison = element('div', {className: 'listing-layout', id: 'listing-media'}, [
    gallery(product, photos),
    side,
  ]);
  target.replaceChildren(title, tabs, comparison, relatedSection, dialog);
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
    render(product, Array.isArray(galleries[id]) ? galleries[id] : [], catalog);
  } catch {
    target.textContent = 'The listing could not load. Reload the page to try again.';
  }
}

init();
