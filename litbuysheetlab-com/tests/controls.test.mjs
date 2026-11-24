import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {JSDOM} from 'jsdom';
const root=new URL('../',import.meta.url);
test('compact selectors preserve all languages, use matching currency and close with Escape',async()=>{
 const dom=new JSDOM(await readFile(new URL('dist/index.html',root),'utf8'),{url:'https://litbuysheetlab.com/',runScripts:'outside-only'}),w=dom.window,d=w.document;
 w.eval(await readFile(new URL('public/controls.js',root),'utf8'));
 const language=d.querySelector('[data-picker=language]'),currency=d.querySelector('[data-picker=currency]');
 assert.equal(language.querySelectorAll('.picker-panel button').length,24);assert.equal(currency.querySelectorAll('.picker-panel button').length,20);
 language.querySelector('.picker-toggle').click();assert.equal(language.querySelector('.picker-panel').hidden,false);
 language.querySelector('[data-value=ja]').click();assert.equal(d.querySelector('#language').value,'ja');assert.equal(d.querySelector('#currency').value,'JPY');assert.equal(currency.querySelector('.picker-value').textContent,'JPY ¥');assert.equal(language.querySelector('.picker-panel').hidden,true);
 currency.querySelector('.picker-toggle').click();d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert.equal(currency.querySelector('.picker-panel').hidden,true);
 assert.equal(d.querySelectorAll('datalist option').length,8);assert.equal(d.querySelectorAll('.search-hints a').length,4);assert.match(d.querySelector('.nav-cta').textContent,/Join litbuy/);dom.window.close();
});
test('all agent logos are local assets and product styles update the main photo',async()=>{
 const dom=new JSDOM(await readFile(new URL('dist/products/9018/index.html',root),'utf8'),{url:'https://litbuysheetlab.com/products/9018/',runScripts:'outside-only'}),w=dom.window,d=w.document;
 const links=[...d.querySelectorAll('.agent-grid a')];assert.equal(links.length,19);
 for(const a of links){const img=a.querySelector('img');assert.ok(img);await readFile(new URL('public'+img.getAttribute('src'),root));}
 w.HTMLElement.prototype.scrollIntoView=()=>{};w.eval(await readFile(new URL('public/product-page.js',root),'utf8'));const choices=[...d.querySelectorAll('[data-preview-image]')];assert.ok(choices.length);choices.at(-1).click();assert.equal(d.querySelector('#slide-image').src,choices.at(-1).dataset.previewImage);assert.equal(choices.at(-1).getAttribute('aria-pressed'),'true');dom.window.close();
});
