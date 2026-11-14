const fs=require('node:fs');
const zlib=require('node:zlib');
const paths=['scripts/index-data/image-index-1.json.gz','scripts/index-data/image-index-2.json.gz'];
const index=Object.assign({},...paths.map(p=>JSON.parse(zlib.gunzipSync(fs.readFileSync(p)).toString('utf8')).images));
const catalog=JSON.parse(fs.readFileSync('public/data/catalog.json','utf8')).products;
const offsets=new Map(),vectors=[],products=[];let missing=0;
for(const p of catalog){if(!p.name||!p.sourcePath||!/^\d{5,20}$/.test(String(p.weidianId||'')))continue;const refs=[];for(const url of new Set([p.image,...(p.sourceImages||[]),...(p.weidianImages||[]),...(p.qcImages||[])])){if(!url)continue;const vector=index[url];if(!Array.isArray(vector)||vector.length!==192){missing++;continue}if(!offsets.has(url)){offsets.set(url,vectors.length);vectors.push(Buffer.from(vector))}refs.push(offsets.get(url))}if(refs.length)products.push([String(p.id),refs])}
fs.writeFileSync('public/data/image-search-vectors.bin',Buffer.concat(vectors));fs.writeFileSync('public/data/image-search-products.json',JSON.stringify({version:1,products}));console.log(`Image search: ${products.length} products, ${vectors.length} indexed images, ${missing} unindexed references`);
