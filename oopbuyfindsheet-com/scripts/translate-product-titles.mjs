/** Batch export product-title translations using a user-supplied LibreTranslate-compatible server.
 * Environment: TRANSLATION_ENDPOINT (HTTPS URL), TRANSLATION_API_KEY (optional),
 * TRANSLATION_LANGS (comma-separated, optional), TRANSLATION_BATCH_SIZE (default 20).
 * The script writes only complete language files and checkpoints partial work separately.
 */
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const endpoint=process.env.TRANSLATION_ENDPOINT;
if(!endpoint){console.error('Set TRANSLATION_ENDPOINT to an authorized LibreTranslate-compatible HTTPS service. No translation request was made.');process.exit(2)}
const base=new URL(endpoint);if(base.protocol!=='https:')throw Error('Translation endpoint must use HTTPS');
const allowed=new Set(['zh','de','fr','es','it','pt','nl','pl','sv']);const langs=(process.env.TRANSLATION_LANGS||[...allowed].join(',')).split(',').map(x=>x.trim());
if(!langs.length||langs.some(x=>!allowed.has(x)))throw Error('Unsupported target language');
const size=Number(process.env.TRANSLATION_BATCH_SIZE||20);if(!Number.isInteger(size)||size<1||size>50)throw Error('Batch size must be 1–50');
const data=JSON.parse(await readFile('public/data/catalog.json','utf8'));const items=data.products.filter(p=>p.name&&p.sourcePath&&/^\d{5,20}$/.test(String(p.weidianId||'')));
const names=[...new Set(items.map(p=>p.name.trim()))];const hash=createHash('sha256').update(JSON.stringify(names)).digest('hex');
const dir=resolve('translation-work');await mkdir(dir,{recursive:true});
for(const lang of langs){const checkpoint=resolve(dir,`${lang}.checkpoint.json`);let state={sourceHash:hash,translations:{}};
 try{let old=JSON.parse(await readFile(checkpoint,'utf8'));if(old.sourceHash===hash)state=old}catch(e){if(e.code!=='ENOENT')throw e}
 const pending=names.filter(n=>!state.translations[n]);console.log(`${lang}: ${names.length-pending.length}/${names.length} unique titles cached`);
 for(let i=0;i<pending.length;i+=size){const batch=pending.slice(i,i+size);let response;try{response=await fetch(new URL('/translate',base),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({q:batch,source:'en',target:lang,format:'text',...(process.env.TRANSLATION_API_KEY?{api_key:process.env.TRANSLATION_API_KEY}:{})}),signal:AbortSignal.timeout(30000)})}catch(e){throw Error(`Translation request failed for ${lang}; progress saved: ${e.message}`)}
 if(!response.ok)throw Error(`Translation server returned HTTP ${response.status} for ${lang}; progress saved`);
 let json=await response.json(),out=json.translatedText;if(!Array.isArray(out)||out.length!==batch.length||out.some(x=>typeof x!=='string'||!x.trim()))throw Error(`Unexpected response for ${lang}; no incomplete batch saved`);
 batch.forEach((source,j)=>{state.translations[source]=out[j].trim()});await writeFile(checkpoint+'.tmp',JSON.stringify(state));await rename(checkpoint+'.tmp',checkpoint);console.log(`${lang}: ${Math.min(i+size,pending.length)}/${pending.length} new titles`)
 }
 const result=Object.fromEntries(items.map(p=>[String(p.id),state.translations[p.name.trim()]]));if(Object.values(result).some(x=>!x))throw Error(`Incomplete ${lang} output`);
 let output=resolve(dir,`${lang}.complete.json`);await writeFile(output+'.tmp',JSON.stringify({sourceHash:hash,language:lang,products:result}));await rename(output+'.tmp',output);console.log(`${lang}: completed ${Object.keys(result).length} products in ${output}; review before integration`)
}
