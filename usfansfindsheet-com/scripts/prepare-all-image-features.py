"""Incrementally build visual descriptors for all discovered public catalog images.
Run from project root. Never writes the published index. --once drains current
sources once; daemon mode rescans until --stop-file exists, then final-drains.
"""
import argparse,asyncio,aiohttp,base64,hashlib,io,json,os,re,time
from collections import defaultdict,deque
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urljoin,urlparse,parse_qsl,urlencode,urlunparse
from PIL import Image,ImageOps

ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'data/image-index-parts'; CACHE.mkdir(parents=True,exist_ok=True)
PROGRESS=ROOT/'data/image-feature-progress.json'
DISCOVERED=ROOT/'data/discovered-image-assets.json'
ERRORS=ROOT/'data/image-feature-errors.json'
PUBLICATION_LOCK=ROOT/'data/image-publication.lock'
TRACKED_LIVE_JSON={PROGRESS,DISCOVERED,ERRORS}
SNAPSHOT=json.loads((ROOT/'data/catalog-snapshot.json').read_text())
PRODUCTS={str(p['id']):p for v in SNAPSHOT['pages'].values() for p in v['products']}
SOURCE_IDS=defaultdict(set)
for id,p in PRODUCTS.items():
 if p.get('productId'):SOURCE_IDS[str(p['productId'])].add(id)
SOURCE_PATHS={p['source']:id for id,p in PRODUCTS.items()}
IMAGE_FIELDS={'images','galleryImages','descriptionImages','detailImages','knownImages','qcImages','gallery','description','photos','imageList','qc','mainQc','purchaseImages','imageUrls','image_urls'}
IMAGE_VALUES={'image','catalogCover','cover','display','thumbnail','original','imageUrl','image_url','src'}
VIDEO_RE=re.compile(r'\.(mp4|webm|m3u8|mov|m4v|avi)(?:\?|$)',re.I)
URL_RE=re.compile(r'https://[^\s<>"\']+')

def atomic_json(path,value):
 guarded=path in TRACKED_LIVE_JSON
 if guarded and PUBLICATION_LOCK.exists():return False
 temp=path.with_suffix(path.suffix+'.tmp');temp.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':')))
 if guarded and PUBLICATION_LOCK.exists():
  temp.unlink(missing_ok=True);return False
 os.replace(temp,path);return True

def descriptor(raw):
 im=ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert('RGBA')
 back=Image.new('RGBA',im.size,'white');back.alpha_composite(im)
 im=ImageOps.pad(back.convert('RGB'),(64,64),method=Image.Resampling.BILINEAR,color='white')
 gray=list(im.convert('L').resize((8,8),Image.Resampling.BILINEAR).getdata())
 small=list(im.resize((4,4),Image.Resampling.BILINEAR).getdata())
 return base64.b64encode(bytes(gray+[c for p in small for c in p])).decode()

def normalize(url):
 if not isinstance(url,str):return None
 url=url.strip().replace('&amp;','&')
 if url.startswith('/'):url=urljoin('https://findspreadsheet.com',url)
 if not url.startswith('https://') or VIDEO_RE.search(url):return None
 if urlparse(url).path.rsplit('/',1)[-1].lower()=='not_adv.jpg':return None
 return url

def image_urls(value,inside=False):
 if isinstance(value,str):
  if inside:
   # Arrays contain direct URLs. HTML description strings may contain <img> tags.
   if '<' in value:
    for found in re.findall(r'<img\b[^>]*?\b(?:src|data-src)=["\']([^"\']+)',value,re.I):
     u=normalize(found)
     if u:yield u
   else:
    u=normalize(value)
    if u:yield u
 elif isinstance(value,list):
  for item in value:yield from image_urls(item,inside)
 elif isinstance(value,dict):
  if value.get('isVideo') or str(value.get('mimeType','')).startswith('video/') or str(value.get('type','')).lower()=='video':return
  for k,v in value.items():
   if k in IMAGE_FIELDS:yield from image_urls(v,True)
   elif k in IMAGE_VALUES:yield from image_urls(v,True)
   elif inside and k in ['url','urls']:yield from image_urls(v,True)

def cache_path(url):return CACHE/(hashlib.sha256(url.encode()).hexdigest()+'.json')
def cache_valid(url):
 p=cache_path(url)
 if not p.exists():return False
 try:
  d=json.loads(p.read_text());return isinstance(d,list) and len(d)==2 and len(base64.b64decode(d[1]))==112
 except (ValueError,TypeError,IndexError):return False

