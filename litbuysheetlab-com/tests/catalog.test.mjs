import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
const root=new URL('../',import.meta.url);
const pause=()=>new Promise(r=>setTimeout(r,30));
async function page(route,path,lang='en'){
 const html=await readFile(new URL('dist/'+path,root),'utf8');
 const dom=new JSDOM(html,{url:'https://litbuysheetlab.com'+route,runScripts:'outside-only'}),w=dom.window;
 w.localStorage.setItem('litbuyLang',lang);w.localStorage.setItem('litbuyLanguageChosenV2','yes');
 w.fetch=async url=>{try{const text=await readFile(new URL('public'+url,root),'utf8');return {ok:true,json:async()=>JSON.parse(text)};}catch{return {ok:false,status:404};}};
 w.eval(await readFile(new URL('public/language.js',root),'utf8'));
 w.eval(await readFile(new URL('public/app.js',root),'utf8'));
 for(let n=0;n<100;n++){await pause();if(w.document.querySelector('#result-count')?.textContent.startsWith('8911'))break;}
 await pause();return dom;
}
test('catalog retains every source record and uses independently addressable product links',async()=>{
 const dom=await page('/products/','products/index.html','zh'),d=dom.window.document;
 const products=JSON.parse(await readFile(new URL('public/data/products.json',root),'utf8'));
 const titles=JSON.parse(await readFile(new URL('public/data/titles/zh.json',root),'utf8'));
 assert.equal(d.querySelectorAll('.product-card').length,24);
 assert.equal(d.querySelector('.product-card').getAttribute('href'),'/products/'+products[0].id+'/');
 assert.equal(d.querySelector('[data-product-title]').textContent,titles[products[0].id]||products[0].name);
 assert.ok(d.querySelector('#result-count').textContent.startsWith('8911'));
 dom.window.close();
});
test('combined keyword, category, CNY bounds and sorting remain in the URL and constrain results',async()=>{
 const dom=await page('/products/','products/index.html'),w=dom.window,d=w.document;
 d.querySelector('#query').value='hoodie';d.querySelector('[name=category]').value='hoodies-sweaters';
 d.querySelector('[name=min]').value='100';d.querySelector('[name=max]').value='300';d.querySelector('[name=sort]').value='price-asc';
 d.querySelector('#catalog-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const amounts=[...d.querySelectorAll('#catalog .money')].map(e=>Number(e.dataset.cny));
 assert.ok(amounts.length>0);assert.ok(amounts.every(x=>x>=100&&x<=300));assert.deepEqual(amounts,[...amounts].sort((a,b)=>a-b));
 const params=new URL(w.location.href).searchParams;assert.equal(params.get('q'),'hoodie');assert.equal(params.get('category'),'hoodies-sweaters');assert.equal(params.get('sort'),'price-asc');
 assert.ok([...d.querySelectorAll('#catalog-pagination a')].every(e=>e.href.includes('q=hoodie')&&e.href.includes('min=100')));
 d.querySelector('[name=photos]').value='qc';d.querySelector('[name=photos]').dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.equal(d.querySelectorAll('#catalog .product-card').length,0);assert.match(d.querySelector('#search-notice').textContent,/No independently verified/);
 dom.window.close();
});
test('static product HTML preserves item IDs and agents and does not mislabel source photos as QC',async()=>{
 const html=await readFile(new URL('dist/products/9018/index.html',root),'utf8');const dom=new JSDOM(html),d=dom.window.document;
 assert.equal(d.querySelector('.detail-actions a').href,'https://litbuy.com/product/weidian/7869696051');
 assert.ok([...d.querySelectorAll('.agent-grid a')].some(a=>a.href==='https://oopbuy.com/product/weidian/7869696051?inviteCode=U68CWQBN5'));
 assert.ok(d.querySelector('.detail-product-id').textContent.includes('7869696051'));assert.ok(d.querySelector('.source-thumbs img'));
 assert.equal(d.querySelector('meta[name=robots]').content,'index,follow');assert.equal(d.querySelector('link[rel=canonical]').href,'https://litbuysheetlab.com/products/9018/');
 assert.match(d.querySelector('title').textContent,/Orb Graphic Crew Socks/);assert.match(d.querySelector('script[src^="/currency.js"]').getAttribute('src'),/\?v=[a-f0-9]{12}$/);assert.match(d.querySelector('script[src^="/product-page.js"]').getAttribute('src'),/\?v=[a-f0-9]{12}$/);assert.equal(d.querySelectorAll('.product-facts,.product-checks,.qc-panel').length,0);assert.ok(d.querySelector('.gallery-panel'));
 dom.window.close();
});
