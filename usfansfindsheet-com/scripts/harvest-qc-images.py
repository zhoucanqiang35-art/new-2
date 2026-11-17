#!/usr/bin/env python3
"""Inventory public QC image URLs. No image downloads or account access."""
import asyncio, collections, datetime, json, pathlib, re, time
import aiohttp
ROOT=pathlib.Path(__file__).resolve().parents[1]
PARTS=ROOT/'data/qc-harvest-parts'
OUT=ROOT/'data/main-qc-image-manifest.json'

def now():return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
def write_json(path,value):
    temporary=path.with_suffix('.tmp');temporary.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n');temporary.replace(path)
def product_ids():
    catalog=json.loads((ROOT/'data/catalog-snapshot.json').read_text())
    ids={str(p.get('productId','')).strip() for page in catalog['pages'].values() for p in page['products']}
    # Previously verified mappings can contain the seven product IDs omitted from catalog.productId.
    existing=json.loads((ROOT/'data/main-qc-snapshot.json').read_text())
    ids.update(existing)
    return sorted(x for x in ids if re.fullmatch(r'\d+',x))
def normalize(data,pid):
    if str(data.get('itemId'))!=pid or data.get('platform')!='weidian':raise ValueError('QC identity mismatch')
    images=[]
    for image in data.get('images') or []:
        if not isinstance(image,dict):continue
        url=image.get('display');mime=str(image.get('mimeType') or '').lower()
        if image.get('isVideo') or mime.startswith('video/') or not isinstance(url,str) or not url.startswith('https://') or re.search(r'\.(mp4|webm|mov|m4v)(?:[?#]|$)',url,re.I):continue
        if url not in images:images.append(url)
    return {'status':str(data.get('status') or 'unknown'),'images':images,'count':len(images),'updatedAt':data.get('updatedAt'),'checkedAt':now()}

async def main():
    PARTS.mkdir(exist_ok=True)
    ids=product_ids();records={};fails={};attempts=0;rate_events=collections.deque(maxlen=20);stopped=asyncio.Event();start=time.monotonic()
    for pid in ids:
        f=PARTS/(pid+'.json')
        if f.exists():
            try:
                rec=json.loads(f.read_text())
                if rec.get('error'):continue
                records[pid]=rec
            except (OSError,ValueError):pass
    queued=[pid for pid in ids if pid not in records]
    print(json.dumps({'totalIDs':len(ids),'cached':len(records),'queued':len(queued)}),flush=True)
    def save():
        good=[r for r in records.values() if not r.get('error')]
        images=[u for r in good for u in r.get('images',[])]
        result={'records':records,'coverage':{'totalIDs':len(ids),'checkedIDs':len(good),'attemptedThisRun':attempts,'productsWithImages':sum(bool(r.get('images')) for r in good),'imageReferences':len(images),'uniqueImages':len(set(images)),'uncheckedIDs':len(ids)-len(good),'stoppedForRateLimit':stopped.is_set()},'fails':fails,'updated':now(),'source':'https://findspreadsheet.com/qcradar-qc.php?item=PRODUCT_ID'}
        write_json(OUT,result)
    queue=asyncio.Queue()
    for pid in queued:queue.put_nowait(pid)
    timeout=aiohttp.ClientTimeout(total=12)
    connector=aiohttp.TCPConnector(limit=4,limit_per_host=4,keepalive_timeout=30)
    async with aiohttp.ClientSession(connector=connector,timeout=timeout,trust_env=True,headers={'Accept':'application/json','User-Agent':'USFansFindsheet-PublicQCInventory/1.0'}) as session:
        async def worker():
            nonlocal attempts
            while not stopped.is_set():
                try:pid=queue.get_nowait()
                except asyncio.QueueEmpty:return
                attempts+=1;error=None
                for retry in range(3):
                    if stopped.is_set():break
                    try:
                        async with session.get('https://findspreadsheet.com/qcradar-qc.php',params={'item':pid}) as response:
                            if response.status==429:
                                rate_events.append(True)
                                if sum(rate_events)>=8 or len(rate_events)>=5 and all(list(rate_events)[-5:]):
                                    stopped.set();error='sustained HTTP 429; inventory paused';break
                                retry_after=response.headers.get('Retry-After','')
                                delay=min(30,max(3*(retry+1),int(retry_after) if retry_after.isdigit() else 0))
                                error='HTTP 429';await asyncio.sleep(delay);continue
                            rate_events.append(False)
                            if response.status!=200:
                                error='HTTP '+str(response.status)
                                if response.status>=500 and retry<2:await asyncio.sleep(1+retry*2);continue
                                break
                            data=await response.json(content_type=None);record=normalize(data,pid)
                            records[pid]=record;write_json(PARTS/(pid+'.json'),record);error=None;break
                    except (aiohttp.ClientError,asyncio.TimeoutError,ValueError,TypeError) as exc:
                        error=type(exc).__name__+': '+str(exc)[:150]
                        if retry<2:await asyncio.sleep(1+retry*2)
                if error:
                    fails[pid]=error
                    write_json(PARTS/(pid+'.json'),{'status':'failed','images':[],'count':0,'error':error,'checkedAt':now()})
                queue.task_done()
                completed=len(records)+len(fails)
                if completed%100==0 or stopped.is_set():
                    save();print(json.dumps({'checked':len(records),'failed':len(fails),'withImages':sum(bool(r.get('images')) for r in records.values()),'imageReferences':sum(len(r.get('images',[])) for r in records.values()),'seconds':round(time.monotonic()-start),'rateLimited':stopped.is_set()}),flush=True)
                await asyncio.sleep(.05)
        await asyncio.gather(*(worker() for _ in range(4)))
    save();print(json.dumps({'complete':not stopped.is_set(),'coverage':json.loads(OUT.read_text())['coverage'],'fails':len(fails),'seconds':round(time.monotonic()-start)}),flush=True)

if __name__=='__main__':asyncio.run(main())
