import {card, element, external, readJson, referencePrice, showQc, readQc} from './browser.mjs';
import {categoryLabel, officialFavicon, originalUrl, parseId, productImage, productUrl, sourceOrigin} from './catalog.mjs';
import {categoryFinds, categoryLanding} from './landing-paths.mjs';
import {agents, purchaseFor, shoppingOptions} from './shopping.mjs';

const target = document.querySelector('#product-detail');
const id = target.dataset.item || parseId(new URLSearchParams(location.search).get('id') ?? '');

function gallery(product, images) {
  const photos = [...new Set([productImage(product), ...images.filter((image) => image !== product.image)])];
  const cover = element('img', {src: photos[0], alt: product.name, className: 'detail-image', translate: false});
  if (photos.length === 1) return element('div', {}, [cover]);

  const counter = element('span', {className: 'gallery-count'});
  const thumbs = element('div', {className: 'thumbs'});
  let current = 0;
  function showPhoto(index, reveal = false) {
    current = (index + photos.length) % photos.length;
    cover.src = photos[current];
    counter.textContent = (current + 1) + ' / ' + photos.length;
    for (const [position, thumb] of [...thumbs.children].entries()) {
      thumb.setAttribute('aria-pressed', String(position === current));
    }
    if (reveal) thumbs.children[current].scrollIntoView({block: 'nearest', inline: 'nearest'});
  }

  const previous = element('button', {type: 'button', className: 'gallery-arrow gallery-previous', textContent: '‹'});
  const next = element('button', {type: 'button', className: 'gallery-arrow gallery-next', textContent: '›'});
  previous.setAttribute('aria-label', 'Previous photo');
  next.setAttribute('aria-label', 'Next photo');
  previous.addEventListener('click', () => showPhoto(current - 1));
  next.addEventListener('click', () => showPhoto(current + 1));

  for (const [index, url] of photos.entries()) {
    const button = element('button', {type: 'button'}, [element('img', {src: url, alt: '', loading: 'lazy'})]);
    button.setAttribute('aria-label', 'View seller photo ' + (index + 1));
    button.addEventListener('click', () => showPhoto(index));
    thumbs.append(button);
  }
  cover.addEventListener('error', () => {
    if (cover.getAttribute('src') !== product.image) cover.src = product.image;
  });
  const stage = element('div', {className: 'gallery-stage'}, [cover, previous, next, counter]);
  const galleryPanel = element('div', {}, [stage, thumbs]);
  galleryPanel.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    showPhoto(current + (event.key === 'ArrowLeft' ? -1 : 1), true);
  });

  let swipeStart;
  stage.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    swipeStart = {x: touch.clientX, y: touch.clientY};
  }, {passive: true});
  stage.addEventListener('touchend', (event) => {
    if (!swipeStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - swipeStart.x;
    const dy = touch.clientY - swipeStart.y;
    swipeStart = undefined;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) showPhoto(current + (dx < 0 ? 1 : -1));
  }, {passive: true});
  showPhoto(0);
  return galleryPanel;
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
    trigger.setAttribute('aria-expanded', 'true');
  });
  dialog.addEventListener('close', () => trigger.setAttribute('aria-expanded', 'false'));
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
  const qcLink = element('a', {href: '#warehouse-qc', textContent: 'Checking saved QC records…'});
  readQc(id).then((record) => {
    qcLink.textContent = record?.status === 'available' ? 'Historical QC available' :
      record?.status === 'pending' ? 'QC check pending' : 'No saved QC record here';
  }).catch(() => { qcLink.textContent = 'QC status unavailable'; });
  const info = element('div', {className: 'detail-copy'}, [
    element('p', {className: 'eyebrow', textContent: categoryLabel(product.category).toUpperCase()}),
    element('h1', {textContent: product.name, translate: false}),
    element('p', {textContent: 'Weidian item ' + id}),
    ...(estimate ? [element('p', {className: 'detail-estimate'}, [estimate, ' estimated item price'])] : []),
    element('p', {}, [element('strong', {textContent: 'Size check.'}), ' Confirm the seller’s current size chart and selected variant. ', external('Check seller sizing', originalUrl(id))]),
    element('p', {}, [element('strong', {textContent: 'QC status.'}), ' ', qcLink]),
    element('div', {className: 'actions'}, [buy, external('Original Weidian listing', originalUrl(id), 'button outline'), otherAgents]),
    agentDialog,
    element('p', {textContent: 'Agent links may contain a referral code. Your selected agent handles orders and payment.'}),
    external('View on Findspreadsheet', new URL(product.sourcePath, sourceOrigin).href),
  ]);
  const qcStatus = element('div', {className: 'result-status'});
  qcStatus.setAttribute('role', 'status');
  const related = catalog.filter((item) => item.category === product.category && item.weidianId !== id && /^\d+$/.test(item.weidianId ?? '')).slice(0, 4);
  target.replaceChildren(
    element('div', {className: 'detail-grid'}, [gallery(product, photos), info]),
    element('section', {className: 'subsection', id: 'warehouse-qc'}, [element('h2', {textContent: 'Warehouse QC photos'}), qcStatus]),
    element('section', {className: 'subsection'}, [element('div', {className: 'section-title'}, [element('h2', {textContent: 'More in ' + categoryLabel(product.category)}), element('a', {textContent: 'Browse category', href: categoryLanding(product.category) || categoryFinds(product.category)})]), element('div', {className: 'product-grid'}, related.map((item) => card(item)))]),
  );
  showQc(qcStatus, id, product.sourcePath);
}

async function init() {
  try {
    if (target.dataset.listing) {
      const {product, photos, related} = JSON.parse(target.dataset.listing);
      const sizeGuide = target.querySelector('.subsection');
      render(product, photos, related);
      target.querySelector('#warehouse-qc').after(sizeGuide);
      return;
    }
    const canonical = productUrl(id);
    if (canonical.startsWith('/products/')) {
      location.replace(canonical);
      return;
    }
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
