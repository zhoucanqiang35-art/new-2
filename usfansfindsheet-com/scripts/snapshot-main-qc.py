import json,subprocess,re,concurrent.futures
catalog=json.load(open('data/catalog-snapshot.json'));details=json.load(open('data/product-details.json'));items={p['id']:p for v in catalog['pages'].values() for p in v['products']};out={}
def run(id):
 p=items[id];pid=p.get('productId');match=re.search(r'/product/3/(\d+)',details[id].get('usfans') or '')
 if match:pid=match[1]
 if not pid:return
 try:
  data=json.loads(subprocess.run(['curl','-fsSG','--max-time','20','https://findspreadsheet.com/qcradar-qc.php','--data-urlencode','item='+pid],capture_output=True).stdout)
  if str(data.get('itemId'))==pid:out[pid]={k:data.get(k) for k in ['status','platform','itemId','images','updatedAt']}
 except:pass
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(run,details))
json.dump(out,open('data/main-qc-snapshot.json','w'));print('Main QC checked',len(out),'with images',sum(bool(x.get('images')) for x in out.values()))
