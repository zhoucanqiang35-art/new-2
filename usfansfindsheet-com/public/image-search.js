(()=>{
const input=document.getElementById('catalog-image-file');if(!input)return;
const drop=document.getElementById('image-drop-zone'),status=document.getElementById('image-search-status'),preview=document.getElementById('image-query-preview'),results=document.getElementById('image-search-results'),coverage=document.getElementById('image-search-coverage'),clear=document.getElementById('clear-image-search');
const t=s=>window.siteI18n?.translate(s)||s;let manifestPromise,manifest,queryVersion=0,objectUrl,lastMessage;const shardCache=new Map();
function message(s,error=false){lastMessage={s,error};status.textContent=typeof s==='function'?s():t(s);status.dataset.error=String(error)}
function coverageText() {
  if (!manifest) return;
  const {indexedImages, totalImages, coveredProducts, products, productsWithoutImages, unavailableImages, pendingImages} = manifest;
  const format = count => count.toLocaleString(document.documentElement.lang);
  const sources = manifest.coverage || {};
  const summary = [
    t('Image coverage') + ': ' + format(indexedImages) + ' / ' + format(totalImages),
    format(coveredProducts) + ' ' + t('products'),
  ];
  if (productsWithoutImages) summary.push(t('Products without photos') + ': ' + format(productsWithoutImages));
  if (unavailableImages) summary.push(t('Some image sources are temporarily unavailable.') + ' (' + format(unavailableImages) + ')');
  if (pendingImages) summary.push(t('Pending images') + ': ' + format(pendingImages));
  const galleries = [
    ['FindSpreadsheet · ' + t('Product photos'), sources.main?.checkedProducts, products],
    ['USFans · ' + t('Product photos') + ' / QC', sources.purchase?.sourceIdsReadable, sources.purchase?.validSourceIds],
    [t('FindSpreadsheet QC'), sources.qc?.checkedIDs, sources.qc?.totalIDs],
  ];
  const lines = galleries.filter(([, checked, total]) => Number.isSafeInteger(checked) && total > 0)
    .map(([label, checked, total]) => label + ' · ' + t('Galleries checked') + ': ' + format(checked) + ' / ' + format(total));
  const summaryText = document.createElement('span');
  summaryText.textContent = summary.join(' · ');
  const sourceList = document.createElement('ul');
  for (const line of lines) {
    const item = document.createElement('li');
    item.textContent = line;
    sourceList.append(item);
  }
  coverage.replaceChildren(summaryText, sourceList);
}
function loadManifest(){if(!manifestPromise)manifestPromise=fetch('/image-index.json?v=coverage-3',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('The catalog image index is unavailable. Please try again.');return r.json()}).then(data=>{if(!data.indexedImages||(!Array.isArray(data.shards)&&!Array.isArray(data.entries)))throw Error('The catalog image index is still being prepared.');manifest=data;coverageText();return data}).catch(e=>{manifestPromise=null;throw e});return manifestPromise;}
function decodeVector(encoded){const raw=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));if(raw.length===112)return raw;if(raw.length!==84)throw Error('Some catalog images could not be loaded. Please try again.');const out=[];let acc=0,bits=0;for(const b of raw){acc=(acc<<8)|b;bits+=8;while(bits>=6){bits-=6;out.push(((acc>>bits)&63)*4+2)}}return Uint8Array.from(out);}
function vectorEntries(rows){return rows.map(([ids,encoded,url,kind])=>({ids,kind,vector:decodeVector(encoded),url}));}
async function shardJson(response){const bytes=new Uint8Array(await response.arrayBuffer());if(bytes[0]===31&&bytes[1]===139){const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));return JSON.parse(await new Response(stream).text());}return JSON.parse(new TextDecoder().decode(bytes));}
function loadShard(shard){if(!shardCache.has(shard.url))shardCache.set(shard.url,fetch(shard.url+'?transport=3').then(r=>{if(!r.ok)throw Error('Some catalog images could not be loaded. Please try again.');return shardJson(r)}).then(vectorEntries).catch(e=>{shardCache.delete(shard.url);throw e}));return shardCache.get(shard.url);}
function vectorFor(image){const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d',{willReadFrequently:true});c.fillStyle='#fff';c.fillRect(0,0,64,64);const scale=Math.min(64/image.width,64/image.height),w=image.width*scale,h=image.height*scale;c.drawImage(image,(64-w)/2,(64-h)/2,w,h);const tiny=document.createElement('canvas');tiny.width=tiny.height=8;const tc=tiny.getContext('2d',{willReadFrequently:true});tc.drawImage(canvas,0,0,8,8);const rgba=tc.getImageData(0,0,8,8).data,out=[];for(let i=0;i<rgba.length;i+=4)out.push(Math.round(.299*rgba[i]+.587*rgba[i+1]+.114*rgba[i+2]));tiny.width=tiny.height=4;tc.drawImage(canvas,0,0,4,4);const rgb=tc.getImageData(0,0,4,4).data;for(let i=0;i<rgb.length;i+=4)out.push(rgb[i],rgb[i+1],rgb[i+2]);return out;}
function distance(a,b){let gray=0,color=0;for(let i=0;i<64;i++)gray+=Math.abs(a[i]-b[i]);for(let i=64;i<112;i++)color+=Math.abs(a[i]-b[i]);return gray/64*.55+color/48*.45;}
function showCards(products,matches){const heading=document.createElement('h2');heading.className='image-results-heading';heading.textContent='Closest visual matches';const note=document.createElement('p');note.className='image-similarity-note';note.textContent='Results compare image appearance across the indexed catalog. Similar colour or composition is not a guarantee of the same product, seller or model.';const grid=document.createElement('div');grid.className='products-grid';for(const p of products){const match=matches.get(p.id);const article=document.createElement('article');article.className='listing-card image-result-card';const link=document.createElement('a');link.href=p.href;const wrap=document.createElement('div');wrap.className='listing-image';const img=document.createElement('img');img.src=match?.url||p.image;img.alt=p.title;img.loading='lazy';img.addEventListener('error',()=>{if(img.src!==new URL(p.image,location.href).href){img.src=p.image;const warning=document.createElement('small');warning.className='match-unavailable';warning.textContent='Some image sources are temporarily unavailable.';article.append(warning)}},{once:true});wrap.append(img);const title=document.createElement('h3');title.textContent=p.title;if(p.kind!=='page'){title.dataset.productTitle='';title.dataset.originalTitle=p.title;title.dataset.productCategory=p.category;title.dataset.productId=p.id;}link.append(wrap,title);if(p.kind!=='page'){const price=document.createElement('div');price.className='card-price';const amount=document.createElement('span');amount.dataset.priceUsd=p.priceUsd||'';amount.dataset.priceFrom=String(!!p.priceFrom);amount.dataset.priceCny=p.priceCny||'';amount.textContent=p.price;price.append(amount);const label=document.createElement('small');label.className='card-price-note';label.textContent='Estimated conversion';link.append(price,label);}const action=document.createElement('span');action.className='listing-action';action.textContent=p.kind==='page'?'Explore the guide →':'View product →';link.append(action);article.append(link);if(match?.url){const original=document.createElement('a');original.className='matched-image-link';original.href=match.url;original.target='_blank';original.rel='noopener';original.textContent='View matched image';article.append(original);}grid.append(article);}results.replaceChildren(heading,note,grid);}
async function search(file){const version=++queryVersion,startedAt=performance.now();results.replaceChildren();delete status.dataset.comparedImages;delete status.dataset.searchMs;if(!file)return;if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)){message('Please choose a JPG, PNG, WebP or AVIF image.',true);return}if(file.size>10*1024*1024){message('Please choose an image smaller than 10 MB.',true);return}
 try{message('Reading your image and loading the full catalog…');if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(file);const image=new Image();image.src=objectUrl;await image.decode();if(version!==queryVersion)return;const thumb=document.createElement('img');thumb.src=objectUrl;thumb.alt='Your image-search reference';preview.replaceChildren(thumb);clear.hidden=false;const vector=vectorFor(image),data=await loadManifest(),ranked=new Map();let compared=0;
 const compare=rows=>{for(const row of rows){const score=distance(vector,row.vector);for(const id of row.ids)if(!ranked.has(id)||score<ranked.get(id).score)ranked.set(id,{score,url:row.url,kind:row.kind});}compared+=rows.length;};
 if(Array.isArray(data.entries))compare(vectorEntries(data.entries));else for(let i=0;i<data.shards.length;i+=2){message(()=>t('Loading catalog images…')+' '+compared.toLocaleString()+' / '+data.indexedImages.toLocaleString());const wave=await Promise.all(data.shards.slice(i,i+2).map(loadShard));if(version!==queryVersion)return;for(const rows of wave)compare(rows);message(()=>t('Searching all indexed images…')+' '+compared.toLocaleString()+' / '+data.indexedImages.toLocaleString());await new Promise(r=>requestAnimationFrame(r));}
 if(version!==queryVersion)return;if(compared!==data.indexedImages)throw Error('Some catalog images could not be loaded. Please try again.');
 const top=[...ranked.entries()].sort((a,b)=>a[1].score-b[1].score).slice(0,24),ids=top.map(([id])=>id).filter(id=>/^\d+$/.test(id));let products=[];if(ids.length){const r=await fetch('/api/search?ids='+ids.join(','));if(!r.ok)throw Error('Matching product details could not be loaded. Please try again.');products=(await r.json()).products;}
 if(version!==queryVersion)return;const byId=new Map(products.map(p=>[p.id,p]));for(const[id]of top)if(data.staticTargets?.[id])byId.set(id,data.staticTargets[id]);showCards(top.map(([id])=>byId.get(id)).filter(Boolean),ranked);message(()=>t('Image coverage')+': '+compared.toLocaleString()+' / '+data.indexedImages.toLocaleString()+' · '+t('Closest visual matches')+': '+top.length);status.dataset.comparedImages=String(compared);status.dataset.indexVersion=String(data.version);status.dataset.searchMs=String(Math.round(performance.now()-startedAt));
 }catch(e){manifestPromise=null;if(version===queryVersion)message(()=>t(e.message||'This image could not be read. Please try a different photo.'),true)}}
