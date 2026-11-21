import { element, readJson } from './dom.mjs';
import { buyUrl, categories, findItemId, itemUrl, priceLabel } from './catalog.mjs';

import { agentAction, agentUrl, currentAgent } from './agents.mjs';
import { queryTerms, searchMatches } from './search.mjs';
import { loadQc, savedQcLabel } from './qc.mjs';

const form = document.querySelector('#catalog-form');
const { q, category, sort, qc } = form.elements;
const fixedCategory = form.dataset.category;
const list = document.querySelector('#catalog-list');
const empty = document.querySelector('#catalog-empty');
const status = document.querySelector('#catalog-status');
const controls = document.querySelector('#catalog-paging');
const prev = document.querySelector('#catalog-prev');
const next = document.querySelector('#catalog-next');
const pageLabel = document.querySelector('#catalog-page');
const pageSize = 24;
const productView = list.dataset.layout === 'cards' ? listingCard : listingRow;
let page = 1;
let catalog;
let savedQc;

function purchaseLink(product, className) {
  const agent = currentAgent();
  const buy = element('a',{className,href:agentUrl(agent,product.weidianId,product.sourcePath),rel:'sponsored noopener',target:'_blank'},agentAction(agent));
  buy.dataset.agentProduct = product.weidianId;
  buy.dataset.sourcePath = product.sourcePath;
  return buy;
}

function listingPrice(product, tag) {
  const price = element(tag,{className:'catalog-price'},priceLabel(product.price));
  price.dataset.priceCny = product.price ?? '';
  return price;
}

function qcLabel(product) {
  const record = savedQc?.[product.weidianId];
  const count = record?.photos?.length ?? 0;
  const label = savedQcLabel(count, record?.status);
  return count ? element('a',{href:itemUrl(product.weidianId),className:'qc-count'},label)
    : element('span',{},label);
}

function listingCard(product) {
  const href = itemUrl(product.weidianId);
  const card = element('article',{className:'sheet-product'});
  const photo = element('a',{href,className:'sheet-photo'});
  photo.append(element('img',{src:product.image,alt:product.name,width:320,height:240,loading:'lazy',translate:false}));
  const info = element('div',{className:'sheet-info'});
  const meta = element('p',{className:'sheet-meta muted'});
  meta.append(element('span',{},categories[product.category]),element('span',{translate:false},product.weidianId));
  const title = element('h2');
  title.append(element('a',{href,translate:false},product.name));
  const metrics = element('div',{className:'sheet-metrics'});
  metrics.append(listingPrice(product,'strong'),qcLabel(product));
  const actions = element('div',{className:'sheet-actions'});
  actions.append(element('a',{href,className:'button outline'},'Review'),purchaseLink(product,'button primary'));
  info.append(meta,title,metrics,actions);
  card.append(photo,info);
  return card;
}

function listingRow(product) {
  const href = itemUrl(product.weidianId);
  const row = element('tr');
  const nameCell = element('th',{scope:'row'});
  const label = element('span');
  label.append(element('strong',{translate:false},product.name),element('small',{},categories[product.category]+' · '+product.weidianId));
  const listing = element('a',{href,className:'listing'});
  listing.append(element('img',{src:product.image,alt:'',width:62,height:54,loading:'lazy'}),label);
  nameCell.append(listing);
  const qcCell = element('td');
  qcCell.append(qcLabel(product));
  const action = element('td');
  const buttons = element('div',{className:'row'});
  buttons.append(element('a',{href,className:'text-link'},'Review'),purchaseLink(product,''));
  action.append(buttons);
  row.append(nameCell,listingPrice(product,'td'),qcCell,action);
  return row;
}

function render(updateUrl = false) {
  if (!catalog) return;
  empty.replaceChildren();
  if (qc.checked && !savedQc) {
    list.replaceChildren();
    controls.hidden = true;
    status.textContent = 'Saved QC could not load. Reload or clear the QC filter.';
    return;
  }
  const query = q.value.trim();
  const key = findItemId(query);
  const terms = queryTerms(query);
  const selectedCategory = fixedCategory ?? category.value;
  const results = catalog.filter(product => {
    if (qc.checked && !savedQc[product.weidianId]?.photos?.length) return false;
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (key) return product.weidianId === key;
    return searchMatches(product, terms);
  });
  if (sort.value) {
    const multiplier = sort.value === 'price-asc' ? 1 : -1;
    results.sort((a,b) => {
      const first = Number(a.price), second = Number(b.price);
      if (!(first > 0)) return second > 0 ? 1 : 0;
      if (!(second > 0)) return -1;
      return multiplier * (first - second);
    });
  }
  const total = Math.max(1,Math.ceil(results.length / pageSize));
  page = Math.max(1,Math.min(total,page));
  list.replaceChildren(...results.slice((page-1)*pageSize,page*pageSize).map(productView));
  status.textContent = results.length.toLocaleString('en-US') + (results.length === 1 ? ' listing' : ' listings');
  if (!results.length) {
    status.textContent = 'No matching listings. Try another search or clear the filters.';
    if (key) {
      const link = element('a',{className:'text-link',href:buyUrl(key)},'Check this Weidian item on OrientDig');
      link.rel = 'sponsored noopener';
      empty.append(link);
    }
  }
  controls.hidden = total <= 1;
  prev.disabled = page === 1;
  next.disabled = page === total;
  pageLabel.textContent = 'Page ' + page + ' of ' + total;
  if (updateUrl) {
    const params = new URLSearchParams();
    if (query) params.set('q',query);
    if (category?.value) params.set('category',category.value);
    if (sort.value) params.set('sort',sort.value);
    if (qc.checked) params.set('qc','1');
    if (page > 1) params.set('page',page);
    history.replaceState(null,'',location.pathname+(params.size ? '?'+params : ''));
  }
}

function setPage(number) {
  page = number;
  render(true);
  form.scrollIntoView({block:'start'});
}
const params = new URLSearchParams(location.search);
q.value = params.get('q') ?? '';
const selected = params.get('category') ?? '';
if (category && Object.hasOwn(categories,selected)) category.value = selected;
if (['price-asc','price-desc'].includes(params.get('sort'))) sort.value = params.get('sort');
qc.checked = params.get('qc') === '1';
page = Number.parseInt(params.get('page'),10) || 1;
Promise.all([readJson('/data/catalog.json'),loadQc().catch(()=>null)])
  .then(([data,records])=>{
    catalog = data;
    savedQc = records;
    render();
  }).catch(()=>{status.textContent='The full preview catalog could not load. Please reload to try again.';});
form.addEventListener('submit',event=>{event.preventDefault();setPage(1);});
category?.addEventListener('change',()=>setPage(1));
sort.addEventListener('change',()=>setPage(1));
qc.addEventListener('change',()=>setPage(1));
prev.addEventListener('click',()=>setPage(page-1));
next.addEventListener('click',()=>setPage(page+1));
