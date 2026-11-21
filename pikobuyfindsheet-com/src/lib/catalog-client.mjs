import {catalogSearchTerm,rankCatalogItems,relatedCatalogItems} from './catalog-search.mjs';
import {categoryName,sourceOrigin,mainSearch} from './platform.mjs';
import {formatPrice} from './shopping.mjs';
import {setProductImage} from './product-images.mjs';
function element(tag,className,text) {
  const node=document.createElement(tag);
  if(className) node.className=className;
  if(text) node.textContent=text;
  return node;
}
export function productCard(product, photo = '') {
  const {id,title,category,image,path,price}=product;
  const card=element('article','product');
  const art=element('a','product-art');
  const img=element('img');
  const copy=element('div','product-copy');
  const link=element('a','',title);
  const meta=element('div');
  link.href=art.href='/finds/?'+new URLSearchParams(id?{id,from:path}:{from:path});
  setProductImage(img, photo || image, 480, photo ? image : '');
  img.alt=title;
  img.loading='lazy';
  img.decoding='async';
  img.translate=false;
  link.translate=false;
  art.append(img,element('span','',categoryName(category)));
  const cost=element('strong','',price===null?'See source':formatPrice(price));
  if(price!==null) {cost.dataset.cnyPrice=String(price);cost.translate=false;}
  meta.append(cost,element('span','',id?'Weidian':'FindSpreadsheet'));
  copy.append(link,meta);
  card.append(art,copy);
  return card;
}
const unique = (products) => [...new Map(products.map((p)=>[p.path,p])).values()];
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
  const initial=new URLSearchParams(location.search);
  const data=fetch('/catalog-data.json').then((response)=>{
    if(!response.ok) throw new Error('Catalog unavailable');
    return response.json();
  });
  input.value=initial.get('q')||'';
  if([...category.options].some((option)=>option.value===initial.get('category'))) category.value=initial.get('category');
  if([...sort.options].some((option)=>option.value===initial.get('sort'))) sort.value=initial.get('sort');
  const pageSize=24;
  const initialCount=Number(initial.get('shown'));
  const savedCount=history.state?.catalogCount;
  const boundedCount=Number.isSafeInteger(initialCount)?Math.min(initialCount,960):0;
  const restoreCount=Math.max(pageSize,Number.isSafeInteger(savedCount)?savedCount:boundedCount);
  const restoreScroll=history.state?.catalogScroll;
  const isHistoryReturn=performance.getEntriesByType('navigation')[0]?.type==='back_forward';
  const restoreLive=isHistoryReturn?history.state?.catalogLive:null;
  history.scrollRestoration='manual';
  let version=0, results=[], limit=pageSize, nextPage=0;
  let activeTerm, liveItems=null;
  const inCategory=(product)=>!category.value||product.category===category.value;

  function remember(scroll=window.scrollY) {
    const url=new URL(location.href);
    if(limit>pageSize) url.searchParams.set('shown',String(limit));
    else url.searchParams.delete('shown');
    // Keep live-only rows from the same visit, without serializing the local catalog.
    const catalogLive=liveItems && {items:liveItems.slice(0,600),nextPage};
    const state={...history.state,catalogCount:limit,catalogScroll:scroll};
    try {
      history.replaceState({...state,catalogLive},'',url);
    } catch (error) {
      if(error.name!=='DataCloneError' && error.name!=='QuotaExceededError') throw error;
      history.replaceState({...state,catalogLive:null},'',url);
    }
  }
  window.addEventListener('pagehide',()=>remember());
  grid.addEventListener('click',(event)=>{
    if (event.target.closest?.('a[href*="/finds/"]')) remember();
  });
  const sortResults=(items,query)=>sort.value==='relevance' && (query.words.length||query.id||query.path)
    ? rankCatalogItems(items,query,true) : items.sort(order);
  function render() {
    grid.replaceChildren(...results.slice(0,limit).map(productCard));
    more.hidden=results.length<=limit&&!nextPage;
  }
  function order(a,b) {
    if(sort.value==='popular') return b.views-a.views;
    if(sort.value.startsWith('price-')) {
      if(a.price===null) return b.price===null?0:1;
      if(b.price===null) return -1;
      return sort.value==='price-asc'?a.price-b.price:b.price-a.price;
    }
    return b.date-a.date;
  }
  async function search(term,initialVisit=false) {
    const run=++version;
    const query=input.value.trim();
    activeTerm=term;
    nextPage=0;
    liveItems=null;
    const {id,path}=term;
    const local=(await data).items;
    if(run!==version) return;
    const localMatches=rankCatalogItems(local,term,false,false);

    source.href=path ? sourceOrigin+path : query ? mainSearch(term.text) : sourceOrigin + '/' + (category.value || 'AllProducts') + '/';
    results=localMatches.filter(inCategory);
    if(sort.value!=='relevance' || !query) results.sort(order);
    limit=initialVisit?restoreCount:pageSize;
    let related=false;
    const showResults = (live) => {
      const label=results.length===1?' result':' results';
      if(related) status.textContent='No exact matches. Related products are shown below.';
      else if(!results.length && query) status.textContent='No products matched. Try a shorter query or change the category.';
      else status.textContent=results.length+label+(live?' from FindSpreadsheet.':' in the synced FindSpreadsheet catalog.');
      render();
    };
    if(query && !results.length) {
      results=relatedCatalogItems(local.filter(inCategory),term);
      related=results.length>0;
      if(related && sort.value!=='relevance') results.sort(order);
    }
    const mergeLive=(items,page)=>{
      const merged=sortResults(unique([...items,...localMatches]).filter(inCategory),term);
      if(merged.length) {
        results=merged;
        related=false;
      }
      liveItems=items;
      nextPage=page;
      showResults(!related);
    };
    const restored=initialVisit&&Array.isArray(restoreLive?.items);
    if(restored) mergeLive(restoreLive.items,restoreLive.nextPage);
    else showResults(false);
    if(initialVisit && Number.isFinite(restoreScroll)) requestAnimationFrame(()=>{
      if(run===version) window.scrollTo(0,restoreScroll);
    });
    if(query && !path && !restored) {
      const load=await fetch('/api/search?q='+encodeURIComponent(term.text), {signal:AbortSignal.timeout(4500)})
        .then((response)=>response.ok ? response.json() : null).catch(()=>null);
      if(run!==version) return;
      if(load && load.source!=='snapshot') {
        const remote=id ? load.items.filter((p)=>p.id===id) : load.items;
        mergeLive(remote.filter(inCategory),!id&&load.hasNext?2:0);
      }
    }
    if(id&&!results.length) {
      const link=element('a','text-link','Open item '+id);
      link.href='/finds/?id='+id;
      grid.append(link);
    }
  }
  function run(initialVisit=false) {
    const query=input.value.trim();
    const term=catalogSearchTerm(query);
    const clearCategory=Boolean((term.id||term.path)&&category.value);
    if(clearCategory) category.value='';
    const params=new URLSearchParams();
    if(query) params.set('q',query);
    if(category.value && category.value!==root.dataset.category) params.set('category',category.value);
    if(!category.value && root.dataset.category) params.set('category','');
    if(sort.value!=='relevance') params.set('sort',sort.value);
    if(!initialVisit) {
      limit=pageSize;
      history.replaceState(null,'',location.pathname+(params.size?'?'+params:''));
    } else if(clearCategory) {
      if(initial.has('shown')) params.set('shown',initial.get('shown'));
      history.replaceState(history.state,'',location.pathname+(params.size?'?'+params:''));
    }
    search(term,initialVisit).catch(()=>{status.textContent='The catalog is temporarily unavailable. Open FindSpreadsheet to continue.';});
  }
  form.addEventListener('submit',(event)=>{event.preventDefault();run();});
  [category,sort].forEach((field)=>field.addEventListener('change',()=>run()));
  more.addEventListener('click',async()=>{
    if(results.length>limit) {limit+=pageSize;render();remember();return;}
    if(!nextPage) return;
    const run=version;
    more.disabled=true;
    const page=await fetch('/api/search?'+new URLSearchParams({q:activeTerm.text,page:String(nextPage)}))
      .then((r)=>r.ok?r.json():null).catch(()=>null);
    more.disabled=false;
    if(run!==version) return;
    if(!page || page.source==='snapshot') {status.textContent='More results could not be loaded. Try again.';return;}
    nextPage=page.hasNext&&nextPage<100?nextPage+1:0;
    const items=page.items.filter(inCategory);
    liveItems=unique([...items,...(liveItems||[])]);
    results=sortResults(unique([...items,...results]),activeTerm);
    limit+=pageSize;
    status.textContent=results.length+' results from FindSpreadsheet.';
    render();
    remember();
  });
  run(true);
}
