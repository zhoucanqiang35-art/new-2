import { sourceOrigin } from './catalog.mjs';
import { currentShopping, agentUrl, ratesDate } from './shopping-data.mjs';
import { readJson, parseId, element, external, localize, ui, qcLookup, renderQc, card, favoriteButton, referencePrice } from './browser-data.mjs';

const target = document.getElementById('product-detail');
const id = parseId(new URLSearchParams(location.search).get('id') ?? '');

function link(key, href, className, openExternal = false) {
  return openExternal
    ? localize(external('', href, className), key)
    : ui('a', key, {href, className});
}

function gallery(product, urls) {
  const photos = [...new Set([product.image, ...(urls ?? [])])].filter(Boolean);
  const cover = element('img', {src: photos[0], alt: product.name, className: 'detail-image', width: 720, height: 630});
  const thumbs = element('div', {className: 'thumbs'});
  if (photos.length > 1) {
    for (const [i, src] of photos.entries()) {
      const button = element('button', {type: 'button'}, [element('img', {src, alt: '', loading: 'lazy'})]);
      localize(button, 'showPhoto', [i + 1], 'label');
      button.setAttribute('aria-pressed', String(i === 0));
      button.addEventListener('click', () => {
        cover.src = src;
        cover.alt = product.name;
        for (const item of thumbs.children) item.setAttribute('aria-pressed', String(item === button));
      });
      thumbs.append(button);
    }
  }
  return element('div', {}, [ui('p', 'sellerGallery', {className: 'kicker gallery-caption'}), cover, thumbs]);
}

function agentMenu(product, agents) {
  const sections = element('div', {className: 'agent-options'}, agents.filter((agent) => agent.id !== 'hipobuy').map((agent) => {
    const href = agent.template.replaceAll('{productId}', product.weidianId);
    const option = external('', href);
    option.rel = 'nofollow noopener noreferrer';
    option.append(
      element('img', {src: agent.logo, alt: '', width: 20, height: 20, loading: 'lazy'}),
      element('span', {textContent: agent.name}),
    );
    return option;
  }));
  const panel = element('div', {className: 'disclosure-panel agent-panel'}, [ui('p', 'sameItem', {className: 'disclosure-heading'}), sections]);
  const summary = element('summary', {className: 'button'}, [ui('span', 'otherAgents'), element('span', {className: 'disclosure-chevron'})]);
  const menu = element('details', {className: 'disclosure agent-menu'}, [summary, panel]);
  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
  });
  return menu;
}

function related(product, catalog) {
  const words = (item) => new Set(item.name.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []);
  const sourceWords = words(product);
  const matches = catalog.filter((item) => item.category === product.category && item.weidianId !== product.weidianId)
    .map((item) => ({ item, score: [...words(item)].filter((word) => sourceWords.has(word)).length }))
    .sort((a, b) => b.score - a.score).slice(0, 8);
  return element('section', {className: 'detail-panel related-products'}, [
    element('div', {className: 'section-head'}, [
      element('div', {}, [ui('h2', 'related'), ui('p', 'relatedLead')]),
      link('browseMore', '/spreadsheet/?category=' + encodeURIComponent(product.category), 'text-link'),
    ]),
    element('div', {className: 'product-grid'}, matches.map(({item}) => card(item))),
  ]);
}

function showDetails(product, galleryUrls, agents, catalog) {
  document.title = product.name + ' | Hipobuy Findsheet';
  const price = product.price ? element('p', {className: 'detail-price'}, [
    referencePrice('span', product.price, 'detail-value'), ui('small', 'referenceRate', {}, ratesDate),
  ]) : ui('p', 'missingPrice');
  const {agent} = currentShopping();
  const primary = external('', agentUrl(agent, product.weidianId, product.sourcePath), 'button button-orange');
  primary.rel = 'nofollow noopener noreferrer';
  primary.dataset.agentItem = product.weidianId;
  primary.dataset.sourcePath = product.sourcePath;
  primary.append(ui('span', 'buy'));
  const facts = element('dl', {className: 'facts'}, [
    ui('dt', 'marketplace'), element('dd', {textContent: 'Weidian'}),
    ui('dt', 'itemId'), element('dd', {textContent: product.weidianId}),
    ui('dt', 'category'), ui('dd', 'category.' + product.category),
  ]);
  const info = element('div', {}, [
    ui('p', 'category.' + product.category, {className: 'kicker'}),
    element('h1', {textContent: product.name}), price,
    ui('p', 'confirmListing'),
    facts,
    element('div', {className: 'detail-actions'}, [
      primary,
      favoriteButton(product, 'button favorite-icon detail-favorite'),
      ...(agents.length ? [agentMenu(product, agents)] : []),
      link('mainListing', new URL(product.sourcePath, sourceOrigin).href, 'button', true),
    ]),
    element('section', {className: 'detail-panel'}, [
      ui('h2', 'beforeOrdering'), ui('p', 'checkDetails'), link('buyingGuide', '/how-to-buy/', 'inline-link'),
    ]),
  ]);
  const references = element('div', {className: 'qc-references'});
  const warehouse = element('section', {className: 'detail-panel warehouse-section'}, [
    element('div', {className: 'section-head'}, [
      ui('h2', 'warehouseQc'),
      link('findQc', '/qc/?id=' + product.weidianId, 'text-link'),
    ]),
    references,
    ui('p', 'qcHelp', {className: 'qc-note'}),
  ]);
  target.replaceChildren(
    element('div', {className: 'product-main'}, [gallery(product, galleryUrls), info]),
    warehouse,
    related(product, catalog),
  );
  qcLookup(product.weidianId).then((entry) => renderQc(references, product.weidianId, entry))
    .catch(() => references.append(ui('p', 'qcError')));
}

try {
  const catalog = await readJson('/data/catalog.json');
  const product = catalog.find((item) => item.weidianId === id);
  if (product) {
    const [urls, agents] = await Promise.all([
      readJson('/data/gallery-' + id.slice(0, 4) + '.json').catch(() => ({})),
      readJson('/data/shopping-agents.json').catch(() => []),
    ]);
    showDetails(product, urls[id], agents, catalog);
  } else {
    target.replaceChildren(ui('h1', 'missingProduct'), link('spreadsheet', '/spreadsheet/', 'inline-link'));
  }
} catch {
  target.replaceChildren(ui('h1', 'productError'), link('spreadsheet', '/spreadsheet/', 'inline-link'));
}
