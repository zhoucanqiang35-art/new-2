import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
const root=new URL('../',import.meta.url);
const pause=()=>new Promise(r=>setTimeout(r,40));
async function page(route,path) {
 const html=await readFile(new URL('dist/'+path,root),'utf8');
 const dom=new JSDOM(html,{url:'http://localhost'+route,runScripts:'outside-only'});const w=dom.window;
 w.localStorage.setItem('litbuyLang','zh');
 w.fetch=async url=>{try {const text=await readFile(new URL('public'+url,root),'utf8');return {ok:true,json:async()=>JSON.parse(text)};}catch{return {ok:false,status:404};}};
 w.eval(await readFile(new URL('public/language.js',root),'utf8'));
 w.eval(await readFile(new URL('public/app.js',root),'utf8'));
 for(let n=0;n<40;n++){await pause();if(w.document.querySelector('.product-card,.detail-grid'))break;}
 await pause();return dom;
}
test('catalog renders 24 original product IDs with available Chinese titles',async()=>{
 const dom=await page('/products/','products/index.html');const d=dom.window.document;
 const products=JSON.parse(await readFile(new URL('public/data/products.json',root),'utf8'));
 const titles=JSON.parse(await readFile(new URL('public/data/titles/zh.json',root),'utf8'));
 assert.equal(d.querySelectorAll('.product-card').length,24);
 const first=products.filter(p=>/^\d+$/.test(p.weidianId))[0];
 assert.equal(d.querySelector('[data-product-title]').dataset.productTitle,first.id);
 assert.equal(d.querySelector('[data-product-title]').textContent,titles[first.id]||first.name);
 assert.equal(d.querySelector('.product-card img').getAttribute('src'),first.image);
 assert.ok(d.querySelector('#result-count').textContent.startsWith(String(products.filter(p=>/^\d+$/.test(p.weidianId)).length)));dom.window.close();
});
test('detail preserves product ID, main purchase URL and referral links',async()=>{
 const dom=await page('/product/?id=9018','product/index.html');const d=dom.window.document;
 for(let n=0;n<30&&!d.querySelector('.source-thumbs img');n++)await pause();
 assert.ok(d.querySelector('.detail-grid'));
 assert.equal(d.querySelector('[data-product-title]').dataset.productTitle,'9018');
 assert.equal(d.querySelector('.detail-actions a').href,'https://litbuy.com/product/weidian/7869696051');
 assert.ok([...d.querySelectorAll('.agent-grid a')].some(a=>a.href==='https://oopbuy.com/product/weidian/7869696051?inviteCode=U68CWQBN5'));
 assert.ok(d.querySelector('.detail-product-id').textContent.includes('7869696051'));
 assert.ok(d.querySelector('.source-thumbs img'));dom.window.close();
});
