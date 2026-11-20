import qcIndex from '../../public/data/qc-featured.json';
import {readJson, card, element, referencePrice} from './browser.mjs';
import {categoryLabel, parseId, productImage, productUrl} from './catalog.mjs';

const form = document.querySelector('#filters');
const query = document.querySelector('#query');
const category = document.querySelector('#category');
const sort = document.querySelector('#sort');
const qcOnly = document.querySelector('#qc-only');
const status = document.querySelector('#catalog-status');
const results = document.querySelector('#catalog-results');
const pagination = document.querySelector('#pagination');
const prev = document.querySelector('#prev');
const next = document.querySelector('#next');
const pageLabel = document.querySelector('#page-label');
const viewControl = document.querySelector('#directory-view');
const viewButtons = [...viewControl.querySelectorAll('button')];
const pageSize = 24;
let catalog = [];
let page = 1;
let view = 'grid';

function fromUrl() {
  const params = new URLSearchParams(location.search);
  query.value = params.get('q') ?? '';
  category.value = params.get('category') ?? '';
  sort.value = params.get('sort') ?? 'latest';
  if (!sort.value) sort.value = 'latest';
  page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  view = params.get('view') === 'table' ? 'table' : 'grid';
  qcOnly.checked = params.get('qc') === '1';
}

function comparePrices(a, b) {
  if (!a.price) return b.price ? 1 : 0;
  if (!b.price) return -1;
  const order = Number(a.price) - Number(b.price);
  return sort.value === 'price-high' ? -order : order;
}

function hasQc(item) {
  return Boolean(qcIndex[item.weidianId]?.images?.length);
}

function listingTable(items) {
  const headings = ['Listing', 'Category', 'Weidian ID', 'Warehouse QC', 'Est. price'];
  const header = element('thead', {}, [
    element('tr', {}, headings.map((textContent) => element('th', {textContent, scope: 'col'}))),
  ]);
  const rows = items.map((item) => {
    const thumbnail = element('img', {src: productImage(item), alt: '', loading: 'lazy', width: 54, height: 54});
    const listing = element('a', {className: 'directory-item', href: productUrl(item.weidianId)}, [
      thumbnail,
      element('strong', {textContent: item.name, translate: false}),
    ]);
    return element('tr', {}, [
      element('td', {}, [listing]),
      element('td', {textContent: categoryLabel(item.category)}),
      element('td', {textContent: item.weidianId}),
      element('td', {textContent: hasQc(item) ? 'Photos' : '—'}),
      element('td', {}, [referencePrice(item.price) ?? '—']),
    ]);
  });
  return element('table', {className: 'directory-table'}, [
    element('caption', {className: 'visually-hidden', textContent: 'Matching Weidian listings and estimated prices'}),
    header,
    element('tbody', {}, rows),
  ]);
}

function render(updateUrl = false) {
  const term = query.value.trim().toLowerCase();
  const id = parseId(query.value);
  const matches = catalog.filter((item) => (!category.value || item.category === category.value) &&
    (!qcOnly.checked || hasQc(item)) &&
    (!term || (id ? item.weidianId === id || item.id === id : item.name.toLowerCase().includes(term))));
  if (sort.value === 'oldest') matches.reverse();
  if (sort.value.startsWith('price-')) matches.sort(comparePrices);
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  page = Math.min(page, pages);
  const offset = (page - 1) * pageSize;
  const items = matches.slice(offset, offset + pageSize);
  results.classList.toggle('product-grid', view === 'grid');
  results.replaceChildren(...(!items.length ? [] : view === 'grid' ? items.map((item) => card(item, undefined, hasQc(item))) : [listingTable(items)]));
  for (const button of viewButtons) button.setAttribute('aria-pressed', String(button.dataset.view === view));
  status.textContent = matches.length ? matches.length.toLocaleString('en') + (matches.length === 1 ? ' listing' : ' listings') : 'No matching listings. Try another search or category.';
  pagination.hidden = pages === 1;
  pageLabel.textContent = 'Page ' + page + ' of ' + pages;
  prev.disabled = page === 1;
  next.disabled = page >= pages;
  if (updateUrl) {
    const params = new URLSearchParams();
    if (term) params.set('q', query.value.trim());
    if (category.value) params.set('category', category.value);
    if (sort.value !== 'latest') params.set('sort', sort.value);
    if (view === 'table') params.set('view', view);
    if (qcOnly.checked) params.set('qc', '1');
    if (page > 1) params.set('page', String(page));
    const search = params.size ? '?' + params : '';
    if (search !== location.search) history.pushState(null, '', location.pathname + search);
  }
}

function reset() { page = 1; render(true); }

fromUrl();
readJson('/data/catalog.json').then((data) => {
  catalog = data.filter((item) => /^\d+$/.test(item.weidianId ?? ''));
  render();
  viewControl.hidden = false;
  for (const button of viewButtons) {
    button.addEventListener('click', () => {
      if (view === button.dataset.view) return;
      view = button.dataset.view;
      render(true);
    });
  }
  form.addEventListener('submit', (event) => { event.preventDefault(); reset(); });
  category.addEventListener('change', reset);
  sort.addEventListener('change', reset);
  qcOnly.addEventListener('change', reset);
  prev.addEventListener('click', () => { page -= 1; render(true); status.scrollIntoView({block: 'center'}); });
  next.addEventListener('click', () => { page += 1; render(true); status.scrollIntoView({block: 'center'}); });
  window.addEventListener('popstate', () => { fromUrl(); render(); });
}).catch(() => { status.textContent = 'The saved directory could not load. Reload the page to try again.'; });
