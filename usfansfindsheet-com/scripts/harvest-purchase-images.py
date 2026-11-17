#!/usr/bin/env python3
"""Inventory public USFans purchase images; resumable, bounded, no image downloads.

Only public goods/info and goods/estimate-info are queried. No session/cookies,
accounts, personal warehouse-order APIs, prices, or raw descriptions are stored.
Existing curated purchase snapshots are read as an initial public image cache.
"""
import argparse
import asyncio
from collections import Counter, deque
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import time
from urllib.parse import urlencode, urlsplit, urlunsplit
import aiohttp

ROOT=Path(__file__).resolve().parents[1]
PARTS=ROOT/'data/purchase-image-harvest-parts'
MANIFEST=ROOT/'data/purchase-image-manifest.json'
BASE='https://usfans.com/api/goods/'
HEADERS={'Accept':'application/json','Language':'en','Currency':'USD'}

def now(): return datetime.now(timezone.utc).isoformat(timespec='seconds')
def save_json(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    temp=path.with_suffix(path.suffix+'.tmp')
    temp.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
    temp.replace(path)

def urls(items):
    if not isinstance(items,list): return []
    result=[]
    for value in items:
        if not isinstance(value,str): continue
        value=unescape(value.strip())
        if value.startswith('//'): value='https:'+value
        parsed=urlsplit(value)
        if parsed.scheme not in ('https','http') or not parsed.netloc or parsed.username or parsed.password: continue
        # Preserve public source URL parameters; do not fetch URLs during harvest.
        if value not in result: result.append(value)
    return result

class Photos(HTMLParser):
    def __init__(self): super().__init__(convert_charrefs=True);self.values=[]
    def handle_starttag(self,tag,attrs):
        if tag.lower()!='img': return
        attrs=dict(attrs)
        for attr in ('src','data-src'):
            if attrs.get(attr): self.values.append(attrs[attr])

def description_images(value):
    if not isinstance(value,str): return []
    parser=Photos()
    try: parser.feed(unescape(value))
    except Exception: return []
    return urls(parser.values)

class Inventory:
    def __init__(self,args):
        self.args=args;self.started=now();self.records={};self.recent=deque(maxlen=32)
        self.stop=asyncio.Event();self.stop_reason=None;self.http_counts=Counter();self.requests=0
        self.attempted_this_run=0;self.seeded=0;self.active=0;self.last_progress=time.monotonic()
        self.api_risk_responses=0;self.previous_block=None;self.harvest_evidence=None
        if MANIFEST.exists():
            try:
                previous_metadata=json.loads(MANIFEST.read_text()).get('metadata',{})
                self.previous_block=previous_metadata.get('stoppedReason')
                self.harvest_evidence=previous_metadata.get('harvestEvidence')
            except (OSError,ValueError):pass
        snapshot=json.loads((ROOT/'data/catalog-snapshot.json').read_text())
        products=[p for page in snapshot['pages'].values() for p in page['products']]
        self.catalog={str(p['id']):p for p in products}
        self.source_products={};self.no_source=[];self.invalid_sources={}
        for p in self.catalog.values():
            product_id=str(p.get('productId') or '').strip()
            if re.fullmatch(r'\d+',product_id): self.source_products.setdefault('3:'+product_id,[]).append(str(p['id']))
            elif not product_id:self.no_source.append(str(p['id']))
            else:self.invalid_sources[str(p['id'])]=product_id
        self.keys=sorted(self.source_products,key=lambda k:int(k.split(':')[1]))
        self.catalog_updated=snapshot.get('updated')
        PARTS.mkdir(parents=True,exist_ok=True)
        for k in self.keys:
            file=PARTS/(k.replace(':','-')+'.json')
            if file.exists():
                try:
                    record=json.loads(file.read_text())
                    if record.get('sourceId')==k and (not args.retry_unavailable or record.get('status') not in ('unavailable','partial')):
                        self.records[k]=record
                except (OSError,ValueError): pass
        curated=json.loads((ROOT/'data/usfans-purchase-images.json').read_text())
        for k,v in curated.items():
            if k not in self.source_products or k in self.records:continue
            images=urls(v.get('images'));desc=urls(v.get('descriptionImages'));qc=urls(v.get('qcImages'))
            rec={'sourceId':k,'channel':'3','productId':k.split(':')[1],
                'images':images,'descriptionImages':desc,'qcImages':qc,
                'status':'available' if images or desc or qc else 'empty',
                'infoStatus':'cached','qcStatus':'available' if qc else ('empty' if v.get('qcAvailable') else 'unavailable'),
                'provenance':'existing_public_purchase_snapshot','checkedAt':v.get('updated'),
                'endpointErrors':[]}
            self.records[k]=rec;self.seeded+=1;save_json(PARTS/(k.replace(':','-')+'.json'),rec)
        self.loaded=len(self.records)

    def note_http(self,status):
        self.http_counts[str(status)]+=1;self.recent.append(status);self.requests+=1
        # Sustained rate limits stop the inventory rather than increasing traffic
        # or trying alternative domains/endpoints.
        if len(self.recent)>=16 and sum(s==429 for s in self.recent)>=12 and not any(s==200 for s in list(self.recent)[-12:]):
            self.stop_reason='Sustained HTTP 429 from verified public USFans endpoints'
            self.stop.set()

    async def api(self,session,endpoint,params):
        address=BASE+endpoint+'?'+urlencode(params)
        last=None
        for attempt in range(3):
            if self.stop.is_set():return None,{'endpoint':endpoint,'kind':'stopped','reason':self.stop_reason}
            try:
                async with session.get(address,headers=HEADERS,allow_redirects=False) as response:
                    self.note_http(response.status)
                    if response.status==429:
                        last={'endpoint':endpoint,'kind':'http','status':429}
                        retry=response.headers.get('Retry-After','')
                        wait=min(30,max(2, int(retry) if retry.isdigit() else 2*(2**attempt)))
                        await asyncio.sleep(wait)
                        continue
                    if response.status in (500,502,503,504):
                        last={'endpoint':endpoint,'kind':'http','status':response.status}
                        if attempt<2:await asyncio.sleep(1+attempt);continue
                        return None,last
                    if response.status!=200:return None,{'endpoint':endpoint,'kind':'http','status':response.status}
                    try:payload=await response.json(content_type=None)
                    except (ValueError,aiohttp.ContentTypeError):return None,{'endpoint':endpoint,'kind':'invalid_json'}
                    if not isinstance(payload,dict):return None,{'endpoint':endpoint,'kind':'invalid_shape'}
                    data=payload.get('data')
                    if str(payload.get('code'))=='90000' or re.search(r'(?:risk error|too many|rate.?limit)',str(payload.get('msg') or ''),re.I):
                        self.api_risk_responses+=1
                        if self.api_risk_responses>=8:
                            self.stop_reason='Sustained public USFans API risk/rate block: HTTP 200, code 90000, search risk error'
                            self.stop.set()
                    if str(payload.get('code'))!='200' or not isinstance(data,dict):
                        return None,{'endpoint':endpoint,'kind':'api','code':payload.get('code'),'message':str(payload.get('msg') or '')[:160]}
                    return data,None
            except (aiohttp.ClientError,asyncio.TimeoutError) as exc:
                last={'endpoint':endpoint,'kind':'timeout' if isinstance(exc,asyncio.TimeoutError) else 'network','errorType':type(exc).__name__}
                if attempt<2:await asyncio.sleep(1+attempt)
            await asyncio.sleep(.05)
        return None,last or {'endpoint':endpoint,'kind':'unknown'}

    async def item(self,session,key):
        product_id=key.split(':')[1]
        info,info_error=await self.api(session,'info',{'channel':'3','goodsId':product_id})
        if info and str(info.get('goodsId') or product_id)!=product_id:
            info_error={'endpoint':'info','kind':'identity_mismatch'};info=None
        qc,qc_error=await self.api(session,'estimate-info',{'goodsId':product_id})
        images=urls(info.get('images')) if info else []
        desc=description_images(info.get('description')) if info else []
        quality=urls(qc.get('qcImages')) if qc else []
        any_images=bool(images or desc or quality)
        errors=[e for e in [info_error,qc_error] if e]
        status=('partial' if errors else 'available') if any_images else ('unavailable' if errors else 'empty')
        record={'sourceId':key,'channel':'3','productId':product_id,'images':images,'descriptionImages':desc,'qcImages':quality,
            'status':status,'infoStatus':('available' if images or desc else 'empty') if info is not None else 'unavailable',
            'qcStatus':('available' if quality else 'empty') if qc is not None else 'unavailable',
            'provenance':'public_usfans_goods_apis','checkedAt':now(),'endpointErrors':errors}
        # An interrupted job must remain resumable; don't cache a never-attempted ID.
        if errors and all(e.get('kind')=='stopped' for e in errors):return
        self.records[key]=record;self.attempted_this_run+=1
        save_json(PARTS/(key.replace(':','-')+'.json'),record)
        if self.attempted_this_run%100==0 or time.monotonic()-self.last_progress>30:
            self.write_manifest();self.progress();self.last_progress=time.monotonic()

    def metadata(self):
        states=Counter(v['status'] for v in self.records.values())
        errors=Counter(str(e.get('status') or e.get('code') or e.get('kind')) for v in self.records.values() for e in v.get('endpointErrors',[]))
        return {'schemaVersion':1,'startedAt':self.started,'updatedAt':now(),'catalogSnapshotUpdated':self.catalog_updated,
            'complete':len(self.records)==len(self.keys),'stoppedReason':self.stop_reason,'harvestEvidence':self.harvest_evidence,
            'catalogProducts':len(self.catalog),'validSourceIds':len(self.keys),'catalogProductsWithValidSourceId':sum(map(len,self.source_products.values())),
            'catalogProductsWithoutSourceId':len(self.no_source),'catalogProductsWithInvalidSourceId':len(self.invalid_sources),
            'sourceIdsAttempted':len(self.records),'sourceIdsNotAttempted':len(self.keys)-len(self.records),
            'apiRiskResponsesThisRun':self.api_risk_responses,'cachedAtStart':self.loaded,'seededFromCuratedSnapshots':self.seeded,'sourceIdsAttemptedThisRun':self.attempted_this_run,
            'statusCounts':dict(states),'endpointFailureCounts':dict(errors),'httpRequestsThisRun':self.requests,'httpStatusCountsThisRun':dict(self.http_counts),
            'sourceIdsWithCarouselImages':sum(bool(v['images']) for v in self.records.values()),
            'sourceIdsWithDescriptionImages':sum(bool(v['descriptionImages']) for v in self.records.values()),
            'sourceIdsWithPublicQcImages':sum(bool(v['qcImages']) for v in self.records.values()),
            'carouselImageReferences':sum(len(v['images']) for v in self.records.values()),
            'descriptionImageReferences':sum(len(v['descriptionImages']) for v in self.records.values()),
            'publicQcImageReferences':sum(len(v['qcImages']) for v in self.records.values()),
            'uniqueImageUrls':len({u for v in self.records.values() for field in ('images','descriptionImages','qcImages') for u in v[field]}),
            'publicEndpoints':['https://usfans.com/api/goods/info?channel=3&goodsId=ID','https://usfans.com/api/goods/estimate-info?goodsId=ID'],
            'privacy':'Public purchase listings and public QC only. No accounts, orders, personal warehouse APIs or cookies used. Image URLs inventoried, not downloaded.',
            'notes':['Empty QC is not proof that no personal warehouse photos exist.','Unavailable records record endpoint failures; missing URLs are not fabricated.','Source IDs can map to multiple catalog product records.']}

    def write_manifest(self):
        products={k:self.records.get(k,{'sourceId':k,'channel':'3','productId':k.split(':')[1],
            'images':[],'descriptionImages':[],'qcImages':[],'status':'not_attempted','infoStatus':'not_attempted','qcStatus':'not_attempted',
            'checkedAt':None,'endpointErrors':[]}) for k in self.keys}
        save_json(MANIFEST,{'metadata':self.metadata(),'products':products,'catalogProductIdsBySourceId':self.source_products,
            'catalogProductIdsWithoutSourceId':self.no_source,'invalidSourceIdsByCatalogProduct':self.invalid_sources})

    def progress(self):
        m=self.metadata();print(json.dumps({k:m[k] for k in ['updatedAt','validSourceIds','sourceIdsAttempted','sourceIdsNotAttempted','statusCounts','sourceIdsWithPublicQcImages','uniqueImageUrls','httpStatusCountsThisRun','stoppedReason']}),flush=True)

    async def run(self):
        if self.previous_block and re.search(r'(?:risk|429|rate)',self.previous_block,re.I) and not self.args.resume_after_block:
            self.stop_reason=self.previous_block;self.write_manifest();self.progress()
            print('Previous platform rate/risk block retained; no requests sent. Explicit --resume-after-block is required after the block has cleared.',flush=True)
            return self.metadata()
        pending=[k for k in self.keys if k not in self.records]
        if self.args.limit:pending=pending[:self.args.limit]
        queue=asyncio.Queue()
        for key in pending:queue.put_nowait(key)
        self.write_manifest();self.progress()
        connector=aiohttp.TCPConnector(limit=self.args.concurrency,limit_per_host=self.args.concurrency)
        timeout=aiohttp.ClientTimeout(total=15)
        async with aiohttp.ClientSession(trust_env=True,connector=connector,timeout=timeout,cookie_jar=aiohttp.DummyCookieJar()) as session:
            async def worker():
                while not queue.empty() and not self.stop.is_set():
                    try:key=queue.get_nowait()
                    except asyncio.QueueEmpty:return
                    try:await self.item(session,key)
                    finally:queue.task_done()
            try:await asyncio.gather(*(worker() for _ in range(self.args.concurrency)))
            finally:self.write_manifest();self.progress()
        return self.metadata()

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--concurrency',type=int,default=8,choices=range(1,9))
    parser.add_argument('--limit',type=int,default=0,help='Only this many uncached source IDs; 0 means all')
    parser.add_argument('--retry-unavailable',action='store_true')
    parser.add_argument('--resume-after-block',action='store_true',help='Explicitly resume a prior risk/rate-blocked run after the platform restriction has cleared')
    args=parser.parse_args()
    job=Inventory(args)
    try:asyncio.run(job.run())
    except KeyboardInterrupt:
        job.stop_reason='Interrupted by operator; resume uses cached source IDs';job.write_manifest();job.progress()
