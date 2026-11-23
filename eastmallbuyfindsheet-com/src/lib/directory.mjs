import {readCatalog, card} from './browser.mjs';
import {parseId} from './catalog.mjs';

const form = document.querySelector('#filters');
const query = document.querySelector('#query');
const category = document.querySelector('#category');
const sort = document.querySelector('#sort');
const status = document.querySelector('#catalog-status');
const results = document.querySelector('#catalog-results');
const pagination = document.querySelector('#pagination');
const prev = document.querySelector('#prev');
const next = document.querySelector('#next');
const pageLabel = document.querySelector('#page-label');
const pageSize = 24;
let catalog = [];
let page = 1;

function fromUrl() {
  const params = new URLSearchParams(location.search);
  query.value = params.get('q') ?? '';
  category.value = params.get('category') ?? '';
  sort.value = params.get('sort') ?? 'latest';
  if (!sort.value) sort.value = 'latest';
  page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
}

function comparePrices(a, b) {
  if (!a.price) return b.price ? 1 : 0;
  if (!b.price) return -1;
  const order = Number(a.price) - Number(b.price);
  return sort.value === 'price-high' ? -order : order;
}

function render(updateUrl = false) {
  const term = query.value.trim().toLowerCase();
  const id = parseId(query.value);
  const matches = catalog.filter((item) => (!category.value || item.category === category.value) &&
    (!term || (id ? item.weidianId === id || item.id === id : item.name.toLowerCase().includes(term))));
  if (sort.value === 'oldest') matches.reverse();
  if (sort.value.startsWith('price-')) matches.sort(comparePrices);
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  page = Math.min(page, pages);
  const offset = (page - 1) * pageSize;
  results.replaceChildren(...matches.slice(offset, offset + pageSize).map((item) => card(item)));
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
    if (page > 1) params.set('page', String(page));
    const search = params.size ? '?' + params : '';
    if (search !== location.search) history.pushState(null, '', location.pathname + search);
  }
}

function reset() { page = 1; render(true); }

fromUrl();
readCatalog().then((data) => {
  catalog = data;
  render();
  form.addEventListener('submit', (event) => { event.preventDefault(); reset(); });
  category.addEventListener('change', reset);
  sort.addEventListener('change', reset);
  prev.addEventListener('click', () => { page -= 1; render(true); status.scrollIntoView({block: 'center'}); });
  next.addEventListener('click', () => { page += 1; render(true); status.scrollIntoView({block: 'center'}); });
  window.addEventListener('popstate', () => { fromUrl(); render(); });
}).catch(() => { status.textContent = 'The saved directory could not load. Reload the page to try again.'; });
