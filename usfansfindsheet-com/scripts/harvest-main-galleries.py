#!/usr/bin/env python3
"""Harvest each public product's own gallery, with restartable per-product records.

Only product-gallery and explicitly named own-description containers before the
related-product section contribute pictures. No agent logos or related cards.
"""
import argparse,asyncio,collections,datetime,html,json,pathlib,random,re,time
from html.parser import HTMLParser
from urllib.parse import urljoin,urlsplit
import aiohttp
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE='https://findspreadsheet.com'
CACHE=ROOT/'data/gallery-harvest-parts'
OUT=ROOT/'data/main-gallery-manifest.json'

def now():return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
def save(path,value):
 path.parent.mkdir(parents=True,exist_ok=True)
 tmp=path.with_suffix(path.suffix+'.tmp');tmp.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n');tmp.replace(path)
def image_url(src):
 if not src or src.startswith(('data:','javascript:','blob:')):return None
 src=html.unescape(src.strip());u=urljoin(BASE,src)
 p=urlsplit(u)
 if p.scheme not in ('http','https'):return None
 if any(s in p.path.lower() for s in ['platform-logos','favicon','logo','icon','avatar','/public/static/common/images/not_adv.']):return None
 if not re.search(r'\.(?:jpe?g|png|webp|gif|avif|bmp)(?:$|[?#])',u,re.I):return None
 return u
class OwnImages(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.stack=[];self.gallery=[];self.description=[];self.kinds=[];self.weidian=[];self.buy=[];self.gallery_found=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);c=set(a.get('class','').split());id=a.get('id','');parent=self.stack[-1][1] if self.stack else None
  kind=parent
  if 'product-gallery' in c:kind='gallery';self.gallery_found=True
  elif c.intersection({'product-description','product-content','product-detail-content','description-content','detail-content','description-images','product-description-images'}) or id in {'product-description','product-content','description-content'}:kind='description'
  if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append((tag,kind))
  if tag=='img' and kind:
   u=image_url(a.get('data-src') or a.get('data-original') or a.get('src'))
   if u:(self.gallery if kind=='gallery' else self.description).append(u)
 def handle_endtag(self,tag):
  for n in range(len(self.stack)-1,-1,-1):
   if self.stack[n][0]==tag:self.stack=self.stack[:n];break

def parse_product(body,p):
 # Related products are a sibling of product-detail. Clip before their comment,
 # their section/class, or explicit related marker, whichever is earliest.
 start=re.search(r'<(?:div|section)\b[^>]*class=[\"\'][^\"\']*\bproduct-detail\b',body,re.I)
 if not start:raise ValueError('product-detail container missing')
 own=body[start.start():]
 ends=[m.start() for pattern in [r'<!--\s*Product list\s*-->',r'<(?:section|div)\b[^>]*class=[\"\'][^\"\']*\b(?:product-list|related-products|related-section|recommended-products)\b',r'<h2\b[^>]*>\s*Related Products'] if (m:=re.search(pattern,own,re.I))]
 if ends:own=own[:min(ends)]
 parser=OwnImages();parser.feed(own)
 gallery=list(dict.fromkeys(parser.gallery));desc=list(dict.fromkeys(parser.description));images=list(dict.fromkeys(gallery+desc))
 if not parser.gallery_found:raise ValueError('own product-gallery container missing')
 # Product's own cart button provides the source ID. Do not inspect related carts.
 ownids=re.findall(r'data-cart-weidian=[\"\'](\d+)[\"\']',own)
 weidians=re.findall(r'https?://(?:www\.)?weidian\.com/item\.html\?[^\"\'<>\s]*?itemID=(\d+)',html.unescape(own),re.I)
 confirmed=ownids[0] if ownids else weidians[0] if weidians else None
 expected=p.get('productId') or None
 if expected and confirmed and expected!=confirmed:raise ValueError('source ID mismatch: '+expected+' / '+confirmed)
 # Agent selector lies after related cards in current template; links are accepted
 # only when the visible numeric target matches the confirmed own source ID.
 own_id=confirmed or expected
 links=re.findall(r'https://(?:www\.)?usfans\.com/product/(\d+)/(\d+)',html.unescape(body),re.I)
 matches=[(platform,item) for platform,item in links if own_id and item==own_id]
 buy='https://usfans.com/product/'+matches[0][0]+'/'+matches[0][1] if matches else None
 return {'status':'ok' if images else 'source_no_images','sourceEmptyReason':None if images else 'The public product gallery contains no real image URL; only missing-image placeholders are present.','galleryComplete':True,'galleryImages':gallery,'descriptionImages':desc,'images':images,'confirmedProductId':confirmed,'weidianSource':'https://weidian.com/item.html?itemID='+confirmed if confirmed else None,'usfans':buy}

