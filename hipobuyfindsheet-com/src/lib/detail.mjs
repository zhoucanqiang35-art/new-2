import { sourceOrigin, productUrl } from './catalog.mjs';
import { currentShopping, agentUrl, ratesDate } from './shopping-data.mjs';
import { readJson, parseId, element, external, localize, ui, qcLookup, renderQc, imageLink, favoriteButton, referencePrice } from './browser-data.mjs';

const target = document.getElementById('product-detail');
const id = parseId(new URLSearchParams(location.search).get('id') ?? '');

function sellerImage(url) {
  if (typeof url !== 'string') return false;
  try { return new URL(url).protocol === 'https:'; } catch { return false; }
}

function uniquePhotos(urls) {
  return [...new Set(urls.filter(sellerImage))];
}

function selectTile(tile, tiles) {
  for (const item of tiles.children) item.setAttribute('aria-pressed', String(item === tile));
}

function gallery(product, savedPhotos) {
  const cover = element('img', {
    src: product.image, alt: product.name, className: 'detail-image', width: 720, height: 630,
    fetchPriority: 'high',
  });
  const coverLink = external('', product.image, 'detail-cover');
  coverLink.append(cover);
  const thumbs = element('div', {className: 'thumbs'});
  const section = element('section', {className: 'detail-gallery'}, [
    ui('h2', 'sellerGallery', {className: 'visually-hidden'}), coverLink, thumbs,
  ]);
  let selected = product.image;
  function show(src) {
    selected = src;
    cover.src = src;
    coverLink.href = src;
    for (const tile of thumbs.children) tile.setAttribute('aria-pressed', String(tile.dataset.photo === src));
  }
  function addPhotos(urls) {
    thumbs.replaceChildren(...uniquePhotos([product.image, ...urls]).map((src, index) => {
      const tile = element('button', {type: 'button'}, [element('img', {src, alt: '', width: 60, height: 60})]);
      tile.dataset.photo = src;
      localize(tile, 'showPhoto', [index + 1], 'label');
      tile.setAttribute('aria-pressed', String(src === selected));
      tile.addEventListener('click', () => show(src));
      tile.querySelector('img').addEventListener('error', () => tile.remove(), {once: true});
      return tile;
    }));
  }
  cover.addEventListener('error', () => {
    const available = [...thumbs.children].find((tile) => tile.dataset.photo !== selected && tile.querySelector('img').naturalWidth);
    if (available) show(available.dataset.photo);
  });
  addPhotos(savedPhotos);
  return {section, show, addPhotos};
}

function agentMenu(product, agents, primaryAgent) {
  const sections = element('div', {className: 'agent-options'}, agents.filter((agent) => agent.id !== primaryAgent.id).map((agent) => {
    const option = external('', agentUrl(agent, product.weidianId, product.sourcePath));
    option.rel = 'nofollow noopener noreferrer';
    option.dataset.agentOutbound = '';
    option.append(
      element('img', {src: agent.logo, alt: '', width: 20, height: 20, loading: 'lazy'}),
      element('span', {textContent: agent.name}),
    );
    return option;
  }));
  const panel = element('div', {className: 'disclosure-panel agent-panel'}, [ui('p', 'sameItem', {className: 'disclosure-heading'}), sections]);
  const summary = ui('summary', 'otherAgents', {className: 'button'});
  const menu = element('details', {className: 'disclosure agent-menu'}, [summary, panel]);
  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
  });
  return menu;
}

function variantGroup(attribute, showPhoto) {
  const values = Array.isArray(attribute?.attr_values) ? attribute.attr_values : [];
  if (!values.length) return null;
  const title = String(attribute.attr_title ?? '');
  const withPhotos = values.some((value) => sellerImage(value?.img));
  const heading = /size|尺[码寸]/i.test(title) ? ui('h2', 'size')
    : /color|colour|style|颜[色]|款式/i.test(title) ? ui('h2', 'style') : element('h2', {textContent: title});
  const tiles = element('div', {className: withPhotos ? 'variant-options variant-photos' : 'variant-options'});
  for (const value of values) {
    if (!value?.attr_value) continue;
    const label = String(value.attr_value);
    const picture = sellerImage(value.img) ? element('img', {src: value.img, alt: '', width: 64, height: 64, loading: 'lazy'}) : null;
    const button = element('button', {type: 'button', title: label}, [
      picture ?? element('span', {textContent: label}),
    ]);
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', 'false');
    picture?.addEventListener('error', () => picture.replaceWith(element('span', {textContent: label})), {once: true});
    button.addEventListener('click', () => {
      selectTile(button, tiles);
      if (picture?.isConnected) showPhoto(value.img);
    });
    tiles.append(button);
  }
  return tiles.childElementCount ? element('section', {className: 'variant-group'}, [heading, tiles]) : null;
}

