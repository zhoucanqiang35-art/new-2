import asyncio,aiohttp,json,base64,hashlib,time,io,os
from pathlib import Path
from PIL import Image,ImageOps
snapshot=json.load(open('data/catalog-snapshot.json'));products=[p for v in snapshot['pages'].values() for p in v['products']];items={p['id']:p for p in products};entries={}
def add(id,url):
 if url.startswith('/'):url='https://findspreadsheet.com'+url
 if url.startswith('https://'):entries.setdefault(url,[]).append(id)
for p in products:add(p['id'],p['image'])
for id,d in json.load(open('data/product-details.json')).items():
 for u in d.get('images',[]):add(id,u)
ids={p.get('productId'):p['id'] for p in products if p.get('productId')}
for key,d in json.load(open('data/usfans-purchase-images.json')).items():
 id=ids.get(key.split(':')[-1])
 if id:
  for u in d.get('images',[])+d.get('descriptionImages',[]):add(id,u)
progress={'ok':0,'fail':0,'cached':0};errors={};started=time.time()
def descriptor(raw):
 im=ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert('RGBA');back=Image.new('RGBA',im.size,'white');back.alpha_composite(im);im=ImageOps.pad(back.convert('RGB'),(64,64),method=Image.Resampling.BILINEAR,color='white');gray=list(im.convert('L').resize((8,8),Image.Resampling.BILINEAR).getdata());small=list(im.resize((4,4),Image.Resampling.BILINEAR).getdata());pixels=[c for p in small for c in p];return base64.b64encode(bytes(gray+pixels)).decode()
async def main():
 connector=aiohttp.TCPConnector(limit=20,ttl_dns_cache=300)
 async with aiohttp.ClientSession(connector=connector,trust_env=True,timeout=aiohttp.ClientTimeout(total=25)) as session:
  sem=asyncio.Semaphore(8)
  async def one(url,ids):
   path=Path('data/image-index-parts')/(hashlib.sha256(url.encode()).hexdigest()+'.json')
   if path.exists():progress['cached']+=1;return
   async with sem:
    last_error=None
    for attempt in range(2):
     try:
      request_url=url
      if attempt and isinstance(last_error,TimeoutError) and 'geilicdn.com/' in url:request_url=url.split('?')[0]+'?w=100&h=100'
      async with session.get(request_url) as r:
       if r.status==429:raise RuntimeError('Server rate limit')
       if r.status!=200:raise RuntimeError('HTTP '+str(r.status))
       raw=await r.read()
      v=await asyncio.to_thread(descriptor,raw);path.write_text(json.dumps([list(dict.fromkeys(ids)),v]));progress['ok']+=1
      break
     except Exception as e:
      last_error=e
      if attempt==1:
       progress['fail']+=1;key=type(e).__name__+': '+str(e)[:180];errors[key]=errors.get(key,0)+1
       if progress['fail']<=8:print('IMAGE_ERROR',url,key,flush=True)
    if (progress['ok']+progress['fail'])%100==0:print(json.dumps({**progress,'total':len(entries),'seconds':round(time.time()-started)}),flush=True)
  await asyncio.gather(*(one(u,ids) for u,ids in entries.items()))
 output=[];covered=set()
 for url,ids in entries.items():
  path=Path('data/image-index-parts')/(hashlib.sha256(url.encode()).hexdigest()+'.json')
  if path.exists():
   v=json.loads(path.read_text());output.append([list(dict.fromkeys(ids)),v[1]]);covered.update(ids)
 result={'version':1,'updated':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'products':len(products),'coveredProducts':len(covered),'indexedImages':len(output),'totalImages':len(entries),'entries':output}
 Path('public/image-index.json').write_text(json.dumps(result,separators=(',',':')));print(json.dumps({k:v for k,v in result.items() if k!='entries'}),flush=True);print('ERRORS',json.dumps(errors),flush=True)
asyncio.run(main())
