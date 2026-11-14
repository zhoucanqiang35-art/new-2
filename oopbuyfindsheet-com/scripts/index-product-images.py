#!/usr/bin/env python3
"""Create a resumable local visual index of all catalog product images (no image uploads)."""
import asyncio, aiohttp, json, io, os, sys, time
from PIL import Image, ImageOps

CAT='public/data/catalog.json'; OUTS=['public/data/image-index-1.json','public/data/image-index-2.json']
products=json.load(open(CAT))['products']
items=[p for p in products if p.get('name') and p.get('sourcePath') and str(p.get('weidianId','')).isdigit() and 5<=len(str(p.get('weidianId','')))<=20 and p.get('image','').startswith(('https://findspreadsheet.com/','https://si.geilicdn.com/'))]
cache={}
for path in OUTS:
 try: cache.update(json.load(open(path))['images'])
 except (FileNotFoundError,ValueError,KeyError): pass
urls=list(dict.fromkeys(url for p in items for url in [p.get('image',''),*(p.get('sourceImages') or []),*(p.get('weidianImages') or []),*(p.get('qcImages') or [])] if isinstance(url,str) and url.startswith(('https://findspreadsheet.com/','https://si.geilicdn.com/')) and url not in cache))
print(f'{len(urls)} images to index',flush=True)
sem=asyncio.Semaphore(12); done=0; failures=0; pause_until=0
async def main():
 global done,failures
 timeout=aiohttp.ClientTimeout(total=30)
 async with aiohttp.ClientSession(trust_env=True,timeout=timeout,headers={'User-Agent':'FindSpreadsheet-ImageIndex/1.0'}) as session:
  async def one(url):
   global done,failures,pause_until
   async with sem:
    try:
     for attempt in range(4):
      delay=pause_until-time.monotonic()
      if delay>0: await asyncio.sleep(delay)
      async with session.get(url) as r:
       if r.status==429:
        pause_until=max(pause_until,time.monotonic()+60)
        if attempt<3: continue
       if r.status!=200: raise ValueError('HTTP '+str(r.status))
       b=await r.read()
       if len(b)>10_000_000: raise ValueError('image too large')
       break
     with Image.open(io.BytesIO(b)) as im:
      im=ImageOps.exif_transpose(im).convert('RGB').resize((8,8),Image.Resampling.BILINEAR)
      cache[url]=list(im.tobytes())
    except Exception as e:
     failures+=1
     if failures<=5: print("Failed:",type(e).__name__,str(e)[:80],flush=True)
    done+=1
    if done%1000==0 or done==len(urls):
     entries=list(cache.items()); mid=(len(entries)+1)//2
     for path,part in zip(OUTS,(entries[:mid],entries[mid:])):
      tmp=path+'.tmp';json.dump({'version':1,'images':dict(part)},open(tmp,'w'),separators=(',',':'));os.replace(tmp,path)
     print(f'{done}/{len(urls)} processed; {len(cache)} indexed; {failures} failed',flush=True)
  await asyncio.gather(*(one(u) for u in urls))
asyncio.run(main())
