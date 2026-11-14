const fs=require('fs');
const vm=require('vm');
const layoutPath='src/layouts/Base.astro';
const manifestPath='translation-work/additional-title-manifest.json';
const bundlePath='public/additional-title-bundle.js';
let layout=fs.readFileSync(layoutPath,'utf8');
let scripts=[...layout.matchAll(/<script is:inline src="\/([^\"]+)" defer><\/script>/g)].map(m=>m[1]);
const current=scripts.filter(x=>x.startsWith('additional-product-'));
const manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):[];
const productFiles=[...new Set([...manifest,...current])];
if(!productFiles.length)throw Error('No product translation scripts found');
const products=JSON.parse(fs.readFileSync('public/data/catalog.json','utf8')).products;
const langs=['en','zh','de','fr','es','it','pt','nl','pl','sv','fi','da','no','ro','cs','hu','el','tr','uk','ru','ja','ko','ar','id'];
const added=['cs','hu','el','tr','uk','ru','ja','ko','ar','id'];
function environment(includeProducts){
 const ctx={window:{},console};vm.createContext(ctx);
 for(const name of scripts){
  if(name==='i18n.js')break;
  if(name==='additional-title-bundle.js')continue;
  if(name.startsWith('additional-product-'))continue;
  vm.runInContext(fs.readFileSync('public/'+name,'utf8'),ctx,{filename:name});
 }
 if(includeProducts)for(const name of productFiles)vm.runInContext(fs.readFileSync('public/'+name,'utf8'),ctx,{filename:name});
 ctx.window.oopBuildTitleNameIndex?.(products);
 return ctx;
}
const original=environment(true),base=environment(false);const data=Object.fromEntries(added.map(x=>[x,{}]));
for(const p of products)for(const lang of added){
 const a=original.window.oopProductTitle(p,lang),b=base.window.oopProductTitle(p,lang);
 if(a!==b){if(typeof a!=='string'||!a)throw Error('Invalid title '+p.id+' '+lang);data[lang][String(p.id)]=a;}
}
const source='(()=>{const data='+JSON.stringify(data)+';const old=window.oopProductTitle;window.oopProductTitle=(p,l)=>data[l]?.[String(p.id)]??old?.(p,l)??p.name;})();\n';
vm.runInContext(source,base,{filename:'additional-title-bundle.js'});
for(const p of products)for(const lang of langs){
 const a=original.window.oopProductTitle(p,lang),b=base.window.oopProductTitle(p,lang);
 if(a!==b)throw Error('Mismatch '+p.id+' '+lang+' '+JSON.stringify([a,b]));
}
fs.writeFileSync(bundlePath,source);
fs.writeFileSync(manifestPath,JSON.stringify(productFiles,null,2)+'\n');
layout=layout.replace(/<script is:inline src="\/additional-product-[^\"]+" defer><\/script>/g,'');
if(!layout.includes('src="/additional-title-bundle.js"')){
 const needle='<script is:inline src="/i18n.js" defer></script>';
 if(layout.split(needle).length!==2)throw Error('Cannot locate i18n script');
 layout=layout.replace(needle,'<script is:inline src="/additional-title-bundle.js" defer></script>'+needle);
}
fs.writeFileSync(layoutPath,layout);
console.log(JSON.stringify({scriptsReplaced:productFiles.length,productsCompared:products.length,languagesCompared:langs.length,rowsPerLanguage:Object.fromEntries(added.map(l=>[l,Object.keys(data[l]).length])),bundleBytes:Buffer.byteLength(source)}));
