import asyncio,aiohttp,json,io,time,hashlib,base64,os
from pathlib import Path
from PIL import Image,ImageOps
from collections import defaultdict
ROOT=Path(__file__).resolve().parents[1];CACHE=ROOT/'.cache/features';CACHE.mkdir(parents=True,exist_ok=True);OUT=ROOT/'public/search-index';PRODUCTS=json.loads((ROOT/'public/data/products.json').read_text());PIDS={str(p['id']) for p in PRODUCTS};SELLERS=defaultdict(set)
for p in PRODUCTS:SELLERS[str(p.get('weidianId'))].add(str(p['id']))
BASE={};manifest=json.loads((OUT/'manifest.json').read_text())
for name in manifest['shards']:
 if 'images-' not in name:continue
 for row in json.loads((ROOT/'public'/name.lstrip('/')).read_text()):
  if any(str(i) in PIDS for i in row[0]):BASE[row[2]]=row
ASSETS=defaultdict(set);PAGES={};checked=set();failed={};downloaded=0;start=time.time();cooldown={};stop=ROOT/'.cache/options-finished';stop.parent.mkdir(exist_ok=True)
def add(url,ids):
 if isinstance(url,str) and url.startswith('https://'):ASSETS[url].update(ids)
def scan():
 galleries=json.loads((ROOT/'public/data/galleries.json').read_text());purchase=json.loads((ROOT/'public/data/purchase-galleries.json').read_text())
 for p in PRODUCTS:
  for u in [p['image'],*galleries.get(p['id'],[]),*purchase.get(str(p.get('weidianId')),[])]:add(u,{str(p['id'])})
 for file in (ROOT/'public/data/options').glob('*.json'):
  if file.name in checked:continue
  try:d=json.loads(file.read_text())
  except:continue
  checked.add(file.name);ids=SELLERS.get(str(d.get('weidian_id')),set())
  for u in d.get('images',[]):add(u,ids)
  for group in d.get('specifications',{}).get('attrs',[]):
   for option in group.get('attr_values',[]):add(option.get('img'),ids)
  # SKU-level photos sometimes do not appear in the colour attribute.
  for sku in d.get('specifications',{}).get('skus',{}).values():add(sku.get('img'),ids)
def feature(data):
 image=ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGBA');bg=Image.new('RGBA',image.size,'white');bg.alpha_composite(image);small=ImageOps.pad(bg.convert('RGB'),(64,64),method=Image.Resampling.BILINEAR,color='white');values=list(small.convert('L').resize((8,8),Image.Resampling.BILINEAR).getdata())+[c for p in small.resize((4,4),Image.Resampling.BILINEAR).getdata() for c in p];alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';return ''.join(alphabet[n>>2] for n in values)
def cachefile(u):return CACHE/(hashlib.sha256(u.encode()).hexdigest()+'.json')
async def main():
 global downloaded
 queued=set();done=set(BASE);queue=asyncio.Queue();sem=asyncio.Semaphore(18);host_sem=defaultdict(lambda:asyncio.Semaphore(12));host_sem['findspreadsheet.com']=asyncio.Semaphore(3)
 async with aiohttp.ClientSession(trust_env=True,timeout=aiohttp.ClientTimeout(total=20),connector=aiohttp.TCPConnector(limit=18)) as client:
  async def worker():
   global downloaded
   while True:
    u=await queue.get()
    try:
     if cachefile(u).exists():done.add(u);continue
     host=aiohttp.client_reqrep.URL(u).host
     if cooldown.get(host,0)>time.time():failed[u]='HTTP 429 cooldown';continue
     async with host_sem[host]:
      params={'w':'128','h':'128'} if host and host.endswith('geilicdn.com') else None
      async with client.get(u,params=params) as response:
       if response.status==429:cooldown[host]=time.time()+max(180,int(response.headers.get('Retry-After','180')));raise ValueError('HTTP 429')
       if response.status!=200:raise ValueError('HTTP '+str(response.status))
       raw=await response.read()
       if len(raw)>12*1024*1024:raise ValueError('Oversize image')
      value=await asyncio.to_thread(feature,raw);cachefile(u).write_text(json.dumps(value));done.add(u);downloaded+=len(raw)
    except Exception as e:failed[u]=str(e)[:100]
    finally:queue.task_done()
  workers=[asyncio.create_task(worker()) for _ in range(18)];last=0;lastlog=0
  while True:
   scan()
   for u in ASSETS:
    if u not in queued and u not in done:queued.add(u);queue.put_nowait(u)
   progress={'knownImages':len(ASSETS),'indexedKnownImages':sum(u in done for u in ASSETS),'newIndexed':len(done)-len(BASE),'pending':queue.qsize(),'failed':len(failed),'optionRecords':len(checked),'seconds':round(time.time()-start)}
   (ROOT/'image-progress.json').write_text(json.dumps(progress))
   if time.time()-lastlog>20:print(json.dumps(progress),flush=True);lastlog=time.time()
   if stop.exists() and queue.empty():await queue.join();scan();break
   await asyncio.sleep(5)
  for worker in workers:worker.cancel()
  await asyncio.gather(*workers,return_exceptions=True)
 rows=[]
 for u,ids in ASSETS.items():
  if u in BASE:continue
  if cachefile(u).exists():rows.append([sorted(ids),json.loads(cachefile(u).read_text()),u,'product'])
 # Include every local raster content/logo/tutorial image, mapped to its real page.
 for p in (ROOT/'public').rglob('*'):
  if p.suffix.lower() not in ['.png','.jpg','.jpeg','.webp','.ico']:continue
  rel='/'+str(p.relative_to(ROOT/'public'));page='/guide/' if p.name.startswith('guide-') else '/';key='page:'+rel;PAGES[key]={'title':'Litbuy shopping guide' if page=='/guide/' else 'Litbuy Sheet Lab','href':page,'image':rel}
  try:rows.append([[key],feature(p.read_bytes()),rel,'page'])
  except:pass
 shards=[s for s in manifest['shards'] if 'images-' in s]
 for i in range(0,len(rows),3000):
  name='expanded-'+str(i//3000)+'.json';(OUT/name).write_text(json.dumps(rows[i:i+3000],ensure_ascii=False,separators=(',',':')));shards.append('/search-index/'+name)
 coverage={**progress,'pending':0,'indexedKnownImages':sum(u in done for u in ASSETS),'unavailableImages':len([u for u in ASSETS if u not in done]),'staticImages':len(PAGES),'totalSearchImages':len(BASE)+len(rows),'updated':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())};(OUT/'manifest.json').write_text(json.dumps({'version':3,'format':'q6-112','shards':shards,'pages':PAGES,'coverage':coverage},ensure_ascii=False,separators=(',',':')));(ROOT/'src/data/image-coverage.json').write_text(json.dumps(coverage));(ROOT/'image-unavailable.json').write_text(json.dumps({u:failed.get(u,'Unavailable') for u in ASSETS if u not in done},ensure_ascii=False));print('FINAL',json.dumps(coverage),flush=True)
asyncio.run(main())