input.addEventListener('change', () => search(input.files[0]));
document.addEventListener('paste', event => {
  if (event.target instanceof Element && event.target.closest('input:not([type=file]), textarea, [contenteditable=true]')) return;
  const image = Array.from(event.clipboardData?.files || []).find(file => file.type.startsWith('image/'));
  if (!image) return;
  event.preventDefault();
  search(image);
});
for(const n of ['dragenter','dragover'])drop.addEventListener(n,e=>{e.preventDefault();drop.classList.add('drag-over')});for(const n of ['dragleave','drop'])drop.addEventListener(n,e=>{e.preventDefault();drop.classList.remove('drag-over')});drop.addEventListener('drop',e=>search(e.dataTransfer.files[0]));clear.addEventListener('click',()=>{queryVersion++;input.value='';results.replaceChildren();preview.replaceChildren(Object.assign(document.createElement('span'),{textContent:'Your reference photo appears here'}));clear.hidden=true;if(objectUrl)URL.revokeObjectURL(objectUrl);message('Choose a photo to search the catalog.');delete status.dataset.comparedImages});document.addEventListener('site-language-changed',()=>{coverageText();if(lastMessage)message(lastMessage.s,lastMessage.error)});loadManifest().catch(e=>message(()=>t(e.message),true));
})();
