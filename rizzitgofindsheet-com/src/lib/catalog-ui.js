import { catalog, makeCard } from './browser.js';
import { selectProducts } from './shared.js';

const panel = document.querySelector('[data-catalog]');
const form = panel.querySelector('form');
const query = form.elements.q;
const category = form.elements.category;
const sort = form.elements.sort;
const results = panel.querySelector('[data-results]');
const status = panel.querySelector('[data-status]');
const pagination = panel.querySelector('[data-pagination]');
const previous = pagination.querySelector('[data-previous]');
const next = pagination.querySelector('[data-next]');
const pageLabel = pagination.querySelector('[data-page]');
const pageSize = 24;
let requestId = 0;
let page = 1;

async function render(updateUrl = false) {
  const currentRequest = ++requestId;
  status.textContent = 'Loading products…';
  try {
    const { items } = await catalog();
    if (currentRequest !== requestId) return;
    const matches = selectProducts(items, { query: query.value, category: category.value, sort: sort.value });
    const pages = Math.max(1, Math.ceil(matches.length / pageSize));
    page = Math.min(pages, Math.max(1, page));
    const start = (page - 1) * pageSize;
    results.replaceChildren(...matches.slice(start, start + pageSize).map(makeCard));
    status.textContent = matches.length ? matches.length.toLocaleString('en-US') + ' products' : 'No products found. Try another search or category.';
    pagination.hidden = pages < 2;
    previous.disabled = page <= 1;
    next.disabled = page >= pages;
    pageLabel.textContent = 'Page ' + page + ' of ' + pages;
    if (updateUrl) {
      const url = new URL(location.href);
      url.search = '';
      if (query.value.trim()) url.searchParams.set('q', query.value.trim());
      if (category.value !== panel.dataset.category) url.searchParams.set('category', category.value);
      if (sort.value !== 'latest') url.searchParams.set('sort', sort.value);
      if (page > 1) url.searchParams.set('page', String(page));
      if (url.href !== location.href) history.pushState(null, '', url);
    }
  } catch {
    if (currentRequest === requestId) status.textContent = 'The catalog could not load. Select Search to retry.';
  }
}

function readUrl() {
  const params = new URLSearchParams(location.search);
  query.value = (params.get('q') || '').slice(0, 100);
  category.value = params.get('category') ?? panel.dataset.category;
  sort.value = params.get('sort') || 'latest';
  if (!sort.value) sort.value = 'latest';
  page = Number.parseInt(params.get('page'), 10) || 1;
  void render();
}
function updateFilters() {
  page = 1;
  void render(true);
}
form.addEventListener('submit', (event) => { event.preventDefault(); updateFilters(); });
category.addEventListener('change', updateFilters);
sort.addEventListener('change', updateFilters);
previous.addEventListener('click', () => { page -= 1; void render(true); });
next.addEventListener('click', () => { page += 1; void render(true); });
window.addEventListener('popstate', readUrl);
readUrl();
