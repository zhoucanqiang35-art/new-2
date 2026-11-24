import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {itemFromInput,searchTerms,searchText} from '../src/lib/search-query.mjs';
const id='7869128383',seller='https://weidian.com/item.html?itemID='+id;
for(const input of [id,'７８６９１２８３８３',seller,'weidian.com/item.html?itemId='+id,'https://www.sugargoo.com/products?productLink='+encodeURIComponent(seller),'https://www.sugargoo.com/#/products?productLink='+encodeURIComponent(seller)]){
 assert.equal(itemFromInput(input),id);assert.deepEqual(searchTerms(input),[id]);
}
for(const input of ['https://evil-weidian.com/?itemID='+id,'https://weidian.com.evil.example/?itemID='+id,'javascript:alert(1)','https://www.sugargoo.com/register?memberId='+id,'hoodie'])assert.equal(itemFromInput(input),null);
assert.equal(searchText('Gel-NYC'),searchText('gel nyc'));
assert(searchTerms('black hoodie').every(t=>searchText('Black Full-Zip Hoodie').includes(t)));
const catalog=JSON.parse(readFileSync(new URL('../public/data/catalog.json',import.meta.url),'utf8'));
assert.equal(catalog.filter(p=>searchTerms(seller).every(t=>searchText(p.name+' '+p.weidianId).includes(t))).length,1);
console.log('PASS: purchase links, full-width IDs, invalid hosts, punctuation, multiple keywords and exact catalog match');
