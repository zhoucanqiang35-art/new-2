#!/usr/bin/env node
// Prepare and import offline title translations for the 14 additional locales.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const locales=read('translations/planned-locales.json').languages.map(x=>x.code);
const products=read('dist/catalog.json').products;
const names=[...new Set(products.map(p=>p.name).filter(x=>typeof x==='string'&&x.trim()))];
const original=read('translations/featured-draft.json');
const fi=read('translations/fi-draft.json').productTitles;
const jsPath=path.join(root,'dist/product-title-translation.js');
const source=fs.readFileSync(jsPath,'utf8');
const marker=' const originals=new WeakMap()';
if(source.split(marker).length!==2)throw Error('Missing or ambiguous insertion point');
const ctx={document:{querySelector:()=>({})}};
vm.runInNewContext(source.slice(0,source.indexOf(marker))+';globalThis.result=localTitles;globalThis.idResult=typeof productIdTitles==="undefined"?{}:productIdTitles;})();',ctx,{timeout:30000});
const local=ctx.result;
const missing=(name,lang)=>!local[lang]?.[name];
const command=process.argv[2];
if(command==='status'){
 const visible=products.filter(p=>String(p.id)!=='6250'&&/^\d+$/.test(String(p.weidianId||'')));
 const byLanguage=Object.fromEntries(locales.map(lang=>[lang,visible.reduce((n,p)=>n+((ctx.idResult[String(p.id)]?.name===p.name&&ctx.idResult[String(p.id)]?.translations?.[lang])||local[lang]?.[p.name]?0:1),0)]));
 console.log(JSON.stringify({products:visible.length,missingByLanguage:byLanguage,missingProductLanguageEntries:Object.values(byLanguage).reduce((a,b)=>a+b,0),warning:'Counts dictionary presence, not translation quality.'}));
}else if(command==='export'){
 const dir=process.argv[3],size=Number(process.argv[4]||250);
 if(!dir||!Number.isInteger(size)||size<1||size>1000)throw Error('Usage: export <directory> [1..1000]');
 fs.mkdirSync(dir,{recursive:true});let rows=names.map(name=>({name,missing:locales.filter(lang=>missing(name,lang)),translations:{}})).filter(x=>x.missing.length);let files=[];
 for(let i=0;i<rows.length;i+=size){let file=path.join(dir,`titles-${String(1+i/size).padStart(4,'0')}.json`);if(fs.existsSync(file))throw Error(`Refusing to overwrite ${file}`);files.push([file,JSON.stringify({languages:locales,items:rows.slice(i,i+size)},null,2)+'\n'])}
 for(let [file,content] of files)fs.writeFileSync(file,content,{flag:'wx'});
 console.log(JSON.stringify({titles:rows.length,missingValues:rows.reduce((a,x)=>a+x.missing.length,0),batches:files.length,directory:path.resolve(dir)}));
}else if(command==='merge'){
 const file=process.argv[3];if(!file)throw Error('Usage: merge <batch.json>');let input=JSON.parse(fs.readFileSync(file,'utf8'));if(!Array.isArray(input.items))throw Error('Expected items array');let known=new Set(names),seen=new Set(),add={};
 for(let item of input.items){if(!known.has(item.name))throw Error(`Unknown title: ${item.name}`);if(seen.has(item.name))throw Error(`Duplicate title: ${item.name}`);seen.add(item.name);if(!item.translations||typeof item.translations!=='object')throw Error(`Missing translations: ${item.name}`);for(let [lang,value] of Object.entries(item.translations)){if(!locales.includes(lang))throw Error(`Unknown locale: ${lang}`);if(typeof value!=='string'||!value.trim()||/MYMEMORY WARNING|QUOTA EXCEEDED/i.test(value))throw Error(`Invalid translation: ${lang} / ${item.name}`);if(missing(item.name,lang)){(add[item.name]??={})[lang]=value.trim()}}}
 if(!Object.keys(add).length){console.log('No missing entries supplied.');process.exit(0)}
 let block=' { const entries='+JSON.stringify(add)+'; for(const [name,rows] of Object.entries(entries)) for(const [lang,value] of Object.entries(rows)) if(!localTitles[lang][name]) localTitles[lang][name]=value; }\n';const insertMarker=source.includes(' const productIdTitles=')?' const productIdTitles=':marker;let next=source.replace(insertMarker,block+insertMarker);new vm.Script(next);for(const [name,rows] of Object.entries(add))original.titles[name]={...rows,...(original.titles[name]||{})};
 fs.writeFileSync(jsPath,next);fs.writeFileSync(path.join(root,'translations/featured-draft.json'),JSON.stringify(original,null,2)+'\n');console.log(JSON.stringify({titles:Object.keys(add).length,values:Object.values(add).reduce((n,x)=>n+Object.keys(x).length,0),warning:'Dictionary presence does not verify translation quality.'}));
}else throw Error('Usage: status | export <directory> [batch size] | merge <translated batch.json>');