function detailPhotos(name, urls) {
  const photos = uniquePhotos(urls);
  const grid = element('div', {className: 'detail-photos-grid'}, photos.map((src) => imageLink(src, name)));
  return element('section', {className: 'detail-panel detail-photos', hidden: !photos.length}, [
    ui('h2', 'detailPhotos'), grid,
  ]);
}

function showDetails(product, savedPhotos, agents) {
  document.title = product.name + ' | Hipobuy Findsheet';
  const price = product.price ? element('p', {className: 'detail-price'}, [
    referencePrice('span', product.price, 'detail-value'), ui('small', 'referenceRate', {}, ratesDate),
  ]) : ui('p', 'missingPrice');
  const {agent} = currentShopping();
  const primary = external('', agentUrl(agent, product.weidianId, product.sourcePath), 'button button-orange detail-buy');
  primary.rel = 'nofollow noopener noreferrer';
  primary.dataset.agentItem = product.weidianId;
  primary.dataset.sourcePath = product.sourcePath;
  primary.append(ui('span', 'buy'));
  const facts = element('p', {className: 'detail-item-id'}, [
    ui('span', 'itemId'), element('span', {textContent: product.weidianId}),
  ]);
  const copied = element('span', {className: 'visually-hidden', role: 'status'});
  const copyLink = ui('button', 'copyProductLink', {type: 'button', className: 'button detail-copy'});
  copyLink.addEventListener('click', async () => {
    let result = 'productLinkCopied';
    try { await navigator.clipboard.writeText(new URL(productUrl(product.weidianId), location.origin).href); }
    catch { result = 'productLinkCopyFailed'; }
    localize(copyLink, result);
    copied.replaceChildren(ui('span', result));
    copyLink.dispatchEvent(new CustomEvent('hipobuy:translate', {bubbles: true}));
  });
  const variants = element('div', {className: 'product-variants'});
  const photos = gallery(product, savedPhotos);
  const extraPhotos = detailPhotos(product.name, savedPhotos);
  const info = element('div', {className: 'detail-info'}, [
    element('div', {className: 'detail-heading'}, [
      ui('p', 'category.' + product.category, {className: 'kicker'}),
      favoriteButton(product, 'button favorite-icon detail-favorite'),
    ]),
    element('h1', {textContent: product.name}), facts, price, primary,
    element('div', {className: 'detail-actions'}, [
      ...(agents.length ? [agentMenu(product, agents, agent)] : []), copyLink, copied,
    ]),
    variants,
    ui('p', 'confirmListing', {className: 'detail-note'}),
    localize(external('', new URL(product.sourcePath, sourceOrigin).href, 'inline-link'), 'mainListing'),
  ]);
  const references = element('div', {className: 'qc-references'});
  const warehouse = element('section', {className: 'detail-panel warehouse-section'}, [
    element('div', {className: 'section-head'}, [
      ui('h2', 'warehouseQc'),
      ui('a', 'findQc', {href: '/qc/?id=' + product.weidianId, className: 'text-link'}),
    ]),
    references,
    ui('p', 'qcHelp', {className: 'qc-note'}),
  ]);
  target.replaceChildren(element('div', {className: 'product-main'}, [photos.section, info]), extraPhotos, warehouse);
  qcLookup(product.weidianId).then((entry) => renderQc(references, product.weidianId, entry))
    .catch(() => references.append(ui('p', 'qcError')));
  readJson(new URL('/api/Goods/getSkuData?weidian_id=' + product.weidianId, sourceOrigin).href).then((live) => {
    if (String(live?.weidian_id) !== product.weidianId) return;
    const livePhotos = Array.isArray(live.images) ? live.images : [];
    photos.addPhotos([...livePhotos, ...savedPhotos]);
    if (Array.isArray(live.specifications?.attrs)) {
      variants.append(...live.specifications.attrs.map((attribute) => variantGroup(attribute, photos.show)).filter(Boolean));
    }
    const dynamic = detailPhotos(product.name, [...livePhotos, ...savedPhotos]);
    extraPhotos.replaceChildren(...dynamic.children);
    extraPhotos.hidden = dynamic.hidden;
  }).catch(() => {});
}

function showError(key) {
  target.replaceChildren(ui('h1', key), ui('a', 'spreadsheet', {href: '/spreadsheet/', className: 'inline-link'}));
}

try {
  const catalog = await readJson('/data/catalog.json');
  const product = catalog.find((item) => item.weidianId === id);
  if (product) {
    const [saved, agents] = await Promise.all([
      readJson('/data/gallery-' + id.slice(0, 4) + '.json').catch(() => ({})),
      readJson('/data/shopping-agents.json').catch(() => []),
    ]);
    showDetails(product, saved[id] ?? [], agents);
  } else {
    showError('missingProduct');
  }
} catch {
  showError('productError');
}
