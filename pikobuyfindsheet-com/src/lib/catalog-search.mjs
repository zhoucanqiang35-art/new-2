import {itemId,sourceOrigin} from './platform.mjs';

const chinese = {
  '连帽卫衣':'hoodie','連帽衛衣':'hoodie','连帽衫':'hoodie','連帽衫':'hoodie','卫衣':'hoodie',
  '运动鞋':'shoes','運動鞋':'shoes','球鞋':'shoes','鞋子':'shoes','连衣裙':'dress',
  '短袖':'t-shirt','体恤':'t-shirt','球衣':'jersey','外套':'jacket','夹克':'jacket',
  '长裤':'pants','牛仔裤':'jeans','牛仔褲':'jeans','短裤':'shorts','短褲':'shorts',
  '背包':'backpack','腰包':'waist bag','手提包':'handbag','帽子':'hat',
  '耳机':'headphones','耳機':'headphones','配件':'accessories',
  '无线':'wireless','無線':'wireless','蓝牙':'bluetooth','藍牙':'bluetooth',
  '降噪':'noise cancelling','有线':'wired','有線':'wired','加绒':'fleece','加絨':'fleece',
  '黑色':'black','白色':'white','蓝色':'blue','藍色':'blue','红色':'red','紅色':'red',
};

const categoryTerms = new Set(['shoes','accessories','electronics','headwear']);
const simplified = new Map([
  ['hoodies','hoodie'],['sneaker','shoes'],['sneakers','shoes'],['shoe','shoes'],
  ['tshirt','t-shirt'],['tshirts','t-shirt'],
  ['jerseys','jersey'],['jackets','jacket'],['earbuds','headphones'],['earphones','headphones'],
  ['cancelling','canceling'],['headphone','headphones'],['caps','hat'],['hats','hat'],['cap','hat'],
]);

function text(value) {
  return value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
function words(value) {
  return text(value).replace(/\bt shirts?\b/g,'t-shirt').split(/\s+/)
    .filter(Boolean).map((word)=>simplified.get(word)||word);
}

export function catalogSearchTerm(raw) {
  const value=raw.normalize('NFKC').trim();
  const id=itemId(value) || (/^(?:item\s+)?id\s*[:#]?\s*(\d{6,16})$/i.exec(value)?.[1] || '');
  if(id) return {id,path:'',text:id,words:[]};

  const productPath=/^\/[\w-]+\/[\w-]+\.html$/i;
  let path=productPath.test(value)?value:'';
  if(!path) {
    const url=URL.canParse(value) ? new URL(value)
      : /^(?:www\.)?findspreadsheet\.com\//i.test(value) ? new URL('https://'+value) : null;
    if(url && ['http:','https:'].includes(url.protocol) &&
       [new URL(sourceOrigin).hostname,'www.findspreadsheet.com'].includes(url.hostname) &&
       productPath.test(url.pathname)) path=url.pathname;
  }
  if(path) return {id:'',path,text:value,words:[]};

  let expanded=value.replace(/\bt恤\b|t恤/gi,' t-shirt ');
  for(const [alias,label] of Object.entries(chinese)) expanded=expanded.replaceAll(alias,' '+label+' ');
  return {id:'',path:'',text:expanded.replace(/\s+/g,' ').trim(),words:words(expanded)};
}

function oneEditApart(a,b) {
  if(a===b || Math.abs(a.length-b.length)>1) return false;
  let i=0;
  while(i<Math.min(a.length,b.length) && a[i]===b[i]) i++;
  if(a.length!==b.length) {
    const [shorter,longer]=a.length<b.length?[a,b]:[b,a];
    return shorter.slice(i)===longer.slice(i+1);
  }
  return a.slice(i+1)===b.slice(i+1) ||
    (a[i]===b[i+1] && a[i+1]===b[i] && a.slice(i+2)===b.slice(i+2));
}

function relevance(item,query) {
  if(query.id) return item.id===query.id ? 100 : 0;
  if(query.path) return item.path===query.path ? 100 : 0;
  if(!query.words.length) return 1;
  const name=words(item.title);
  const title=name.join(' ');
  const phrase=query.words.join(' ');
  const nameWords=new Set(name);
  if(title===phrase) return 100;
  const slug=new Set(words(item.path.split('/').at(-1).replace(/-\d+\.html$/,'')));
  const category=categoryTerms.has(item.category)?item.category:'';
  const available = [...nameWords,...slug];
  if(!query.words.every((word)=>nameWords.has(word)||slug.has(word)||word===category||
    (word.length>=3 && available.some((candidate)=>candidate.startsWith(word))))) return 0;
  const exactWords=query.words.filter((word)=>nameWords.has(word)).length;
  const categoryMatch=query.words.length===1 && query.words[0]===category;
  return 5 + 50*exactWords/query.words.length + (title.includes(phrase)?18:0) + (categoryMatch?20:0);
}

export function rankCatalogItems(items,query,keepUnmatched=false,allowTypos=true) {
  if(!query.words.length && !query.id && !query.path) return query.text && !keepUnmatched ? [] : items.slice();
  const rows=items.map((item)=>({item,score:relevance(item,query)}));
  const [word]=query.words;
  if(allowTypos && query.words.length===1 && /^[a-z]{5,}$/.test(word) && !rows.some(({score})=>score>0)) {
    for(const row of rows) {
      if(words(row.item.title).some((candidate)=>oneEditApart(word,candidate))) row.score=1;
    }
  }
  return rows.filter(({score})=>keepUnmatched || score>0)
    .sort((a,b)=>b.score-a.score || b.item.date-a.item.date).map(({item})=>item);
}

const optionalAttributes = new Set(['wireless','wired','bluetooth','noise','canceling','fleece','black','white','blue','red']);
export function relatedCatalogItems(items,query) {
  if(query.id || query.path || !query.words.length) return [];
  if(query.words.length===1) return rankCatalogItems(items,query);
  const core=query.words.filter((word)=>!optionalAttributes.has(word));
  if(!core.length || core.length===query.words.length) return [];
  const attributes=query.words.filter((word)=>optionalAttributes.has(word));
  return rankCatalogItems(items,{...query,words:core},false,false)
    .map((item)=>({item,score:attributes.filter((word)=>relevance(item,{words:[word]})>0).length}))
    .sort((a,b)=>b.score-a.score).map(({item})=>item);
}
