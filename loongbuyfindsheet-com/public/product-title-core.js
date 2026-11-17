const brands=["Polo Ralph Lauren","The North Face","Louis Vuitton","Chrome Hearts","Chrome Heart","Stone Island","Palm Angels","Gallery Dept","Fear Of God","New Balance","Off-White","Off White","Air Jordan","Air Force","Air Max","Ralph Lauren","Real Madrid","Manchester United","Paris Saint Germain","Mihara Yasuhiro","Maison Margiela","Comme des Garcons","Vivienne Westwood","Enfants Riches Deprimes","Golden Goose","Alexander McQueen","Christian Louboutin","Calvin Klein","Tommy Hilfiger","Dolce Gabbana","Dolce & Gabbana","Van Cleef","Audemars Piguet","Patek Philippe","Richard Mille","Jaeger-LeCoultre","Nike","Adidas","Jordan","Dior","Gucci","Burberry","Balenciaga","Amiri","Prada","Supreme","Moncler","Lacoste","Stussy","Bape","Corteiz","Chanel","Casablanca","Fendi","Versace","Goyard","Carhartt","Nocta","Saint Laurent","Saint","YSL","Essentials","Syna","Hellstar","Trapstar","Ami","Asics","Alo","Arc'teryx","Arcteryx","Lululemon","Patagonia","Timberland","Canada Goose","Rick Owens","Loewe","Miu Miu","Miumiu","Coach","Hermes","Givenchy","Valentino","Dsquared","Rhude","Vans","Converse","Puma","Reebok","Onitsuka","On Running","Ugg","Crocs","Birkenstock","Yeezy","Yeezy-style","AirPods","AirpodsAirpods","Apple","iPhone","iPad","Samsung","Sony","JBL","Bose","Dyson","Lego","Disney","Labubu","Jellycat","Rolex","Cartier","Omega","Longines","Tissot","Breitling","Hublot","Invicta","Seiko","Swarovski","Bulgari","Bvlgari","Ferragamo","Celine","Bottega Veneta","Balmain","Kenzo","Moschino","Acne Studios","Kith","Represent","Evisu","Vetements","Eric Emanuel","Hellstar","Sp5der","Ray-Ban","Oakley","Salomon","Hoka","Saucony","Skechers","LV","CP","MLB","NBA","NFL","UFC","PSG","Dunk","Gel-Kayano","Gel-NYC","Gazelle","Samba","Campus","Superstar","Vomero","Pegasus","Vapormax","Vaporfly","Shox","ZoomX","Zoom","Kayano","Bapesta","Metcon","Ultraboost","FuelCell","NMD","Blazer","Club C","Spezial","Terrascape","Sk8-Hi","Old Skool"];
brands.push(
 "Denim Tears", "Travis Scott", "Under Armour", "CP Company", "Purple Brand",
 "Loro Piana", "A Bathing Ape", "Anti Social Social Club", "Aimé Leon Dore",
 "Aime Leon Dore", "Onitsuka Tiger", "Broken Planet", "New Era", "Ice Cream",
 "Phillipp Plein", "Philipp Plein", "Hugo Boss", "Yves Saint Laurent",
 "Fear of God Essentials", "VaporMax Plus", "Yeezy Boost", "Zoom GT Cut",
 "Dior B25 Runner", "Be Right Back", "Hot Step", "Phenom Elite",
 "Le Male", "Le Beau", "Silver Mountain Water", "Green Irish Tweed",
 "Undercover Klaus", "Real Madrid", "FC Barcelona", "Los Angeles Lakers",
 "GlobalFind WWTOP", "GlobalFind", "WWTOP", "OMGBUY", "XJXPCS", "UrbanThreads",
 "Putian", "Foshan", "Balenciaga Runner", "Aventus", "Adizero", "Vlone",
 "Lanvin", "Kobe", "Maya", "KAWS", "Nuptse", "Birkin", "Marmont", "AirWair",
 "Longchamp", "Armani", "BOSS", "Numeris", "SynaWorld", "Skims", "Umbro",
 "Palace", "Rick Studios", "Diesel", "Gildan", "Hanes", "Kipling", "Tatum",
 "Bally", "Chloé", "Hermès", "Givenchy", "MCM", "Rayban", "Uptempo", "Harden",
 "Calatrava", "Submariner", "Datejust", "Daytona", "Seamaster", "Serpenti",
 "MagSafe", "USB-C", "USB", "HDMI", "Gore-Tex", "Primaloft", "PlayStation",
 "Nintendo", "Hello Kitty", "Pokémon", "Pokemon", "SpongeBob", "Astro Boy",
 "Warriors", "Yankees", "Bayern Munich", "AC Milan", "Inter Milan", "Al Nassr",
 "Union LA", "CPFM", "FOG", "TNF", "LJR", "OWF", "ZTOPX", "GODB", "GORE-TEX",
 "Gel 1130", "Gel-Kayano", "Gel-Venture", "Super-Star", "Shox TL", "Vaporwaffle"
);
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const brandRE=new RegExp('(?<![A-Za-z])(?:'+brands.sort((a,b)=>b.length-a.length).map(escape).join('|')+')(?![A-Za-z])','gi');
const categories={shoes:'footwear','hoodies-sweaters':'sweatshirts','t-shirts':'t-shirts',jackets:'jackets','pants-shorts':'pants',headwear:'headwear',accessories:'accessories',jersey:'jerseys',ShortSets:'short sets',electronics:'electronics','other-stuff':'other products'};
const endings={sho:'shoes',shos:'shoes',sne:'sneakers',jac:'jacket',pan:'pants',hoo:'hoodie',swe:'sweater',wat:'watch',padde:'padded',batc:'batch',shortsa:'shorts',sui:'suit',sungla:'sunglasses',glasse:'glasses',earp:'earphones',damag:'damaged',shortslee:'short-sleeve',blueto:'bluetooth',bluetoo:'bluetooth',distre:'distressed',reflecti:'reflective',fitne:'fitness',resistan:'resistant',premiu:'premium',technie:'technical',quallty:'quality',repai:'repair',collec:'collection',col:'collection',co:'collection',styl:'style',sty:'style',se:'set',hood:'hoodie',sw:'sweatshirt',collecti:'collection',collectio:'collection',colle:'collection',coll:'collection',collect:'collection',sweatsh:'sweatshirt',sweatshi:'sweatshirt',sweatshir:'sweatshirt',sweatshirthoodi:'sweatshirt hoodie',sweatsirt:'sweatshirt',swea:'sweatshirt',sweatpa:'sweatpants',sweatpan:'sweatpants',sweatpant:'sweatpants',hoodi:'hoodie',hooides:'hoodies',hoodiedown:'hooded down jacket',jacke:'jacket',windbrea:'windbreaker',windbre:'windbreaker',windbr:'windbreaker',sneake:'sneakers',snea:'sneakers',sneak:'sneakers',bracel:'bracelet',bracele:'bracelet',neckl:'necklace',neckla:'necklace',necklac:'necklace',backpac:'backpack',backp:'backpack',handba:'handbag',cardholde:'cardholder',watc:'watch',headpho:'headphones',headphone:'headphone',earb:'earbuds',earbu:'earbuds',earpho:'earphones',underwea:'underwear',jogg:'joggers',jogge:'joggers',trou:'trousers',trous:'trousers',slee:'sleeve',sleev:'sleeve',longsleves:'long-sleeve',longsleeve:'long-sleeve','t-shir':'t-shirt','t-shi':'t-shirt','t-sh':'t-shirt','t-s':'t-shirt',shir:'shirt',shi:'shirt',shor:'shorts',brief:'briefs',brie:'briefs',bri:'briefs',boxe:'boxer',puffe:'puffer',puff:'puffer',grafic:'graphic',graphi:'graphic',grap:'graphic',footb:'football jersey',footbal:'football',footba:'football',basketbal:'basketball',basketba:'basketball',basketb:'basketball',basebal:'baseball',baseba:'baseball',perform:'performance',windb:'windbreaker',waterpr:'waterproof',colorchang:'color-changing'};
const countryCodes={belgium:'BE',france:'FR',germany:'DE',italy:'IT',spain:'ES',portugal:'PT',brazil:'BR',argentina:'AR',japan:'JP',korea:'KR',netherlands:'NL',nigeria:'NG',australia:'AU',canada:'CA',mexico:'MX',sweden:'SE',ukraine:'UA',poland:'PL',romania:'RO',turkey:'TR',china:'CN',india:'IN',vietnam:'VN',thailand:'TH',indonesia:'ID',malaysia:'MY'};
const countryRE=new RegExp('(?<![A-Za-z])(?:'+Object.keys(countryCodes).join('|')+')(?![A-Za-z])','gi');
const countryDisplays=new Map();
const compiled=new WeakMap();
export function compileProductTerms(terms){
 if(compiled.has(terms))return compiled.get(terms);
 const keys=Object.keys(terms).filter(k=>!k.startsWith('__')).sort((a,b)=>b.length-a.length);
 const re=new RegExp('(?<![A-Za-z])(?:'+keys.map(k=>escape(k).replace(/[ -]+/g,'[ -]+')).join('|')+')(?![A-Za-z])','gi');
 const normalized=new Map(keys.map(k=>[k.replace(/[ -]+/g,' ').toLowerCase(),terms[k]]));
 const value={re,normalized};compiled.set(terms,value);return value;
}
export function translateProductTitle(original,category,locale,terms){
 if(locale==='en'||!terms)return original;
 let value=String(original||'').trim();if(!value)return value;
 value=value.replace(/&(?:amp;?|#38;?)\s*/gi,' & ').replace(/[’‘]/g,"'").replace(/\s+[-–—]$/, '');
 value=value.replace(/\b([Ww]o)?[Mm]en's\b/g,m=>m.toLowerCase().startsWith('wo')?'women':'men');
 value=value.replace(/\b(?:e\*arphone|arphone)\b/gi,'earphone').replace(/\bBluetoo?t?\b/gi,'Bluetooth');
 value=value.replace(/\b(?:hoodiepants|hoodiepantssuit|pantshoodies)\b/gi,'hoodie and pants set').replace(/\bhoodieshorts\b/gi,'hoodie and shorts set').replace(/\b(?:shirtshorts|shirtshort|jerseyshorts)\b/gi,'shirt and shorts set').replace(/\bhoodie(?:s)?sweatshirts?\b/gi,'hoodie sweatshirt').replace(/\bdownjacket\b/gi,'down jacket');
 const aliases={trouser:'trousers',suits:'suit',tracksuits:'tracksuit',track:'sports',chunky:'thick-sole',check:'checkered',sweat:category==='pants-shorts'?'sweatpants':'sweatshirt',pant:'pants',underwears:'underwear',undergarment:'underwear',sweatshirthoodie:'sweatshirt hoodie',hoodiessweatshirt:'hoodies sweatshirt',hoodiessweaters:'hoodies sweaters',tshirts:'t-shirts',longsleeve:'long-sleeve',shortsleeve:'short-sleeve',sunglass:'sunglasses',bracele:'bracelet',collecti:'collection',collectio:'collection'};
 if(category==='t-shirts')value=value.replace(/\bT-?$/i,'t-shirt');
 const protectedValues=[];const protect=m=>'\uE000'+(protectedValues.push(m)-1)+'\uE001';
 value=value.replace(/\b(?=[A-Za-z0-9._-]*\d)[A-Za-z0-9]+(?:[-._][A-Za-z0-9]+)*\b/g,protect).replace(brandRE,protect);
 if(typeof Intl.DisplayNames==='function'){
 let names=countryDisplays.get(locale);if(!names){names=new Intl.DisplayNames([locale],{type:'region'});countryDisplays.set(locale,names);}
 value=value.replace(countryRE,m=>names.of(countryCodes[m.toLowerCase()])||m);
 }
 value=value.replace(new RegExp('(?<![A-Za-z])(?:'+Object.keys(aliases).sort((a,b)=>b.length-a.length).map(escape).join('|')+')(?![A-Za-z])','gi'),m=>aliases[m.toLowerCase()]||m);
 value=value.replace(/([A-Za-z-]+)([\s.,-]*)$/,(_,word,tail)=>(endings[word.toLowerCase()]||word)+tail);
 const {re,normalized}=compileProductTerms(terms);
 value=value.replace(re,match=>normalized.get(match.replace(/[ -]+/g,' ').toLowerCase())||match);
 value=value.replace(/\uE000(\d+)\uE001/g,(_,n)=>protectedValues[Number(n)]);
 value=value.replace(/\s+/g,' ').trim();if(locale==='zh-CN')value=value.replace(/(?<=[\p{Script=Han}]) (?=[\p{Script=Han}])/gu,'');
 if(value.toLowerCase()===original.trim().toLowerCase()) {
  const categoryName=terms[categories[category]||'products']||terms.products;
  if(categoryName)value=categoryName+' · '+value;
 }
 return value;
}

export function expandCatalogTitle(product) {
 const original = product.name.trim().replace(/[’‘]/g, "'");
 const filename = product.sourcePath.split('/').at(-1);
 const suffix = '-' + product.id + '.html';
 if (!filename.endsWith(suffix)) return original;

 const slug = filename.slice(0, -suffix.length);
 const compact = text => text.toLowerCase().replace(/[^a-z0-9]/g, '');
 const titleKey = compact(original);
 const slugKey = compact(slug);
 if (titleKey.length < 15 || slugKey === titleKey || !slugKey.startsWith(titleKey)) return original;

 let index = 0;
 let count = 0;
 while (count < titleKey.length) {
  if (/[a-z0-9]/i.test(slug[index])) count++;
  index++;
 }
 const expanded = original.replace(/[\s-]+$/, '') + slug.slice(index).replaceAll('-', ' ');
 return expanded.length > 110 ? expanded.slice(0, 111).replace(/\s+\S*$/, '') : expanded;
}
