import { readFileSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { officialGuide, demo, estimate, tracking, signup, guide, faq, topics, checks } from './editorial.mjs';

const output = fileURLToPath(new URL('../dist/', import.meta.url));
const siteOrigin = 'https://superbuyfindsheet.com';
const analyticsId = 'G-EZW91KL0CY';
const bingVerification = 'E34A6C20A8A058592D1DC4B20523F6CB';
const analyticsTag = `<script>
if (location.hostname === 'superbuyfindsheet.com' || location.hostname === 'www.superbuyfindsheet.com') {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', '${analyticsId}', { allow_google_signals: false, allow_ad_personalization_signals: false });
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=${analyticsId}';
  document.head.append(tag);
}
</script>`;
const sitemapUrls = [];
const read = path => JSON.parse(readFileSync(join(output, path), 'utf8'));
const records = read('data/catalog.json');
const rateTable = read('data/rates.json');
const usd = rateTable.rates.USD;
const agents = [{id:'findspreadsheet',name:'FindSpreadsheet',logo:'/agent-icons/findspreadsheet.webp'}, ...read('data/agents.json').map(agent => ({ ...agent, logo:'/agent-icons/'+agent.id+'.webp' }))];
const currencies = Object.keys(rateTable.rates).sort();
const format = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const categories = [
  ['shoes','Shoes'], ['hoodies-sweaters','Hoodies & sweaters'], ['t-shirts','T-shirts'],
  ['jackets','Jackets'], ['pants-shorts','Pants & shorts'], ['jersey','Jerseys'], ['accessories','Accessories'],
  ['headwear','Headwear'], ['ShortSets','Sets'], ['electronics','Electronics'], ['other-stuff','Other finds']
];
const languages = [
  ['en','English'],['zh-CN','简体中文'],['es','Español'],['fr','Français'],['de','Deutsch'],['it','Italiano'],
  ['pt','Português'],['nl','Nederlands'],['pl','Polski'],['ro','Română'],['sv','Svenska'],['tr','Türkçe'],
  ['ru','Русский'],['uk','Українська'],['ar','العربية'],['he','עברית'],['hi','हिन्दी'],['id','Bahasa Indonesia'],
  ['ms','Bahasa Melayu'],['ja','日本語'],['ko','한국어'],['th','ไทย'],['vi','Tiếng Việt']
];
const links = [['/','Home'], ['/spreadsheet/','Spreadsheet'], ['/guide/','Buying guide'], ['/faq/','FAQ']];
const spotlight = ['6250','8779','8573','8661','8945','8381','5977','8563'];
const local = new Set(readdirSync(join(output,'featured')).map(name => name.split('.')[0]));
const escape = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t = s => `<span data-i18n="${escape(s)}">${escape(s)}</span>`;
const icon = n => `<span data-icon="${n}" aria-hidden="true"></span>`;
const from = p => `https://weidian.com/item.html?itemID=${p.weidianId}`;
const purchase = p => 'https://www.superbuy.com/en/page/buy/?'+new URLSearchParams({nTag:'Home-search',from:'search-input',url:from(p),partnercode:'ES7pVI'});
const detail = id => `/product/?id=${id}`;
const external = (url, label, sponsored=false) => `<a class="btn ${sponsored?'primary':'outline'}" href="${escape(url)}" target="_blank" rel="${sponsored?'sponsored noopener':'noopener'}">${t(label)}</a>`;
const itemsCount = new Intl.NumberFormat('en-US').format(records.length);

function write(path, content) {
  const file=join(output,path);
  mkdirSync(dirname(file),{recursive:true});
  writeFileSync(file,content);
}
function searchForm() {
  return `<form class="search-form" action="/spreadsheet/" method="get" role="search">
    ${icon('search')}<input name="q" type="search" placeholder="Search by name, Weidian ID or link" aria-label="Search by name, Weidian ID or link" data-placeholder="Search by name, Weidian ID or link" data-label="Search by name, Weidian ID or link" maxlength="210" autocomplete="off">
    <a href="/image-search/" class="image-button" aria-label="Search by image" data-label="Search by image" title="Search by image">${icon('image')}</a><button class="btn primary" type="submit">${t('Search')}</button>
  </form>`;
}
function picker(id, label, trigger, options, extra = '') {
  return `<details class="choice-menu" id="${id}" data-picker>
    <summary aria-label="${escape(label)}" data-label="${escape(label)}">${trigger}${icon('chevron')}</summary>
    <div class="choice-panel"><div class="choice-grid" role="group" aria-label="${escape(label)}" data-label="${escape(label)}">${options}</div>${extra}</div>
  </details>`;
}
function languagePicker() {
  const options = languages.map(([code,name]) =>
    `<button type="button" data-language="${code}" aria-pressed="${code==='en'}" lang="${code}">${name}</button>`).join('');
  return picker('language-options','Language',`${icon('globe')}<span id="current-language">English</span>`,options,`<p id="language-status" role="status" hidden></p>`);
}
function currencyPicker() {
  const currencyOptions = ['USD', ...currencies.filter(code=>code!=='USD')].map(code =>
    `<button type="button" data-currency="${code}" aria-pressed="${code==='USD'}">${code}</button>`).join('');
  return picker('currency-options','Currency','<span id="current-currency">USD</span>',currencyOptions,`<p id="currency-source"></p>`);
}
function page({path,title,description,body,active='',kind='',indexable=false}) {
  const canonical = indexable ? siteOrigin + '/' + path.replace(/index\.html$/, '') : '';
  if (canonical) sitemapUrls.push(canonical);
  write(path,`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${analyticsTag}
${kind === 'home' ? `<meta name="msvalidate.01" content="${bingVerification}">` : ''}
${canonical ? `<link rel="canonical" href="${escape(canonical)}">` : '<meta name="robots" content="noindex, follow">'}
<meta name="description" content="${escape(description)}">
<meta name="theme-color" content="#f2f8fe">
<title>${escape(title)} | Superbuy Findsheet</title>
<link rel="icon" href="/assets/superbuy-favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css?v=superbuy-layout-2"><script src="/app.js?v=superbuy-layout-2" type="module"></script></head>
<body data-page="${kind}"><a class="skip" href="#main">${t('Skip to content')}</a>
<header class="header"><div class="wrap navigation">
<a class="brand" href="/" aria-label="Superbuy Findsheet"><img src="/assets/superbuy-logo.svg" width="110" height="33" alt="Superbuy"><span>Findsheet</span></a>
<nav aria-label="Main navigation">${links.map(([href,label])=>`<a href="${href}"${href===active?' aria-current="page"':''}>${t(label)}</a>`).join('')}</nav>
<div class="header-actions">
${languagePicker()}
${external(signup,'Joinsuperbuy',true)}
</div></div>
<div class="tool-strip"><div class="wrap tool-row">${searchForm()}<div class="tool-actions"><a class="saved-link btn outline" href="/saved/" aria-label="Show saved products" data-label="Show saved products">${icon('heart')} <span id="saved-count">0</span></a>${currencyPicker()}</div></div></div>
</header>
<main id="main" class="${kind==='home'?'main home-main':'wrap main'}">${body}</main>
<footer><div class="wrap footer"><a href="/"><strong>Superbuy Findsheet</strong></a><p>${t('Independent guide by FindSpreadsheet. Reference prices exclude delivery and optional services. Some links are referral links.')}</p>${kind==='home'?'':`<a href="/seo/">${t('SEO')}</a>`}</div></footer></body></html>`);
}
function heading(title, description) {
  return `<header class="page-head"><h1>${t(title)}</h1>${description?`<p>${t(description)}</p>`:''}</header>`;
}
function section(id,title,body,link='',label='') {
  return `<section class="home-section" id="${id}"><div class="section-head"><h2>${t(title)}</h2>${link?`<a class="text-link" href="${link}">${t(label)}</a>`:''}</div>${body}</section>`;
}
function categoryBar() {
  return `<div class="categories" role="group" aria-label="Product categories">${[['','All finds'],...categories].map(([key,label])=>`<button type="button" data-category="${key}" aria-pressed="${!key}">${t(label)}</button>`).join('')}</div>`;
}
function staticCard(p) {
  const photo=local.has(p.id)?'/featured/'+p.id+'.webp':p.image;
  const name=escape(p.name);
  return `<article class="card" data-rendered-product="${p.weidianId}"><div class="card-media"><a href="${detail(p.weidianId)}"><img src="${escape(photo)}" alt="${name}" width="320" height="320" loading="lazy"></a><button class="save" type="button" aria-label="Save product" data-label="Save product" data-save="${p.weidianId}" aria-pressed="false">${icon('heart')}</button></div>
    <div class="card-info"><p>${t(categories.find(([id])=>id===p.category)?.[1]??'Other finds')}</p><h3><a href="${detail(p.weidianId)}">${name}</a></h3><strong class="price">${Number(p.price)>0?format.format(Number(p.price)*usd):t('Price on listing')}</strong>
    <div class="card-actions"><a class="btn outline" href="${detail(p.weidianId)}">${t('View details')}</a>${external(purchase(p),'View on Superbuy',true)}</div></div></article>`;
}
function catalog({home=false,saved=false,productIndex=false}={}) {
  const title=saved?'Saved products':productIndex?'Product Details':'All Finds on Superbuy Spreadsheet';
  const initial=spotlight.map(id=>records.find(p=>p.id===id)).filter(Boolean);
  return `<section id="finds" data-catalog${saved?' data-saved-only':''}>
    ${categoryBar()}<div class="catalog-head"><div><${home?'h2':'h1'}>${t(title)}</${home?'h2':'h1'}><p>${saved?t('Your saved products stay in this browser.'):`<span data-listing-total="${itemsCount}">${itemsCount} Weidian listings from FindSpreadsheet</span>`}</p></div>
    <label class="sort">${t('Sort by')} <select id="sort"><option value="featured" data-i18n="Featured">Featured</option><option value="new" data-i18n="Latest added">Latest added</option><option value="asc" data-i18n="Price low to high">Price low to high</option><option value="desc" data-i18n="Price high to low">Price high to low</option></select></label></div>
    <p id="catalog-status" role="status" class="status">${saved?'':itemsCount+' finds'}</p>
    ${home?`<p class="catalog-swipe-hint">${t('Swipe for more products')}</p>
    `:''}<div class="card-grid" id="catalog-results">${saved?'':initial.map(staticCard).join('')}</div>
    <nav class="pagination" aria-label="Catalog pagination" id="catalog-pages" hidden><button class="btn outline" data-page-step="-1">${t('Previous')}</button><span id="page-status"></span><button class="btn outline" data-page-step="1">${t('Next')}</button></nav>
    <noscript><p>${t('Enable JavaScript to search and filter the full catalog.')}</p></noscript></section>`;
}
function guideContent() {
  const screenshots = `<div class="site-screens">${[['catalog','Search by Weidian ID'],['product','Open the product details']].map(([key,label])=>`<figure><a href="/guide-images/site-${key}.webp"><img src="/guide-images/site-${key}.webp" alt="${label}" data-alt="${label}" loading="lazy"></a><figcaption>${t(label)}</figcaption></figure>`).join('')}</div>`;
  const steps = guide.map(([title,zh,body,zhBody,image,alt,url],i) => {
    const stepTitle = `<span class="step-number">${i+1}</span>${t(title)}`;
    const stepBody = `<div class="guide-step"><p>${t(body)}</p>${i===0?screenshots:""}<a href="/guide-images/${image}" class="guide-photo"><img src="/guide-images/${image}" alt="${escape(alt)}" data-alt="${escape(title)}" loading="lazy"></a><a class="text-link" href="${url}" rel="noopener" target="_blank">${t('Official Superbuy reference')}</a></div>`;
    const content = `<h2 class="step-heading">${stepTitle}</h2>${stepBody}`;
    return `<article class="guide-card" id="step-${image.slice(0,2)}">${content}</article>`;
  });
  return `<div class="guide-actions">${external(demo,'Official practice demo')}${external(estimate,'Open the official shipping estimator')}${external(tracking,'Track a parcel')}</div>
  <div class="guide-grid guide-grid-expanded">${steps.join('')}</div>`;
}
function homeGuide() {
  return `<div class="home-guide-grid">${[2,3,5].map(i => {
    const [title,, , ,image,alt] = guide[i];
    return `<a class="home-guide-card" href="/guide/#step-${image.slice(0,2)}">
      <img src="/guide-images/${image}" alt="${escape(alt)}" width="160" height="92" loading="lazy">
      <strong>${t(title)}</strong></a>`;
  }).join('')}</div>`;
}
function faqContent(expanded = false) {
  return `<div class="faq-list">${faq.map(([q,zh,body])=>expanded ? `<article><h2>${t(q)}</h2><p>${t(body)}</p></article>` : `<details><summary>${t(q)}</summary><p>${t(body)}</p></details>`).join('')}</div>`;
}
function seoContent() {
  return `<div class="topic-grid">${topics.map(({title,summary,detail,queries,links})=>`<article>
    <h2>${t(title[0])}</h2>
    <p>${t(summary[0])}</p>
    <p class="topic-detail">${t(detail[0])}</p>
    <div class="topic-queries"><p>${t('Example English searches')}</p><ul lang="en">${queries.map(query=>`<li>${escape(query)}</li>`).join('')}</ul></div>
    <div class="topic-links">${links.map(([href,label])=>`<a class="text-link" href="${escape(href)}">${t(label)}</a>`).join('')}</div>
  </article>`).join('')}</div>`;
}
const homeIntro='Search Weidian finds by product name, item ID or photo. Compare reference prices, open product details and follow Superbuy’s ordering and shipping steps.';
const guidesTitle='How to buy with Superbuy';
const faqTitle='Superbuy spreadsheet FAQ';
const overviewText='Read a product page from top to bottom: confirm the exact listing in the gallery, verify the Weidian ID and variant, compare the USD reference price, and check whether historical warehouse photos are available.';
const seoTitle='Superbuy spreadsheet search guide';
const seoIntro='Start with a product name, Weidian ID or photo. Find the right catalog category, then check warehouse QC, ordering steps or shipping costs.';
const seoDescription='Find Weidian products in the Superbuy spreadsheet. Search by item ID or photo, browse shoes and jerseys, check QC photos and estimate international shipping.';
const detailIntroHeading='How to read a product detail page';
const detailIntroLead='Each result opens its own product page, where the seller gallery, listing specifications, price, warehouse photos, and agent links are tied to the same Weidian item ID.';
function productIntroContent() {
  return `<div class="intro-panel product-intro-lead">
    <a href="${detail('7405460467')}" class="product-intro-photo"><img src="/featured/7079.webp" alt="Classic Versatile Knit Sweater" width="96" height="96" loading="lazy"></a>
    <p>${t(detailIntroLead)}</p><a class="btn outline" href="${detail('7405460467')}">${t('Open example product')}</a>
  </div>`;
}

page({path:'index.html',indexable:true,title:'Superbuy Spreadsheet – Weidian Finds & QC Photos',description:'Browse Weidian finds by category, search by item ID or photo, compare reference prices and see available warehouse QC. Follow the illustrated Superbuy buying guide.',active:'/',kind:'home',body:
  `<header class="home-intro" id="home-banner"><div class="wrap home-intro-inner"><div class="home-intro-copy"><h1>${t("Superbuy Spreadsheet")}</h1><p>${t(homeIntro)}</p>
  <div class="home-actions"><a class="btn primary" href="/spreadsheet/">${t('Browse finds')}</a><a class="btn outline" href="/image-search/">${t('Search by image')}</a></div></div>
  </div></header>
  <div class="wrap home-content">${catalog({home:true})}
  ${section('product-details',detailIntroHeading,productIntroContent(),'/products/','View all products')}
  ${section('guide',guidesTitle,homeGuide(),'/guide/','Open buying guide')}
  ${section('faq',faqTitle,faqContent(),'/faq/','See all FAQs')}</div>`});
page({path:'spreadsheet/index.html',indexable:true,title:'Superbuy Finds – Weidian Product Catalog',description:'Browse Weidian sneakers, hoodies, jackets, jerseys and more. Filter by category, search by product name or Weidian ID, and compare reference prices.',active:'/spreadsheet/',kind:'catalog',body:catalog()});
page({path:'products/index.html',indexable:true,title:'Superbuy Product Details',description:overviewText,active:'/products/',kind:'catalog',body:
  `<aside class="intro-panel product-index-intro"><p>${t(overviewText)}</p><a class="btn outline" href="${detail('7405460467')}">${t('Open example product')}</a></aside>${catalog({productIndex:true})}`});
page({path:'product/index.html',title:'Superbuy Product Details',description:'Explore Weidian listing images, USD prices, category-specific checks, warehouse QC where available and Superbuy purchase links.',active:'/products/',kind:'product',body:
  `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">${t('Home')}</a><a href="/products/">${t('Product Details')}</a><span id="product-crumb"></span></nav>
  <div id="product-view"><h1>${t('Product Details')}</h1><p role="status">${t('Loading product…')}</p></div>
  <noscript><p>${t('Enable JavaScript to search and filter the full catalog.')}</p></noscript>`});
page({path:'guide/index.html',indexable:true,title:'How to Buy with Superbuy – Illustrated Guide',description:'An illustrated Superbuy guide to exact Weidian links, order options, payment, warehouse QC, parcel submission and tracking.',active:'/guide/',body:
  heading(guidesTitle,'Follow a Weidian find from this catalog to Superbuy’s official order, warehouse and shipping screens.')+guideContent()});
page({path:'faq/index.html',indexable:true,title:'Superbuy Spreadsheet FAQ',description:'Answers about Weidian IDs, reverse image search, listing photos, QC, prices, sizing, parcel shipping, and tracking.',active:'/faq/',body:heading(faqTitle,'Answers for finding products, checking photos and placing orders with Superbuy.')+faqContent(true)});
page({path:'seo/index.html',title:'Superbuy Spreadsheet Search Guide – Weidian, QC & Shipping',description:seoDescription,body:heading(seoTitle,seoIntro)+seoContent()+
  `<section class="home-section"><h2>${t('Site directory')}</h2><ul class="directory">${links.map(([href,label])=>`<li><a href="${href}">${t(label)}</a></li>`).join('')}<li><a href="/image-search/">${t('Search by image')}</a></li></ul></section>
  <section class="home-section"><h2>${t('Research references')}</h2>
    <ul class="directory">
      <li><a class="text-link" href="${officialGuide}">${t('Superbuy official buying guide')}</a></li>
      <li><a class="text-link" href="https://www.superbuy.com/en/page/guide/transportagent/">${t('Superbuy warehouse and inspection guide')}</a></li>
      <li><a class="text-link" href="${estimate}">${t('Open the official shipping estimator')}</a></li>
      <li><a class="text-link" href="https://grails.fit/superbuy-spreadsheet">GRAILS</a></li>
      <li><a class="text-link" href="https://chinagrails.com/en/spreadsheet/agent/superbuy">ChinaGrails</a></li>
      <li><a class="text-link" href="https://www.superbuyget.com/">Superbuyget</a></li>
    </ul>
  </section>`});
page({path:'image-search/index.html',title:'Superbuy Image Search – Find Similar Products',description:'Reverse image search across catalog covers, carousel photos, available QC images and guide screenshots.',kind:'image',body:
  heading('Find Similar Products','Choose a reference photo to compare against product and guide images. The file stays in your browser.')+
  `<div class="image-upload">
    <input type="file" id="image-file" accept="image/*">
    <label class="image-upload-box" for="image-file">
      ${icon('image')}<strong>${t('Choose photo')}</strong>
      <span class="upload-limit">${t('Choose an image up to 12 MB. The image stays in your browser.')}</span>
    </label>
  </div>
  <div class="image-controls"><button type="button" id="try-image" class="btn outline">${t('Try an example')}</button><span data-visual-total></span></div>
  <figure id="image-preview" hidden><img alt="Reference photo"><figcaption></figcaption></figure><p id="image-status" class="status" role="status"></p><div class="card-grid" id="image-results"></div><button type="button" id="image-more" class="btn outline" hidden>${t('Show more matches')}</button>`});
write('search/index.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Site image search</title><script>location.replace("/image-search/"+location.search)</script><a href="/image-search/">Open image search</a></html>');
page({path:'saved/index.html',title:'Saved Superbuy Finds',description:'Browse items saved in this browser.',kind:'saved',body:catalog({saved:true})});
page({path:'404.html',title:'Page not found',description:'Return to Superbuy Findsheet to browse the catalog.',body:heading('Page not found','Return to the spreadsheet to find another product.')+`<a class="btn primary" href="/spreadsheet/">${t('Browse finds')}</a>`});

const legacy=[['mesh-runner','shoes'],['heavyweight-hoodie','hoodies-sweaters'],['utility-jacket','jackets'],['straight-cargo-pants','pants-shorts'],['nylon-sling-bag','accessories'],['boxy-cotton-tee','t-shirts']];
for(const [slug,cat] of legacy) write(`products/${slug}/index.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/spreadsheet/?category=${cat}"><title>Browse real product listings</title><a href="/spreadsheet/?category=${cat}">Browse this category</a></html>`);
write('data/site-meta.json',JSON.stringify({categories,languages,spotlight,local:[...local],checks,agents,rates:rateTable.rates,ratesDate:rateTable.date,count:records.length,indexedImages:read('data/visual-photos.json').length}));
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url=>`  <url><loc>${escape(url)}</loc></url>`).join('\n')}
</urlset>
`);
write('robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`);
