import json,hashlib,base64,io,time,shutil
from pathlib import Path
from PIL import Image,ImageOps
root=Path('.');cache=root/'data/image-index-parts';manifest=json.load(open('data/discovered-image-assets.json'));products={p['id']:p for v in json.load(open('data/catalog-snapshot.json'))['pages'].values() for p in v['products']}
manifest={u:ids for u,ids in manifest.items() if not any(x in u.lower() for x in ['not_adv.jpg','javascript:'])}
static={}
def descriptor(path):
 im=ImageOps.exif_transpose(Image.open(path)).convert('RGBA');bg=Image.new('RGBA',im.size,'white');bg.alpha_composite(im);small=ImageOps.pad(bg.convert('RGB'),(64,64),method=Image.Resampling.BILINEAR,color='white');gray=list(small.convert('L').resize((8,8),Image.Resampling.BILINEAR).getdata());rgb=[c for p in small.resize((4,4),Image.Resampling.BILINEAR).getdata() for c in p];return base64.b64encode(bytes(gray+rgb)).decode()
for path in sorted(Path('public').rglob('*')):
 if path.suffix.lower() not in ['.png','.jpg','.jpeg','.webp','.avif']:continue
 url='/'+path.relative_to('public').as_posix();stem=path.stem.split('-')[0]
 if stem in products:ids=[stem]
 else:
  id='page:'+hashlib.sha256(url.encode()).hexdigest()[:16];ids=[id]
  guide='/guide/' in url
  static[id]={'id':id,'title':'How to buy on USFans' if guide else 'USFans Findsheet home','href':'/guides/how-to-buy/' if guide else '/','image':url,'kind':'page'}
 manifest[url]=ids;key=hashlib.sha256(url.encode()).hexdigest();p=cache/(key+'.json')
 if not p.exists():p.write_text(json.dumps([ids,descriptor(path)]))
qcdata=json.load(open('data/main-qc-image-manifest.json'));source_ids={}
for p in products.values():
 if p.get('productId'):source_ids.setdefault(p['productId'],[]).append(p['id'])
qc_refs={}
from urllib.parse import urlsplit,quote
for source,record in qcdata.get('records',{}).items():
 for u in record.get('images',[]):
  if source_ids.get(source):qc_refs[u]='/api/qc-image?product='+source_ids[source][0]+'&path='+quote(urlsplit(u).path,safe='')
def packed6(encoded):
 raw=base64.b64decode(encoded);out=bytearray();acc=bits=0
 for n in raw:
  acc=(acc<<6)|(n>>2);bits+=6
  while bits>=8:
   bits-=8;out.append((acc>>bits)&255)
 return base64.b64encode(out).decode()
known_photo_ids={str(i) for ids in manifest.values() for i in ids if str(i) in products}
no_photo_ids=sorted(set(products)-known_photo_ids)
errors=json.load(open('data/image-feature-errors.json'));unavailable=[]
rows=[];missing=[];covered=set();ready_urls=set()
for url,ids in sorted(manifest.items()):
 p=cache/(hashlib.sha256(url.encode()).hexdigest()+'.json')
 if not p.exists():
  (unavailable if 'HTTP 404' in errors.get(url,{}).get('error','') else missing).append(url);continue
 try:v=json.load(p.open())[1];assert len(base64.b64decode(v))==112
 except Exception:missing.append(url);continue
 good=[str(id) for id in dict.fromkeys(ids) if str(id) in products or str(id) in static]
 if not good:continue
 ready_urls.add(url);rows.append([good,packed6(v),qc_refs.get(url,url),'qc' if url in qc_refs else 'page' if good[0] in static else 'product']);covered.update(id for id in good if id in products)
out=Path('public/image-index');out.mkdir(exist_ok=True)
shards=[]
for i in range(0,len(rows),2500):
 data=json.dumps(rows[i:i+2500],separators=(',',':'),ensure_ascii=False).encode();name='images-'+hashlib.sha256(data).hexdigest()[:16]+'.json';(out/name).write_bytes(data);shards.append({'url':'/image-index/'+name,'images':len(rows[i:i+2500]),'bytes':len(data)})
# Remove obsolete shards only in output after current snapshot has been assembled.
keep={s['url'].split('/')[-1] for s in shards}
for p in out.glob('images-*.json'):
 if p.name not in keep:p.unlink()
main=json.load(open('data/main-gallery-manifest.json'));purchase=json.load(open('data/purchase-image-manifest.json'));qc=json.load(open('data/main-qc-image-manifest.json'))
purchase['metadata']['sourceIdsReadable']=sum(record.get('status') in ('available','empty') for record in purchase['products'].values())
main_urls={url for product in main['products'].values() for url in product.get('images',[]) if 'not_adv.jpg' not in url}
main['coverage'].update({'indexedImages':len(main_urls&ready_urls),'pendingImages':len(main_urls-ready_urls),'imagesComplete':not bool(main_urls-ready_urls)})
result={'version':2,'featureFormat':'q6-112','updated':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'products':len(products),'coveredProducts':len(covered),'productsWithImages':len(known_photo_ids),'productsWithoutImages':len(no_photo_ids),'missingImageProductIds':no_photo_ids,'indexedImages':len(rows),'totalImages':len(manifest),'pendingImages':len(missing),'unavailableImages':len(unavailable),'availableImages':len(manifest)-len(unavailable),'knownImagesComplete':not missing,'shards':shards,'staticTargets':static,'coverage':{'main':main.get('coverage',{}),'purchase':purchase.get('metadata',{}),'qc':qc.get('coverage',{})},'complete':not missing and bool(main.get('coverage',{}).get('complete')) and bool(purchase.get('metadata',{}).get('complete')) and bool(qc.get('coverage',{}).get('complete'))}
# Public coverage metadata contains only counts/status, not detailed error or source-product-ID inventories.
for source,coverage in result['coverage'].items():
 result['coverage'][source]={k:v for k,v in coverage.items() if isinstance(v,(int,float,bool)) or k in ['status','stop_reason','stoppedReason','risk_blocked']}
Path('public/image-index.json').write_text(json.dumps(result,separators=(',',':'),ensure_ascii=False));Path('data/image-index-build-report.json').write_text(json.dumps({'updated':result['updated'],'indexedImages':len(rows),'totalImages':len(manifest),'pending':len(missing),'unavailable':len(unavailable),'coveredProducts':len(covered),'complete':result['complete'],'missing':missing},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['shards','staticTargets','coverage']}));print('Shards',len(shards),'website images',len(static))
