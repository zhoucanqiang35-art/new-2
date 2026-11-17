import fs from 'node:fs';
const extras=JSON.parse(fs.readFileSync('data/i18n/dynamic-extras.json'));
for(const [code,values] of Object.entries(extras)){
 const path='public/i18n/'+code+'.json';
 const dictionary=JSON.parse(fs.readFileSync(path));
 extras.en.forEach((key,i)=>dictionary[key]=values[i]);
 fs.writeFileSync(path,JSON.stringify(dictionary,null,2)+'\n');
}

const currency=JSON.parse(fs.readFileSync('data/i18n/currency-translations.json'));
for(const [code,extra] of Object.entries(currency)){const path='public/i18n/'+code+'.json';const dict=JSON.parse(fs.readFileSync(path));Object.assign(dict,extra);fs.writeFileSync(path,JSON.stringify(dict,null,2)+'\n');}

const images=JSON.parse(fs.readFileSync('data/i18n/image-search-translations.json'));for(const[code,extra]of Object.entries(images)){const p='public/i18n/'+code+'.json';const d=JSON.parse(fs.readFileSync(p));Object.assign(d,extra);fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');}
