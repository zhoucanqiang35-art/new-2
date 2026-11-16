import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
const code = await readFile(new URL('../public/language.js', import.meta.url), 'utf8');
const settle = () => new Promise(resolve => setTimeout(resolve, 40));
async function fixture(saved='en', customFetch) {
  const dom = new JSDOM(`<body><select id="language"><option value="en">English</option><option value="zh">中文</option><option value="ar">العربية</option></select><p id="plain">Price unavailable</p><h1 data-home-i18n="home">Home</h1><h2 data-product-title="1">Test shoes</h2><input name="q" placeholder="Search products"><button aria-label="Next product image">→</button><p id="status"></p></body>`, {url:'http://localhost',runScripts:'outside-only'});
  const {window:w}=dom;
  w.localStorage.setItem('litbuyLang',saved);
  const data={
    '/data/ui.json':{}, '/data/home-ui.json':{zh:{home:'首页',search_placeholder:'搜索商品'},ar:{home:'الرئيسية'}},
    '/data/messages.json':{zh:{'Price unavailable':'暂无价格','Weidian link copied.':'已复制微店链接。','Next product image':'下一张商品图片'}},
    '/data/titles/zh.json':{'1':'测试鞋'}, '/data/titles/ar.json':{'1':'حذاء'}
  };
  w.fetch=customFetch || (async url => ({ok:true,json:async()=>data[url]||{}}));
  w.console.warn=()=>{};
  w.eval(code); await settle();
  const change=async value=>{w.document.querySelector('#language').value=value;w.document.querySelector('#language').dispatchEvent(new w.Event('change'));await settle();};
  return {dom,w,change};
}
test('translations restore English, update dynamic text and translate attributes',async()=>{
  const {dom,w,change}=await fixture('zh'); const d=w.document;
  assert.equal(d.querySelector('h1').textContent,'首页');assert.equal(d.querySelector('h2').textContent,'测试鞋');
  assert.equal(d.querySelector('#plain').textContent,'暂无价格');assert.equal(d.querySelector('input').placeholder,'搜索商品');
  assert.equal(d.querySelector('button').getAttribute('aria-label'),'下一张商品图片');
  d.querySelector('#status').textContent='Weidian link copied.';await settle();assert.equal(d.querySelector('#status').textContent,'已复制微店链接。');
  const p=d.createElement('p');p.textContent='Price unavailable';d.body.append(p);await settle();assert.equal(p.textContent,'暂无价格');
  await change('en');assert.equal(d.querySelector('h1').textContent,'Home');assert.equal(d.querySelector('h2').textContent,'Test shoes');assert.equal(p.textContent,'Price unavailable');assert.equal(d.querySelector('input').placeholder,'Search products');assert.equal(d.querySelector('#status').textContent,'Weidian link copied.');
  await change('ar');assert.equal(d.documentElement.dir,'rtl');await change('en');assert.equal(d.documentElement.dir,'ltr');dom.window.close();
});
test('unsupported saved locale falls back to English',async()=>{const {dom,w}=await fixture('../../bad');assert.equal(w.document.documentElement.lang,'en');dom.window.close();});
test('failed downloads can be retried on next selection',async()=>{
 let fail=true;const fetch=async url=>{if(fail)throw Error('offline');return {ok:true,json:async()=>url.includes('home-ui')?{zh:{home:'首页'}}:{}}};
 const {dom,w,change}=await fixture('zh',fetch);assert.equal(w.document.querySelector('h1').textContent,'Home');fail=false;await change('en');await change('zh');assert.equal(w.document.querySelector('h1').textContent,'首页');dom.window.close();
});
test('late locale responses cannot replace a newer selection',async()=>{
 let release;const fetch=async url=>{if(url==='/data/titles/zh.json')await new Promise(r=>release=r);return {ok:true,json:async()=>url.includes('home-ui')?{zh:{home:'首页'},ar:{home:'الرئيسية'}}:{}}};
 const {dom,w,change}=await fixture('zh',fetch);await change('ar');release();await settle();assert.equal(w.document.documentElement.lang,'ar');assert.equal(w.document.querySelector('h1').textContent,'الرئيسية');dom.window.close();
});
