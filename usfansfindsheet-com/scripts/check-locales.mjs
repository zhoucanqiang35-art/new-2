import fs from 'node:fs';
import assert from 'node:assert/strict';
const languages=JSON.parse(fs.readFileSync('src/languages.json'));
const source=[...JSON.parse(fs.readFileSync('data/i18n/source-strings.json')),...JSON.parse(fs.readFileSync('data/i18n/supplement-strings.json')),...JSON.parse(fs.readFileSync('data/i18n/dynamic-extras.json')).en,...JSON.parse(fs.readFileSync('data/i18n/currency-strings.json')),...JSON.parse(fs.readFileSync('data/i18n/image-search-strings.json'))];
assert.equal(languages.length,23);
assert.equal(new Set(languages.map(l=>l.code)).size,23);
for(const language of languages){
 const file='public/i18n/'+language.code+'.json';
 const dictionary=JSON.parse(fs.readFileSync(file));
 for(const key of source)assert.ok(typeof dictionary[key]==='string'&&dictionary[key].trim().length>0,language.code+': '+key);
 assert.equal(Object.keys(dictionary).length,source.length,language.code+' dictionary count');
 if(language.code!=='en')for(const key of ['How to buy','Search all products','Good finds.','What are USFans QC photos?'])assert.notEqual(dictionary[key],key,language.code+': untranslated '+key);
}
console.log('PASS: 23 languages, '+source.length+' nonempty translations each, key page/navigation samples translated.');
