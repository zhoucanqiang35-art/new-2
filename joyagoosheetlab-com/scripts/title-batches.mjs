#!/usr/bin/env node
// Offline catalogue translation preparation and validation. No network requests.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'dist/product-title-translation.js');
const catalogPath = path.join(root, 'dist/catalog.json');
const langs = ['de','fr','es','it','pt','nl','pl','sv','zh'];
const marker = ' const originals=new WeakMap()';
const source = fs.readFileSync(sourcePath, 'utf8');
const markerIndex = source.indexOf(marker);
if (markerIndex < 0 || source.indexOf(marker, markerIndex + 1) !== -1) throw Error('Translation insertion marker is missing or ambiguous.');
const context = {document:{querySelector:()=>({})}};
vm.runInNewContext(source.slice(0,markerIndex)+';globalThis.result=localTitles;})();',context,{timeout:5000});
const local = context.result;
const products = JSON.parse(fs.readFileSync(catalogPath,'utf8')).products;
const byName = new Map();
for (const p of products) {
 if (typeof p.name !== 'string' || !p.name.trim()) continue;
 let ids=byName.get(p.name);if(!ids)byName.set(p.name,ids=[]);ids.push(String(p.id));
}
const rows=[...byName].map(([name,ids])=>({name,ids,missing:langs.filter(lang=>!local[lang]?.[name])}));
const incomplete=rows.filter(row=>row.missing.length);
const command=process.argv[2];
if (command==='status') {
 const byLanguage=Object.fromEntries(langs.map(lang=>[lang,rows.filter(row=>!local[lang]?.[row.name]).length]));
 console.log(JSON.stringify({totalTitles:rows.length,completeTitles:rows.length-incomplete.length,incompleteTitles:incomplete.length,productRecords:products.length,byLanguage},null,2));
} else if (command==='export') {
 const destination=process.argv[3];const size=Number(process.argv[4]||100);
 if(!destination || !Number.isInteger(size) || size<1 || size>1000)throw Error('Usage: export <directory> [batch size 1..1000]');
 fs.mkdirSync(destination,{recursive:true});
 const files=[];for(let i=0;i<incomplete.length;i+=size){const file=path.join(destination,`batch-${String(i/size+1).padStart(4,'0')}.json`);if(fs.existsSync(file))throw Error(`Refusing to overwrite ${file}`);files.push({file,items:incomplete.slice(i,i+size).map(row=>({...row,translations:{}}))});}
 for(const entry of files)fs.writeFileSync(entry.file,JSON.stringify({languages:langs,items:entry.items},null,2)+'\n');
 console.log(JSON.stringify({batches:Math.ceil(incomplete.length/size),titles:incomplete.length,directory:path.resolve(destination)}));
} else if(command==='merge') {
 const input=process.argv[3];if(!input)throw Error('Usage: merge <translated-batch.json>');
 const batch=JSON.parse(fs.readFileSync(input,'utf8'));if(!Array.isArray(batch.items))throw Error('Expected items array');
 const seen=new Set(), additions=Object.create(null);
 for(const item of batch.items){
  if(!item || typeof item.name!=='string' || !byName.has(item.name))throw Error(`Unknown title: ${item?.name}`);
  if(seen.has(item.name))throw Error(`Duplicate title: ${item.name}`);seen.add(item.name);
  const missing=langs.filter(lang=>!local[lang]?.[item.name]);
  if(!missing.length)continue;
  if(!item.translations || typeof item.translations!=='object')throw Error(`Missing translations: ${item.name}`);
  for(const lang of missing){const value=item.translations[lang];if(typeof value!=='string'||!value.trim())throw Error(`Missing ${lang}: ${item.name}`);if(/MYMEMORY WARNING|QUOTA EXCEEDED/i.test(value))throw Error(`Invalid ${lang}: ${item.name}`);}
  additions[item.name]=Object.fromEntries(missing.map(lang=>[lang,item.translations[lang].trim()]));
 }
 if(!Object.keys(additions).length){console.log('No new entries to merge.');process.exit(0)}
 const block=' const importedTitleBatch='+JSON.stringify(additions)+';\n for(const [name,byLanguage] of Object.entries(importedTitleBatch))for(const [language,value] of Object.entries(byLanguage))if(!localTitles[language][name])localTitles[language][name]=value;\n';
 // A block scope prevents name collisions across independently merged batches.
 const next=source.slice(0,markerIndex)+' {\n'+block+' }\n'+source.slice(markerIndex);
 new vm.Script(next,{filename:sourcePath});
 fs.writeFileSync(sourcePath,next);console.log(JSON.stringify({addedTitles:Object.keys(additions).length}));
} else {console.error('Usage: node scripts/title-batches.mjs status | export <dir> [size] | merge <batch.json>');process.exitCode=1;}
