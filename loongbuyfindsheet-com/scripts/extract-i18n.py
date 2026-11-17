from pathlib import Path
from html.parser import HTMLParser
import re,json
root=Path(__file__).resolve().parents[1]
keys=set()
def add(s):
 s=re.sub(r'\s+',' ',s).strip()
 if s and re.search('[A-Za-z]',s) and not re.fullmatch(r'[\d., /$¥:+–—-]*(USD|CNY)?',s):keys.add(s)
class Strings(HTMLParser):
 def __init__(self):super().__init__();self.stack=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);skip=(self.stack[-1][1] if self.stack else False) or tag in ['script','style','noscript','code','pre'] or 'data-i18n-ignore' in a or 'data-product-title' in a
  if tag not in ['img','meta','link','input','br','hr','source','path','circle'] :self.stack.append((tag,skip))
  if not skip:
   for attr in ['placeholder','aria-label','title']:add(a.get(attr,''))
   if tag=='meta' and (a.get('name')=='description' or a.get('property') in ['og:title','og:description']):add(a.get('content',''))
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i][0]==tag:self.stack=self.stack[:i];break
 def handle_data(self,s):
  if not self.stack or not self.stack[-1][1]:add(s)
for f in (root/'dist').rglob('*.html'):
 p=Strings();p.feed(f.read_text())
extra=['Language','Home','Spreadsheet','Image Search','Articles','Guides','FAQ','Buy It Now','Buy on LoongBuy','Close platform selector','Other purchasing platforms / 其他代购平台','Original product','Other purchasing platforms','THE SAME FIND, YOUR CHOICE OF AGENT','其他代购平台 · Open this Weidian product with another agent. Links follow FindSpreadsheet’s platform templates and may include referral parameters.','Confirm prices, service availability and order details on your selected platform.','Content could not be loaded. Please try again.','Unable to load this language. Please try again.','Loading platforms…','Open platforms on FindSpreadsheet','finds','find','visually ranked finds','Next','Previous','No matching products. Try a different name, category or item ID.','Catalog temporarily unavailable. Please try again.','Loading the catalog image index…','Comparing indexed product photos…','Choose a JPG, PNG or WebP image under 15 MB.','Image index is unavailable. Please try again.','Search complete. Results are ordered by approximate visual similarity.','Your results will appear here','Choose an image to start searching.','Product not found','Back to the spreadsheet','Product data is temporarily unavailable. Please try again.','More product photos are temporarily unavailable.','Loading product details…','Product listing photos','These are product photos, not verified QC photos.','QC photos','Live QC retrieval is not connected in this preview. Check available QC information on the original product page and review your own warehouse QC before shipping.','Historical FindSpreadsheet catalog · Prices and availability may have changed.','Confirm current pricing, options and availability on LoongBuy.','Reference conversion','Weidian item ID','FIND','articles to explore','article to explore','questions','question','min read','MIN READ','Read the QC photo guide','You selected','Shoes & sneakers','Hoodies','T-shirts','Jackets','Pants & shorts','Accessories','Headwear','Electronics','Short sets','Jerseys','Other finds','WEIDIAN','SPREADSHEET','IMAGE SEARCH','QC GUIDE','GETTING STARTED','SHIPPING','QC & WAREHOUSE','DISCOVERY','COMPARISONS']
for s in extra:add(s)
(root/'data/i18n/source.json').write_text(json.dumps(sorted(keys),ensure_ascii=False,indent=2))
langs=json.loads((root/'src/languages.json').read_text());reuse=Path('/workspace/sites/usfansfindsheet/public/i18n');coverage={}
for lang in langs:
 code=lang['code'];existing=root/'public/i18n'/(code+'.json');d=json.loads(existing.read_text()) if existing.exists() else {}
 if code=='en':d.update({k:k for k in keys})
 else:
  old=json.loads((reuse/(code+'.json')).read_text())
  for k,v in old.items():
   k=re.sub(r'USFans|USFANS','LoongBuy',k);v=re.sub(r'USFans|USFANS','LoongBuy',v)
   if k in keys and k not in d:d[k]=v
 (root/'public/i18n'/(code+'.json')).write_text(json.dumps(d,ensure_ascii=False,indent=2))
 coverage[code]=len(d)
print('source keys',len(keys),'English characters',sum(map(len,keys)),'reused',coverage)
