import json,re,html,subprocess,concurrent.futures,datetime
p='data/catalog-snapshot.json';d=json.load(open(p));cats=json.load(open('src/all-categories.json'))
def get(path):return subprocess.run(['curl','-fsSL','--max-time','25','--retry','1','https://findspreadsheet.com'+path],capture_output=True).stdout.decode(errors='replace')
def enrich(k):
 slug,n=k.split(':');c=next(c for c in cats if c['slug']==slug);s=get('/'+slug+'/' if n=='1' else '/'+slug+'/list_'+str(c['id'])+'_'+n+'/');attrs={}
 for tag in re.findall(r'<button\b[^>]*data-cart-add[^>]*>',s):
  a={k:html.unescape(v) for k,v in re.findall(r'([\w-]+)="([^"]*)"',tag)};attrs[a.get('data-cart-id')]=a
 for item in d['pages'][k]['products']:
  a=attrs.get(item['id'],{});item['productId']=a.get('data-cart-weidian','');item['sourcePrice']=a.get('data-cart-price','')
 return k
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 for i,k in enumerate(pool.map(enrich,list(d['pages']))):
  if i%30==0:print('Enriched',i,flush=True)
json.dump(d,open(p,'w'))
items=[p for c in cats for p in d['pages'][c['slug']+':1']['products'][:3]]
items+=d['pages']['shoes:1']['products'][:12]
items=list({p['id']:p for p in items}.values());details={}
def detail(p):
 s=get(p['source']);gallery=s.split('<!-- Right side product info -->')[0].split('<div class="product-gallery">')[-1];images=list(dict.fromkeys(re.findall(r'data-src="(/uploads/[^"]+)"',gallery)));links=[]
 for u,name in re.findall(r'<a[^>]+href="(https://[^"]+)"[^>]*class="platform-option"[^>]*>([\s\S]*?)</a>',s):
  label=re.search(r'<span>(.*?)</span>',name)
  if label:links.append({'url':html.unescape(u),'name':html.unescape(label[1]).replace(' Link','')})
 return p['id'],{'images':images,'usfans':next((l['url'] for l in links if re.match(r'https://usfans.com/product/\d+/\d+$',l['url'])) ,None),'agents':links}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 for k,v in pool.map(detail,items):details[k]=v
json.dump(details,open('data/product-details.json','w'));print('Details',len(details),'IDs',sum(bool(p.get('productId')) for v in d['pages'].values() for p in v['products']),flush=True)
