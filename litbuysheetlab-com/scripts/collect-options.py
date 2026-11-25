import asyncio,aiohttp,json,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/data/options';OUT.mkdir(parents=True,exist_ok=True)
ids=sorted({str(p['weidianId']) for p in json.loads((ROOT/'public/data/products.json').read_text()) if str(p.get('weidianId','')).isdigit()});stats={'total':len(ids),'done':0,'ready':0,'unavailable':0,'rateLimited':False,'stoppedForUpstreamFailure':False};queue=asyncio.Queue();start=time.time();lock=asyncio.Lock();last=0
for id in ids:queue.put_nowait(id)
async def run():
 global last
 async with aiohttp.ClientSession(trust_env=True,timeout=aiohttp.ClientTimeout(total=18),connector=aiohttp.TCPConnector(limit=24)) as client:
  async def worker():
   global last
   while not queue.empty() and not stats['rateLimited'] and not stats['stoppedForUpstreamFailure']:
    id=await queue.get()
    try:
     path=OUT/(id+'.json')
     if path.exists():stats['ready']+=1;continue
     async with lock:
      delay=.18-(time.monotonic()-last)
      if delay>0:await asyncio.sleep(delay)
      last=time.monotonic()
     async with client.get('https://findspreadsheet.com/api/Goods/getSkuData',params={'weidian_id':id}) as r:
      if r.status==429:stats['rateLimited']=True;continue
      if r.status!=200:raise ValueError(str(r.status))
      data=await r.json(content_type=None)
     if str(data.get('weidian_id'))!=id or not data.get('specifications',{}).get('attrs'):raise ValueError('Missing options')
     # Keep the public seller response for a reproducible build; no account/order data.
     result={k:data[k] for k in ['weidian_id','images','specifications'] if k in data};path.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')));stats['ready']+=1
    except Exception as e:
     stats['unavailable']+=1
     if stats['unavailable']>=5 and stats['ready']<stats['done']*.8:stats['stoppedForUpstreamFailure']=True
    finally:
     stats['done']+=1;queue.task_done()
     if stats['done']%50==0:print(json.dumps({**stats,'seconds':round(time.time()-start)}),flush=True);(ROOT/'option-progress.json').write_text(json.dumps(stats))
  await asyncio.gather(*(worker() for _ in range(24)))
 (ROOT/'option-progress.json').write_text(json.dumps(stats));print('FINAL',json.dumps(stats),flush=True)
asyncio.run(run())
