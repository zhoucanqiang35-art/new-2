import fs from 'node:fs';import assert from 'node:assert/strict';
import {translateProductTitle} from '../public/product-title-core.js';
const languages=JSON.parse(fs.readFileSync('src/languages.json'));
const keys=JSON.parse(fs.readFileSync('data/i18n/product-terms.json'));
const pages=JSON.parse(fs.readFileSync('data/catalog-snapshot.json')).pages;
const products=Object.values(Object.fromEntries(Object.values(pages).flatMap(p=>p.products).map(p=>[p.id,p])));
assert.equal(languages.length,23);assert.ok(!languages.some(l=>l.code==='zh-TW'||l.code==='cs'));
for(const {code} of languages){
 const terms=JSON.parse(fs.readFileSync('public/i18n/products/'+code+'.json'));
 assert.equal(Object.keys(terms).length,keys.length,code+' term count');
 for(const key of keys)assert.ok(typeof terms[key]==='string'&&terms[key].trim(),code+' missing '+key);
 for(const product of products){const title=translateProductTitle(product.title,product.source.split('/')[1],code,terms);assert.ok(typeof title==='string'&&title.trim(),code+' empty '+product.id);assert.ok(!/[\uE000-\uF8FF]/.test(title),code+' unresolved protected name '+product.id);if(code==='en')assert.equal(title,product.title);}
 const model=translateProductTitle('Nike Air Max 95 Sneakers BJ016','shoes',code,terms);assert.ok(model.includes('Nike Air Max')&&model.includes('95')&&model.includes('BJ016'),code+' brand/model changed');
 if(code!=='en')assert.notEqual(translateProductTitle('Embroidered Pullover Hoodie','hoodies-sweaters',code,terms),'Embroidered Pullover Hoodie',code+' untranslated product title');
}
console.log('PASS: '+products.length+' product titles × '+languages.length+' languages; '+keys.length+' terms per language; brands, IDs and protected text preserved.');
