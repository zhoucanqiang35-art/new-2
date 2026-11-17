import json,subprocess,re,html,concurrent.futures,datetime
catalog=json.load(open('data/catalog-snapshot.json'));details=json.load(open('data/product-details.json'));items={p['id']:p for v in catalog['pages'].values() for p in v['products']};output={}
def api(endpoint,params):
 cmd=['curl','-fsSG','--max-time','25','https://usfans.com/api/goods/'+endpoint,'-H','Language: en','-H','Currency: USD']
 for k,v in params.items():cmd+=['--data-urlencode',k+'='+str(v)]
 try:
  x=json.loads(subprocess.run(cmd,capture_output=True).stdout);return x['data'] if x.get('code')==200 else None
 except:return None
def run(id):
 p=items[id];url=details[id].get('usfans');m=re.search(r'/product/(\d+)/(\d+)',url or '');channel,goodsId=m.groups() if m else ('3',p.get('productId'))
 if not goodsId:return
 info=api('info',dict(channel=channel,goodsId=goodsId));qc=api('estimate-info',dict(goodsId=goodsId))
 if not info:return
 desc=html.unescape(info.get('description') or '');photos=list(dict.fromkeys(re.findall(r'<img[^>]+src=[\"\x27]([^\"\x27]+)',desc)))
 prices=[float(s.get('convertedDiscountPrice') or s.get('convertedPrice') or 0) for s in info.get('skuList',[]) if s.get('stock') != 0];prices=[p for p in prices if p>0]
 if not prices and float(info.get('convertedPrice') or 0)>0:prices=[float(info['convertedPrice'])]
 output[channel+':'+goodsId]=dict(usdMin=min(prices) if prices else None,usdMax=max(prices) if prices else None,images=info.get('images') or [],descriptionImages=photos,qcImages=(qc or {}).get('qcImages') or [],qcAvailable=qc is not None,hasWarehouseOrder=(qc or {}).get('hasWarehouseOrder'),updated=datetime.datetime.now(datetime.timezone.utc).isoformat())
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(run,details))
json.dump(output,open('data/usfans-purchase-images.json','w'));print('USFans verified snapshots',len(output),'with QC',sum(bool(v['qcImages']) for v in output.values()),flush=True)
