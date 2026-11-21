import {copyFile,cp,mkdir,readdir,readFile,rm,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve,relative,extname} from 'node:path';
import {rolldown} from 'rolldown';

const production = process.argv[2] === '--production';
const dist = resolve(production ? process.argv[3] : 'dist');
const fragment = (name) => resolve('findspreadsheet', name);
const read = (name) => readFile(fragment('data/' + name));
const gzip = (data) => gzipSync(data,{level:9}).toString('base64');

async function allFiles(directory) {
  return (await readdir(directory,{recursive:true,withFileTypes:true})).filter((file)=>file.isFile())
    .map((file)=>resolve(file.parentPath,file.name));
}
async function bundle(input, file, plugin) {
  const build=await rolldown({input,plugins:plugin?[plugin]:[]});
  await build.write({file,format:'es'});
  await build.close();
}

await mkdir(resolve(dist,'data'),{recursive:true});
await cp(fragment('assets'),resolve(dist,'assets'),{recursive:true});
await cp(fragment('qc-media'),resolve(dist,'qc-media'),{recursive:true});
const catalogBytes=await read('catalog.json');
const catalog=JSON.parse(catalogBytes);
const imageIndexKey=createHash('sha256').update(catalog.items.map(({path})=>path).join('\n')).digest('hex');
const photoBytes=await read('visual-photos.json');
const manifest=JSON.parse(photoBytes);
const rows=await read('visual-index.bin');
const qcVisual=await read('qc-visual.json');
if (manifest.imageIndexKey!==imageIndexKey || manifest.products!==catalog.items.length ||
    rows.length!==manifest.photos.length*50) throw new Error('FindSpreadsheet catalog and image index do not match');
const version=createHash('sha256').update(catalogBytes).update(photoBytes).update(rows).update(qcVisual).digest('hex').slice(0,20);
await writeFile(resolve(dist,'catalog-data.json'),JSON.stringify({...catalog,imageIndexKey}));
for (const name of ['visual-photos.json','visual-index.bin','qc-visual.json','qc-snapshot.json']) {
  await copyFile(fragment('data/'+name),resolve(dist,'data',name));
}
const files=await allFiles(dist);
for (const file of files.filter((file)=>file.endsWith('.html')&&file.includes('image-search'))) {
  const source=await readFile(file,'utf8');
  await writeFile(file,source.replace('__IMAGE_INDEX_VERSION__',version));
}
await bundle(fragment('app.mjs'),resolve(dist,'assets/catalog-app.js'));

const virtual = (name, contents) => ({
  name,
  resolveId(id) {if (id===name) return '\0'+name;},
  load(id) {if (id==='\0'+name) return contents;},
});
if (production) {
  const original=resolve(dist,'_worker.js');
  const source=await readFile(fragment('pages-routing.mjs'),'utf8');
  if (!source.includes('const LEGACY=')) throw new Error('Original Cloudflare Pages routing Worker is missing');
  const locales=Object.keys(JSON.parse(await readFile('locales.json','utf8'))).slice(1).join('|');
  const localePattern=/\(zh\|fr\|de\|es\|it\|pl\|nl\|pt(?:\|[a-z]{2})*\)/g;
  const raw=source.replace(localePattern,'('+locales+')').replace(/(headers\.set\('x-pikobuy-release',')[^']+/, '$1findspreadsheet-catalog');
  const entry=resolve('findspreadsheet/pages-worker-build.mjs');
  await writeFile(entry,"import original from 'original-pages-worker';\nimport {catalogApi} from './worker.mjs';\n"
    +`export default {async fetch(request,env){
      const api=catalogApi(request,(path)=>env.ASSETS.fetch(new URL(path,request.url)));
      if(api) return api;
      const response=await original.fetch(request,env);
      const url=new URL(request.url);
      const filtered=[...url.searchParams.keys()].some((key)=>['q','keywords','category','sort'].includes(key));
      if (!filtered && !url.pathname.startsWith('/data/') && url.pathname!=='/catalog-data.json') return response;
      const headers=new Headers(response.headers);
      headers.set('X-Robots-Tag','noindex, follow');
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
    }};\n`);
  try {
    await bundle(entry,original,virtual('original-pages-worker',raw));
  } finally {
    await rm(entry,{force:true});
  }
} else {
  const locales=new Set(Object.keys(JSON.parse(await readFile('locales.json','utf8'))));
  const paths={}, sourceGroups={}, binaries={};
  for (const file of await allFiles(dist)) {
    const path='/'+relative(dist,file);
    if (path.startsWith('/server/') || path.startsWith('/.openai/') || path==='/_headers') continue;
    const bytes=await readFile(file);
    const ext=extname(file);
    if (['.png','.webp','.jpg','.bin'].includes(ext) || path.startsWith('/data/') || path==='/catalog-data.json') {
      binaries[path]=gzip(bytes);
    } else {
      const parts=path.slice(1).split('/');
      if (locales.has(parts[0])) parts.shift();
      const key=ext==='.html' ? parts.join('/') : path;
      (sourceGroups[key]??={})[path]=bytes.toString('utf8');
      paths[path]=key;
    }
  }
  const groups=Object.fromEntries(Object.entries(sourceGroups).map(([key,group])=>[key,gzip(JSON.stringify(group))]));
  const contents='export const paths='+JSON.stringify(paths)+';export const groups='+JSON.stringify(groups)
    +';export const binaries='+JSON.stringify(binaries)+';';
  await bundle(fragment('site-worker.mjs'),resolve(dist,'server/index.js'),virtual('embedded-site',contents));
  await mkdir(resolve(dist,'.openai'),{recursive:true});
  await copyFile('.openai/hosting.json',resolve(dist,'.openai/hosting.json'));
}
console.log(catalog.items.length+' listings and '+manifest.photos.length+' indexed seller images.');
