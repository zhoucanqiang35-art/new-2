#!/usr/bin/env python3
"""Run after npm run build to collect English UI text from rendered pages."""
import json,pathlib,re,html
from html.parser import HTMLParser
ROOT=pathlib.Path(__file__).resolve().parents[1]; DATA=ROOT/'public/data'
def load(f):return json.loads((DATA/f).read_text()) if (DATA/f).exists() else {}
def save(f,x):(DATA/f).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
home=load('home-ui.json'); en={};category={};texts=set();by_text={}
class Collect(HTMLParser):
 def __init__(self):super().__init__();self.stack=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  for attr in ['placeholder','aria-label','title','alt']:
   if a.get(attr) and re.search('[a-zA-Z]',a[attr]):texts.add(a[attr])
  if tag not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.stack.append((tag,a))
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i][0]==tag:self.stack=self.stack[:i];break
 def handle_data(self,text):
  s=text.strip()
  if not s or any(t in ['script','style','option','head'] for t,a in self.stack):return
  if re.search('[a-zA-Z]',s):texts.add(s)
  for t,a in reversed(self.stack):
   if 'data-home-i18n' in a:
    k=a['data-home-i18n'];en.setdefault(k,s);by_text[s]=k;break
   if 'data-home-category' in a:category[a['data-home-category']]=s;break
for f in sorted((ROOT/'dist').rglob('*.html')):Collect().feed(f.read_text())
# Dynamic app text, accessible names and notification strings.
extra={
 'search_placeholder':'Search products, brands or styles...','image_search':'Search by image','image_processing':'Comparing indexed product photos…','image_unavailable':'Image search is temporarily unavailable.',
 'product_photos':'Product photos','product_id_label':'Product ID','buy_litbuy':'View on Litbuy ↗','other_agents':'Other shopping agents','copy_weidian':'Copy Weidian link ↗',
 'detail_disclaimer':"This is a historical preview. Price, images and availability may have changed. Confirm all details on the seller's listing.",
 'qc_photos':'QC photos','related_products':'Related products','source_gallery_note':'Photos from the FindSpreadsheet product gallery.','source_gallery_empty':'No product gallery photos are available in this export.',
 'result_products':'products','no_results':'No products found. Try a different search.','details':'View details','all_finds':'All finds'}
en.update({k:v for k,v in extra.items() if k not in en});en['categoryNames']=category
texts.update(v for v in en.values() if isinstance(v,str))
texts.update(['Price unavailable','Approximate visual similarity order across indexed photos; lower-ranked results may be unrelated.','No image search results in this session. Please search using an image again.','← Previous','Next →','Page {page} / {pages}',
 'Explore the original FindSpreadsheet product and check current listing information before you buy.','Weidian ID unavailable — purchase link cannot be verified.','More agents on FindSpreadsheet ↗','Checking QC photos from FindSpreadsheet…','View QC on FindSpreadsheet ↗','Product not found in this preview.','Return to the spreadsheet','Weidian link copied.','Copy failed.','No additional photos in this export.','Products are temporarily unavailable. Please try again later.','FindSpreadsheet product gallery','Previous product image','Next product image','Show product image {number}','Product gallery photo {number}','Choose an image under 15 MB.','Search data unavailable.','No indexed images are available.'])
# Reuse only unambiguous translations already associated with the same English text.
home['en']=en;ui=load('ui.json');ui['en']={'home':'Home','finds':'Featured finds','categories':'Categories','guide':'How it works','faq':'FAQ','search':'Search ↗','search_placeholder':'Search products, brands or styles...','all_products':'All products ↗','back_finds':'← Back to spreadsheet','next':'Next','previous':'Previous','loading':'Loading product…'}
messages=load('messages.json')
legacy=ROOT/'scripts/legacy-zh-ui.json'
if legacy.exists():
 for english,value in json.loads(legacy.read_text()).items():messages.setdefault('zh',{}).setdefault(english,value)
fixed={'Litbuy','Litbuy Sheet Lab','LITBUY SHEET LAB','FINDSPREADSHEET / 01','FindSpreadsheet ↗','SEO','© 2026 Litbuy Sheet Lab','JPG · PNG · WebP · 15 MB'}
texts.difference_update(fixed)
for lang,d in home.items():
 if lang=='en':continue
 candidates={}
 for slug,english in category.items():
  if d.get('categoryNames',{}).get(slug):candidates.setdefault(english,set()).add(d['categoryNames'][slug])
 for key,english in en.items():
  if isinstance(english,str) and isinstance(d.get(key),str):candidates.setdefault(english,set()).add(d[key])
 for key,english in ui['en'].items():
  value=ui.get(lang,{}).get(key)
  if value:candidates.setdefault(english,set()).add(value)
 for english,k in by_text.items():
  if isinstance(d.get(k),str):candidates.setdefault(english,set()).add(d[k])
 for english,choices in candidates.items():
  if len(choices)==1:messages.setdefault(lang,{}).setdefault(english,next(iter(choices)))
 for k,english in ui['en'].items():
  translated=d.get(k) or messages.get(lang,{}).get(english)
  if translated:ui.setdefault(lang,{}).setdefault(k,translated)
 for k,english in en.items():
  if isinstance(english,str) and messages.get(lang,{}).get(english):d.setdefault(k,messages[lang][english])
save('home-ui.json',home);save('ui.json',ui);save('messages.json',messages);save('translation-source.json',sorted(texts))
print('English home keys:',len(en),'UI strings:',len(texts))
