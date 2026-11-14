import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const catalog=read('dist/catalog.json').products, titles=new Set(catalog.map(p=>p.name));
const locales=read('translations/planned-locales.json').languages.map(x=>x.code);
const common=read('translations/featured-draft.json').titles;
const fi=read('translations/fi-draft.json').productTitles;
const byLanguage={};
for(const language of locales){let count=0;for(const title of titles){const value=language==='fi'?(fi[title]||common[title]?.[language]):common[title]?.[language];if(typeof value==='string'&&value.trim())count++}byLanguage[language]={titlesWithEntries:count,titlesMissing:titles.size-count}}
console.log(JSON.stringify({totalDistinctTitles:titles.size,productRecords:catalog.length,byLanguage,note:'Entry coverage only; no linguistic review or page-text coverage is implied.'},null,2));