class Builder:
 def __init__(self):
  self.assets=defaultdict(set);self.hosts={};self.file_versions={};self.source_files=defaultdict(set)
  self.failed={};self.retry_after={};self.rounds=defaultdict(int);self.valid=set();self.started=time.time()
  self.new_ok=0;self.downloaded_bytes=0;self.scans=0;self.active=0;self.stopping=False;self.id_dirty=set();self.discovered_dirty=True
  for id,p in PRODUCTS.items():self.add(id,p.get('image'))
  self.source_identity={};self.historical_retry_urls=set();self.historical_retries_started=set();self.host_cooldown={};self.main_request_lock=asyncio.Lock();self.last_main_request=0;self.main_interval=.1;self.main_concurrency=14;self.main_downgraded=False
  if PROGRESS.exists():
   try:
    if json.loads(PROGRESS.read_text()).get('mainDowngradedAfter429'):
     self.main_interval=1.05;self.main_concurrency=1;self.main_downgraded=True
   except (ValueError,TypeError):pass
  if ERRORS.exists():
   try:
    self.failed=json.loads(ERRORS.read_text())
    for u,e in self.failed.items():
     marker=CACHE/(hashlib.sha256(u.encode()).hexdigest()+'.historical429-retried')
     if 'HTTP 429' in e.get('error','') and not marker.exists():
      self.historical_retry_urls.add(u);self.rounds[u]=0
      try:self.retry_after[u]=max(time.time(),__import__('datetime').datetime.fromisoformat(e['lastAttempt'].replace('Z','+00:00')).timestamp()+180)
      except (ValueError,KeyError):self.retry_after[u]=time.time()
     else:
      self.rounds[u]=3 if 'HTTP 404' in e.get('error','') or marker.exists() else int(e.get('rounds',1));self.retry_after[u]=time.time()+180
   except (ValueError,TypeError):pass
 def add(self,ids,url):
  if isinstance(ids,str):ids={ids}
  ids=set(ids)&PRODUCTS.keys();u=normalize(url)
  if ids and u:
   self.hosts[u]=urlparse(u).hostname
   before=set(self.assets[u]);self.assets[u].update(ids)
   if self.assets[u]!=before:self.id_dirty.add(u)
 def resolve_ids(self,record,key=None):
  ids=set()
  if isinstance(record,dict):
   for field in ['id','catalogId','catalog_id','productCatalogId']:
    if str(record.get(field,'')) in PRODUCTS:ids.add(str(record[field]))
   for field in ['productId','confirmedProductId','itemId','goodsId','sourceProductId']:
    ids.update(SOURCE_IDS.get(str(record.get(field,'')),set()))
   for field in ['productIds','catalogIds','ids']:
    values=record.get(field,[])
    if isinstance(values,list):
     for v in values:
      if str(v) in PRODUCTS:ids.add(str(v))
      ids.update(SOURCE_IDS.get(str(v),set()))
   for field in ['source','sourceUrl','url']:
    p=urlparse(str(record.get(field,''))).path
    if p in SOURCE_PATHS:ids.add(SOURCE_PATHS[p])
  if key is not None:
   key=str(key)
   if key in PRODUCTS:ids.add(key)
   for part in re.split(r'[:_\-]',key):ids.update(SOURCE_IDS.get(part,set()))
  return ids
 def consume(self,data,key=None,inherited=None):
  ids=self.resolve_ids(data,key) or inherited or set()
  if ids:
   for u in image_urls(data):self.add(ids,u)
  if isinstance(data,dict):
   for k,v in data.items():
    # Normalize current and final manifests without assuming a particular wrapper.
    if k in IMAGE_FIELDS or k in IMAGE_VALUES:continue
    if isinstance(v,(list,dict)):self.consume(v,k,ids)
  elif isinstance(data,list):
   for item in data:
    if isinstance(item,(dict,list)):self.consume(item,None,ids)
 def scan(self):
  source_groups={
   'main':list((ROOT/'data/gallery-harvest-parts').glob('*.json')),
   'purchase':list((ROOT/'data/purchase-image-harvest-parts').glob('*.json')),
   'qc':list((ROOT/'data/qc-harvest-parts').glob('*.json')),
   'existing':[ROOT/'data/product-details.json',ROOT/'data/usfans-purchase-images.json',ROOT/'data/main-qc-snapshot.json'],
   'manifests':[ROOT/'data/main-gallery-manifest.json',ROOT/'data/purchase-image-manifest.json',ROOT/'data/main-qc-image-manifest.json']}
  changed=False
  for group,files in source_groups.items():
   for file in files:
    try:
     st=file.stat();version=(st.st_mtime_ns,st.st_size)
     if self.file_versions.get(str(file))==version:continue
     data=json.loads(file.read_text())
    except (FileNotFoundError,ValueError):continue
    self.file_versions[str(file)]=version;self.source_files[group].add(str(file))
    if group in ['main','purchase','qc']:self.consume(data,file.stem)
    else:self.consume(data)
    changed=True
  self.scans+=1
  if changed or not DISCOVERED.exists() or self.discovered_dirty:
   self.discovered_dirty=not atomic_json(DISCOVERED,{u:sorted(ids,key=int) for u,ids in self.assets.items()})
  return changed
 def update_progress(self,done=False):
  covered=set();indexed=0
  for u,ids in self.assets.items():
   if u in self.valid:
    indexed+=1;covered.update(ids);self.failed.pop(u,None)
  pending=sum(u not in self.valid and u not in self.failed for u in self.assets)
  data={'updatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'discoveredImages':len(self.assets),'indexedImages':indexed,'coveredProducts':len(covered),'totalProducts':len(PRODUCTS),'pendingImages':pending,'failedImages':len(self.failed),'newFeaturesThisRun':self.new_ok,'downloadedBytes':self.downloaded_bytes,'activeDownloads':self.active,'mainRequestsPerSecond':round(1/self.main_interval,2),'mainDowngradedAfter429':self.main_downgraded,'historical429RetryTargets':len(self.historical_retry_urls),'historical429RetriesStarted':len(self.historical_retries_started),'historical429RetriesSucceeded':sum(u in self.valid for u in self.historical_retries_started),'seconds':round(time.time()-self.started),'scanCount':self.scans,'sourceFiles':{k:len(v) for k,v in self.source_files.items()},'complete':done,'status':'finished' if done else 'draining' if self.stopping else 'watching'}
  atomic_json(PROGRESS,data);atomic_json(ERRORS,self.failed);return data
 async def process(self,url,session,sem):
  ids=self.assets[url];p=cache_path(url)
  if url not in self.valid and cache_valid(url):self.valid.add(url)
  host=urlparse(url).hostname
  if url not in self.valid and self.host_cooldown.get(host,0)>time.time():return
  if url in self.valid:
   # Existing descriptor may represent an image shared by several products.
   try:
    data=json.loads(p.read_text());all_ids=sorted(set(data[0])|ids,key=int)
    if data[0]!=all_ids:atomic_json(p,[all_ids,data[1]])
   except (OSError,ValueError):pass
   return
  if self.retry_after.get(url,0)>time.time():return
  async with sem:
   self.active+=1;last=None
   for attempt in range(1 if url in self.historical_retry_urls else 3):
    try:
     req=url
     if 'geilicdn.com/' in url and not (last and 'HTTP 404' in last):
      parsed=urlparse(url);q=dict(parse_qsl(parsed.query,keep_blank_values=True));q.update(w='128',h='128');req=urlunparse(parsed._replace(query=urlencode(q)))
     if host=='findspreadsheet.com':
      async with self.main_request_lock:
       if self.host_cooldown.get(host,0)>time.time():last=None;break
       delay=self.main_interval-(time.monotonic()-self.last_main_request)
       if delay>0:await asyncio.sleep(delay)
       self.last_main_request=time.monotonic()
     if self.host_cooldown.get(host,0)>time.time():last=None;break
     if url in self.historical_retry_urls:
      marker=CACHE/(hashlib.sha256(url.encode()).hexdigest()+'.historical429-retried')
      if marker.exists():last=None;break
      marker.write_text(time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()));self.historical_retries_started.add(url)
     async with session.get(req) as response:
      if response.status==429:
       retry_after=response.headers.get('Retry-After','')
       try:cooldown=max(180,float(retry_after))
       except ValueError:
        try:cooldown=max(180,parsedate_to_datetime(retry_after).timestamp()-time.time())
        except (ValueError,TypeError):cooldown=180
       self.host_cooldown[host]=time.time()+cooldown
       if host=='findspreadsheet.com':
        self.main_interval=1.05;self.main_concurrency=1;self.main_downgraded=True
       raise RuntimeError('HTTP 429')
      if response.status!=200:raise RuntimeError('HTTP '+str(response.status))
      if str(response.headers.get('content-type','')).startswith('video/'):raise RuntimeError('Video response excluded')
      data=await response.read()
      if len(data)>24*1024*1024:raise RuntimeError('Image exceeds 24 MiB')
     value=await asyncio.to_thread(descriptor,data)
     atomic_json(p,[sorted(ids,key=int),value]);self.valid.add(url);self.new_ok+=1;self.downloaded_bytes+=len(data);self.failed.pop(url,None);self.rounds.pop(url,None)
     last=None;break
    except Exception as e:
     last=type(e).__name__+': '+str(e)[:180]
     if 'HTTP 429' in last:break
     if 'HTTP 404' in last and ('geilicdn.com/' not in url or attempt>=1):break
     if attempt<2:await asyncio.sleep((1.5**attempt)*1.0)
   self.active-=1
   if last:
    self.rounds[url]+=1
    if 'HTTP 404' in last or url in self.historical_retry_urls:self.rounds[url]=3
    self.failed[url]={'error':last,'rounds':self.rounds[url],'productIds':sorted(ids,key=int),'lastAttempt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'historical429FinalRetryDone':url in self.historical_retries_started};self.retry_after[url]=time.time()+180
 async def run(self,once,stop_file):
  sem=asyncio.Semaphore(16);queue=asyncio.Queue();scheduled=set();worker_errors=[];checked_cache=set()
  pending_by_host=defaultdict(deque);pending_known=set()
  def retain_pending(u,priority=False):
   limit=2 if self.stopping else 3
   if u in self.valid or u in scheduled or u in pending_known or self.rounds[u]>=limit:return
   host=self.hosts[u]
   if priority:pending_by_host[host].appendleft(u)
   else:pending_by_host[host].append(u)
   pending_known.add(u)
  async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(limit=16,ttl_dns_cache=300),trust_env=True,timeout=aiohttp.ClientTimeout(total=22)) as session:
   async def worker():
    while True:
     u=await queue.get()
     try:
      await self.process(u,session,sem)
      self.id_dirty.discard(u)
     except Exception as e:worker_errors.append(type(e).__name__+': '+str(e))
     finally:
      scheduled.discard(u);queue.task_done()
      retain_pending(u)
   workers=[asyncio.create_task(worker()) for _ in range(16)]
   last_log=0;last_scan=0;last_progress=0;last_finish_check=0;idle_rounds=0
   try:
    while True:
     now=time.time();self.stopping=once or stop_file.exists()
     if now-last_scan>=8:
      self.scan();last_scan=now
      for u in list(self.assets):
       if u not in checked_cache:
        checked_cache.add(u)
        if cache_valid(u):self.valid.add(u)
       if u in self.valid and u in self.id_dirty:
        await self.process(u,session,sem);self.id_dirty.discard(u)
       retain_pending(u,u in self.historical_retry_urls and u not in self.historical_retries_started)
     # O(1) selection replaces rescanning the entire inventory on every tick.
     main_busy=sum(self.hosts[u]=='findspreadsheet.com' for u in scheduled)
     for host,candidates in pending_by_host.items():
      if len(scheduled)>=24:break
      if not candidates or self.host_cooldown.get(host,0)>now:continue
      if host=='findspreadsheet.com' and (main_busy>=self.main_concurrency or time.monotonic()-self.last_main_request<self.main_interval):continue
      inspected=0
      while candidates and inspected<32:
       u=candidates.popleft();pending_known.discard(u);inspected+=1
       if u in self.valid or u in scheduled:continue
       if self.rounds[u]>=(2 if self.stopping else 3):continue
       if self.retry_after.get(u,0)>now:
        retain_pending(u);continue
       scheduled.add(u);queue.put_nowait(u)
       if host=='findspreadsheet.com' or len(scheduled)>=24:break
     if now-last_progress>=5:
      progress=self.update_progress();last_progress=now
      if now-last_log>=15:
       print(json.dumps(progress),flush=True);last_log=now
     if self.stopping and not scheduled and queue.empty() and now-last_finish_check>=1:
      last_finish_check=now
      unfinished=any(u not in self.valid and self.rounds[u]<2 for u in self.assets)
      if unfinished:idle_rounds=0
      else:
       idle_rounds+=1
       if idle_rounds>=2:
        changed=self.scan()
        if not changed:break
        idle_rounds=0;last_scan=0
     elif scheduled:idle_rounds=0
     await asyncio.sleep(.005)
   finally:
    for w in workers:w.cancel()
    await asyncio.gather(*workers,return_exceptions=True)
   final=self.update_progress(True)
   if worker_errors:final['workerErrors']=worker_errors;atomic_json(PROGRESS,final)
   print('FINAL',json.dumps(final),flush=True)

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--once',action='store_true');parser.add_argument('--stop-file',type=Path,default=ROOT/'data/image-feature-harvest-finished.signal');args=parser.parse_args()
 asyncio.run(Builder().run(args.once,args.stop_file))
