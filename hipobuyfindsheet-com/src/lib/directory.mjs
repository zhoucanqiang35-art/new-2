import { readJson, parseId, card, ui } from './browser-data.mjs';

const filters = document.getElementById('filters');
const results = document.getElementById('results');
const status = document.getElementById('result-status');
const pager = document.getElementById('pagination');
const previous = document.getElementById('previous');
const next = document.getElementById('next');
const pageNumber = document.getElementById('page-number');
const pageSize = 24;
const comparators = {
  low: (a, b) => (Number(a.price) || Infinity) - (Number(b.price) || Infinity),
  high: (a, b) => (Number(b.price) || -Infinity) - (Number(a.price) || -Infinity),
  name: (a, b) => a.name.localeCompare(b.name),
};
let catalog = [];
let shown = [];
let page = 1;

function updateLocation() {
  const url = new URL(location.href);
  url.searchParams.delete('page');
  for (const [key, value] of new FormData(filters).entries()) {
    if (value.trim()) url.searchParams.set(key, value.trim());
    else url.searchParams.delete(key);
  }
  if (page > 1) url.searchParams.set('page', String(page));
  if (url.href !== location.href) history.pushState(null, '', url);
}

function render() {
  const pageCount = Math.max(1, Math.ceil(shown.length / pageSize));
  page = Math.min(pageCount, Math.max(1, page));
  status.replaceChildren(shown.length
    ? ui('span', 'found', {}, shown.length.toLocaleString('en'))
    : ui('span', 'noMatch'));
  results.replaceChildren(...shown.slice((page - 1) * pageSize, page * pageSize).map((item) => card(item)));
  pager.hidden = pageCount === 1;
  previous.disabled = page === 1;
  next.disabled = page === pageCount;
  pageNumber.replaceChildren(ui('span', 'page', {}, page, pageCount));
}

function filter() {
  const { q = '', category, sort } = Object.fromEntries(new FormData(filters));
  const term = q.trim().toLowerCase();
  const exact = parseId(q);
  const terms = term.split(/\s+/).filter(Boolean);
  shown = catalog.filter((item) => {
    if (category && item.category !== category) return false;
    if (exact) return item.weidianId === exact;
    const haystack = item.name.toLowerCase() + ' ' + item.weidianId;
    return terms.every((word) => haystack.includes(word));
  });
  if (Object.hasOwn(comparators, sort)) shown.sort(comparators[sort]);
  render();
}
function setFromLocation() {
  const params = new URLSearchParams(location.search);
  for (const control of filters.querySelectorAll('[name]')) {
    control.value = params.get(control.name) || '';
    if (control instanceof HTMLSelectElement && control.selectedIndex === -1) control.selectedIndex = 0;
  }
  page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
}
function turnPage(step) {
  page += step;
  render();
  updateLocation();
  filters.scrollIntoView({block: 'start'});
}

setFromLocation();
for (const select of filters.querySelectorAll('select')) {
  select.addEventListener('change', () => filters.requestSubmit());
}

try {
  catalog = await readJson('/data/catalog.json');
  filter();
  filters.addEventListener('submit', (event) => {
    event.preventDefault();
    page = 1;
    filter();
    updateLocation();
  });
  previous.addEventListener('click', () => turnPage(-1));
  next.addEventListener('click', () => turnPage(1));
  addEventListener('popstate', () => {
    setFromLocation();
    filter();
  });
} catch {
  status.replaceChildren(ui('span', 'catalogError'));
}