async def main(args):
 snapshot=json.loads((ROOT/'data/catalog-snapshot.json').read_text());products={p['id']:p for page in snapshot['pages'].values() for p in page['products']}
 known=json.loads((ROOT/'data/product-details.json').read_text());CACHE.mkdir(parents=True,exist_ok=True)
 records={};queue=asyncio.Queue();counts=collections.Counter();started=time.monotonic();cooldown=time.monotonic()+args.initial_delay
 next_request=0.0;rate_lock=asyncio.Lock()
 for id,p in products.items():
  path=CACHE/(id+'.json')
  if path.exists():
   try:
    r=json.loads(path.read_text())
    if r.get('sourceUrl')==urljoin(BASE,p['source']) and (r.get('status') in ('ok','source_no_images') or not args.retry_failures):records[id]=r;counts['cached']+=1;continue
   except (json.JSONDecodeError,OSError):pass
  await queue.put((id,p))
 def manifest():
  ordered={id:records[id] for id in products if id in records}
  valid_statuses={'ok','source_no_images'}
  failures={id:{'sourceUrl':r['sourceUrl'],'status':r['status'],'error':r.get('error'),'httpStatus':r.get('httpStatus')} for id,r in ordered.items() if r.get('status') not in valid_statuses}
  real={id:r for id,r in ordered.items() if r.get('status')=='ok' and r.get('images')}
  empty={id:{'sourceUrl':r['sourceUrl'],'status':r['status'],'reason':r.get('sourceEmptyReason'),'httpStatus':r.get('httpStatus'),'checkedAt':r.get('checkedAt')} for id,r in ordered.items() if r.get('status')=='source_no_images'}
  pics={u for r in real.values() for u in r['images']}
  checked=sum(r.get('status') in valid_statuses for r in ordered.values())
  value={'updated':now(),'source':'https://findspreadsheet.com','catalogUpdated':snapshot.get('updated'),'coverage':{'totalProducts':len(products),'processedProducts':len(ordered),'checkedProducts':checked,'crawledProducts':len(real),'realGalleryProducts':len(real),'emptyGalleryProducts':len(empty),'failedProducts':len(failures),'httpUnavailablePages':sum(r.get('httpStatus')!=200 for r in ordered.values()),'pendingProducts':len(products)-len(ordered),'complete':len(ordered)==len(products) and not failures,'crawledImages':sum(len(r['images']) for r in real.values()),'uniqueCrawledImages':len(pics),'multiImageProducts':sum(len(r['images'])>1 for r in real.values())},'failures':failures,'emptyGalleries':empty,'products':ordered}
  # Publication helper needs a stable tracked source snapshot while it builds.
  # Continue ignored per-product caches, but never mutate the manifest under lock.
  if not (ROOT/'data/image-publication.lock').exists():save(OUT,value)
  return value['coverage']
 print(json.dumps({'start':now(),'products':len(products),'cached':len(records),'pending':queue.qsize(),'concurrency':args.concurrency}),flush=True)
 timeout=aiohttp.ClientTimeout(total=35,connect=15,sock_read=25)
 connector=aiohttp.TCPConnector(limit=args.concurrency,limit_per_host=args.concurrency,ttl_dns_cache=300)
 async with aiohttp.ClientSession(trust_env=True,connector=connector,timeout=timeout,headers={'User-Agent':'USFans-Findsheet-Public-Gallery-Indexer/1.0','Accept':'text/html'}) as session:
  async def work(worker):
   nonlocal cooldown,next_request
   while True:
    try:id,p=queue.get_nowait()
    except asyncio.QueueEmpty:return
    record={'id':id,'sourceUrl':urljoin(BASE,p['source']),'title':p['title'],'productId':p.get('productId'),'catalogCover':image_url(p.get('image')),'knownImages':[image_url(u) for u in known.get(id,{}).get('images',[]) if image_url(u)],'galleryComplete':False}
    error=None;http=None
    for attempt in range(args.attempts):
     async with rate_lock:
      scheduled=max(time.monotonic(),cooldown,next_request)
      next_request=scheduled+1/args.rate
     delay=max(0,scheduled-time.monotonic())
     if delay:await asyncio.sleep(delay+random.uniform(.02,.12))
     # Recheck global backoff after a queued slot wakes up.
     if cooldown>time.monotonic():await asyncio.sleep(cooldown-time.monotonic()+random.uniform(.1,1.2))
     try:
      async with session.get(record['sourceUrl'],allow_redirects=True) as response:
       http=response.status
       if http==200:
        body=await response.text(errors='replace');record.update(parse_product(body,p));record['httpStatus']=200;record['finalUrl']=str(response.url);error=None;break
       if http==429:
        wait=response.headers.get('Retry-After','');wait=float(wait) if wait.isdigit() else min(300,60*2**attempt)
        cooldown=max(cooldown,time.monotonic()+wait);error='HTTP 429 rate limited';print(json.dumps({'rateLimited':id,'retryAfterSeconds':wait,'attempt':attempt+1}),flush=True)
       elif http in [404,410]:error='HTTP '+str(http);break
       else:error='HTTP '+str(http)
     except Exception as e:error=type(e).__name__+': '+str(e)[:240]
     if attempt+1<args.attempts:await asyncio.sleep(min(35,2**attempt*2)+random.uniform(.1,.6))
    if error:
     record.update({'status':'unavailable','error':error,'httpStatus':http,'images':record['knownImages'],'galleryImages':[],'descriptionImages':[]})
    record['checkedAt']=now();save(CACHE/(id+'.json'),record);records[id]=record;counts[record['status']]+=1;queue.task_done()
    if (counts['ok']+counts['source_no_images']+counts['unavailable'])%100==0:
     coverage=manifest();print(json.dumps({'progress':coverage,'elapsedSeconds':round(time.monotonic()-started),'errorsThisRun':counts['unavailable']}),flush=True)
    await asyncio.sleep(.08)
  await asyncio.gather(*(work(i) for i in range(args.concurrency)))
 print(json.dumps({'finished':manifest(),'elapsedSeconds':round(time.monotonic()-started)}),flush=True)

if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--concurrency',type=int,default=10);ap.add_argument('--attempts',type=int,default=4);ap.add_argument('--retry-failures',action='store_true');ap.add_argument('--rate',type=float,default=3);ap.add_argument('--initial-delay',type=float,default=0);args=ap.parse_args()
 if not 1<=args.concurrency<=12:ap.error('concurrency must be 1..12')
 asyncio.run(main(args))
