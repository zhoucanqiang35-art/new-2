import {sortCatalog} from './catalog-item.mjs';
import {text} from './ui-text.mjs';
import {categoryName,itemId,productPath,sourceOrigin,mainSearch,detailPath} from './platform.mjs';
import {formatPrice} from './shopping.mjs';
import {setProductImage} from './product-images.mjs';
function element(tag,className,text) {
  const node=document.createElement(tag);
  if(className) node.className=className;
  if(text) node.textContent=text;
  return node;
}
export function productCard(product, photo = '') {
  const {title,category,image,price}=product;
  const card=element('article','catalog-card');
  const art=element('a','product-art');
  const img=element('img');
  const copy=element('div','product-copy');
  const link=element('a','',title);
  const meta=element('div');
  link.href=art.href=detailPath(product);
  setProductImage(img, photo || image, 480, photo ? image : '');
  img.alt=title;
  img.loading='lazy';
  img.decoding='async';
  img.translate=false;
  link.translate=false;
  art.append(img);
  const heading=element('h3');
  heading.append(link);
  const cost=element('strong','',price==null?text('See source'):formatPrice(price));
  if(price!=null) {cost.dataset.cnyPrice=String(price);cost.translate=false;}
  meta.append(cost);
  copy.append(heading,element('small','',categoryName(category)),meta);
  card.append(art,copy);
  return card;
}
export function setupCatalog() {
  const root=document.querySelector('#catalog');
  const input=document.querySelector('#catalog-q');
  const category=document.querySelector('#catalog-category');
  const sort=document.querySelector('#catalog-sort');
  const form=document.querySelector('#browse-form');
  const status=document.querySelector('#catalog-status');
  const grid=document.querySelector('#catalog-grid');
  const more=document.querySelector('#catalog-more');
  const source=document.querySelector('#catalog-source');
  const empty=document.querySelector('#catalog-empty');
  const reset=document.querySelector('#catalog-reset');
  const keyword=root.dataset.keyword||'';
  const initial=new URLSearchParams(location.search);
  input.value=initial.get('q') ?? initial.get('keywords') ?? keyword;
  if([...category.options].some(option=>option.value===initial.get('category'))) category.value=initial.get('category');
  if([...sort.options].some(option=>option.value===initial.get('sort'))) sort.value=initial.get('sort');
  let current;

  function render(state) {
    if(state!==current) return;
    const results=sortCatalog([...new Map([...state.snapshot.items,...state.live.items].map(item=>[item.path,item])).values()],state.sort);
    const visible=results.slice(0,state.limit);
    grid.replaceChildren(...visible.map(item=>productCard(item)));
    const loading=state.pending>0;
    const failed=!state.snapshot.ok&&(!state.query||!state.live.ok);
    grid.setAttribute('aria-busy',String(loading));
    status.textContent=loading&&!visible.length ? text('Searching…')
      : visible.length ? text('Showing {count} matches.',{count:visible.length})
      : failed ? text('Search is temporarily unavailable. Try again.')
      : text('No matches. Try a shorter keyword or clear your filters.');
    if(!visible.length&&!loading) {
      const id=itemId(state.query);
      const path=productPath(state.query);
      if(id||path) {
        const link=element('a','text-link',text('Open product'));
        link.href=detailPath({id,path});
        grid.append(link);
      }
    }
    empty.hidden=loading||Boolean(visible.length);
    reset.hidden=!state.query&&!state.category&&state.sort==='latest';
    more.disabled=loading;
    const hasMore=results.length>state.limit||state.snapshot.next||state.live.next;
    const retry=state.snapshot.failed||state.live.failed;
    more.hidden=!hasMore&&!retry;
    more.dataset.retryOnly=String(!hasMore&&retry);
    more.textContent=text(hasMore ? 'Show more products' : 'Try again');
  }

  async function fetchPage(state, key) {
    const result=state[key];
    const params=new URLSearchParams({q:state.query,page:String(result.page)});
    if(key==='snapshot') {
      params.set('category',state.category);
      params.set('sort',state.sort);
    } else {
      params.set('live','1');
    }
    try {
      const response=await fetch('/api/'+(key==='snapshot'?'catalog':'search')+'?'+params,
        {signal:AbortSignal.any([state.controller.signal,AbortSignal.timeout(6500)])});
      if(!response.ok) throw new Error('Search unavailable');
      const data=await response.json();
      if(!Array.isArray(data.items)) throw new Error('Unexpected search response');
      const matches=state.category ? data.items.filter(item=>item.category===state.category) : data.items;
      result.items.push(...matches);
      result.ok=true;
      result.failed=false;
      result.next=Boolean(data.hasNext)&&result.page<(key==='live'?100:500);
      result.page++;
    } catch {
      if(!state.controller.signal.aborted) result.failed=true;
    } finally {
      state.pending--;
      if(state!==current) return;
      render(state);
    }
  }

  function run({write=true}={}) {
    current?.controller.abort();
    const query=input.value.trim();
    const params=new URLSearchParams();
    if(query||keyword) params.set('q',query);
    if(category.value!==root.dataset.category) params.set('category',category.value);
    if(sort.value!=='latest') params.set('sort',sort.value);
    if(write) history.replaceState(null,'',location.pathname+(params.size?'?'+params:''));
    source.href=productPath(query) ? sourceOrigin+productPath(query)
      : query ? mainSearch(itemId(query)||query) : sourceOrigin+'/'+(category.value||'AllProducts')+'/';
    const result=()=>({items:[],page:1,next:false,ok:false,failed:false});
    const state=current={query,category:category.value,sort:sort.value,controller:new AbortController(),
      snapshot:result(),live:result(),limit:24,pending:query?2:1};
    status.textContent=text('Searching…');
    grid.setAttribute('aria-busy','true');
    more.hidden=true;
    empty.hidden=true;
    void fetchPage(state,'snapshot');
    if(query) void fetchPage(state,'live');
  }
  form.addEventListener('submit',(event)=>{event.preventDefault();run();});
  [category,sort].forEach(field=>field.addEventListener('change',()=>run()));
  reset.addEventListener('click',()=>{
    input.value='';
    category.value='';
    sort.value='latest';
    run();
    input.focus();
  });
  more.addEventListener('click',()=>{
    const state=current;
    if(state.pending) return;
    if(more.dataset.retryOnly==='true') {
      run();
      return;
    }
    state.limit+=24;
    const next=['snapshot','live'].filter(key=>state[key].next);
    state.pending=next.length;
    render(state);
    next.forEach(key=>void fetchPage(state,key));
  });
  run({write:false});
}
