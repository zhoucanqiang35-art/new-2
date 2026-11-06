import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {parse,serialize} from 'parse5';
import vm from 'node:vm';
import path from 'node:path';
const langs=['en','de','fr','es','it','pt','nl','pl','sv'];
const routes=['','discover','categories','shipping','articles','faq'];
const context={window:{}};vm.runInNewContext(await readFile('public/shipping-i18n.js','utf8'),context);
const locales=context.window.shippingLocales;
const app=await readFile('public/app.js','utf8');const appContext={};
vm.runInNewContext(app.slice(0,app.indexOf('const keys='))+';globalThis.terms=terms',appContext);
const termKeys=['Home','Discover','Categories','Shipping','SEO Articles','Register','Shoes','Hoodies','T-Shirts','Jackets','Pants','Headwear','Jerseys','Accessories','Electronics','All categories','Latest','Previous','Next'];
for(const lang of langs.filter(l=>l!=='en')){termKeys.forEach((k,i)=>locales[lang][k] ||= appContext.terms[lang][i]);locales[lang]['Explore finds'] ||= locales[lang]['article-finds'];}

const routePath=(lang,route)=>`/${lang==='en'?'':lang+'/'}${route?route+'/':''}`;
const attr=(node,name)=>node.attrs?.find(a=>a.name===name)?.value;
function setAttr(node,name,value){let a=node.attrs.find(a=>a.name===name);if(a)a.value=value;else node.attrs.push({name,value})}
function walk(node,fn){fn(node);for(const n of node.childNodes||[])walk(n,fn)}
function text(node){return node.nodeName==='#text'?node.value:(node.childNodes||[]).map(text).join('')}
function setText(node,value){node.childNodes=[{nodeName:'#text',value,parentNode:node}]}
function append(head,tagName,attrs){const node={nodeName:tagName,tagName,attrs:Object.entries(attrs).map(([name,value])=>({name,value})),namespaceURI:'http://www.w3.org/1999/xhtml',childNodes:[],parentNode:head};head.childNodes.push(node)}
for(const route of routes){
 const filename=path.join('dist',route,'index.html'); const source=await readFile(filename,'utf8');
 for(const lang of langs){
  const doc=parse(source);const loc=locales[lang]||{};let head,canonical,title,description,html;
  let articles={};let faqs=[];if(lang!=='en'){articles=JSON.parse(await readFile(`public/articles-${lang}.json`,'utf8'));faqs=JSON.parse(await readFile(`public/faq-${lang}.json`,'utf8'))}
  walk(doc,n=>{if(n.tagName==='head')head=n;if(n.tagName==='html')html=n;if(n.tagName==='title')title=n;if(n.tagName==='link'&&attr(n,'rel')==='canonical')canonical=n;if(n.tagName==='meta'&&attr(n,'name')==='description')description=n});
  setAttr(html,'lang',lang);setAttr(canonical,'href',`https://pikobuyspreadsheet.nl${routePath(lang,route)}`);
  for(const code of [...langs,'x-default'])append(head,'link',{rel:'alternate',hreflang:code,href:`https://pikobuyspreadsheet.nl${routePath(code==='x-default'?'en':code,route)}`});
  if(lang!=='en'){
   walk(doc,n=>{
    const key=attr(n,'data-i'),translated=loc[key];
    if(typeof translated==='string'){
      if(['PikoBuy shipping guide','FAQ heading','Explore by category','Discover your next find'].includes(key)&&n.childNodes?.[0]?.nodeName==='#text')n.childNodes[0].value=translated;
      else setText(n,translated);
    }
    if(attr(n,'data-faq-question')!==undefined){const i=Number(attr(n,'data-faq-question'));if(faqs[i])setText(n,faqs[i][0])}
    if(attr(n,'data-faq-answer')!==undefined){const i=Number(attr(n,'data-faq-answer'));if(faqs[i])setText(n,faqs[i][1])}
    const field=attr(n,'data-article-field');if(field){let ancestor=n;while(ancestor&&!attr(ancestor,'data-article'))ancestor=ancestor.parentNode;let value=field.split('.').reduce((v,k)=>v?.[k],articles[attr(ancestor,'data-article')]);if(typeof value==='string')setText(n,value)}
    if(n.tagName==='a'){const href=attr(n,'href');if(href){const match=href.match(/^\/(?:(?:de|fr|es|it|pt|nl|pl|sv)\/)?(discover|categories|shipping|articles|faq)?\/?(\?[^#]*)?$/);if(match)setAttr(n,'href',routePath(lang,match[1]||'')+(match[2]||''));else {const article=href.match(/^\/articles\/([^/]+)\/$/);if(article)setAttr(n,'href',`/${lang}/articles/${article[1]}/`)}}}
   });
   const titleKeys={'':'home-browse-title',discover:'Discover your next find',categories:'Explore by category',shipping:'PikoBuy shipping guide',articles:'article-index-title',faq:'FAQ heading'};
   const descKeys={'':'hero',discover:'discoverintro',categories:'categoriesintro',shipping:'shippingintro',articles:'article-index-intro',faq:'FAQ intro'};
   const translatedTitle=loc[titleKeys[route]];const translatedDescription=loc[descKeys[route]];
   if(translatedTitle)setText(title,route===''?`PikoBuy Spreadsheet | ${translatedTitle}`:`${translatedTitle} | PikoBuy Spreadsheet`);
   if(translatedDescription)setAttr(description,'content',translatedDescription);
  }
  const out=path.join('dist',lang==='en'?'':lang,route,'index.html');await mkdir(path.dirname(out),{recursive:true});await writeFile(out,serialize(doc));
 }
}
console.log('Created localized core pages and reciprocal hreflang links');
