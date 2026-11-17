import json,base64,hashlib
from pathlib import Path
m=json.load(open('public/image-index.json'));assert m['version']==2
products={p['id']:p for v in json.load(open('data/catalog-snapshot.json'))['pages'].values() for p in v['products']};known=set(products)|set(m['staticTargets']);count=0;covered=set();urls=set();qc=pages=0
for part in m['shards']:
 raw=Path('public'+part['url']).read_bytes();assert 'images-'+hashlib.sha256(raw).hexdigest()[:16]+'.json' in part['url'];rows=json.loads(raw);assert len(rows)==part['images']
 for ids,vector,url,kind in rows:
  assert ids and set(ids)<=known
  assert len(base64.b64decode(vector))==84
  assert url.startswith(('https://','/'))
  covered.update(set(ids)&set(products));count+=1;urls.add(url);qc+=kind=='qc';pages+=kind=='page'
assert count==m['indexedImages'];assert len(covered)==m['coveredProducts']==m['productsWithImages']==8910;assert '5627' not in covered;assert m['productsWithoutImages']==1
assert m['pendingImages']==m['totalImages']-count-m.get('unavailableImages',0)
if m['pendingImages'] or not m['coverage']['main'].get('complete'):assert m['complete'] is False
assert pages==len(m['staticTargets'])
if m.get('knownImagesComplete'):
 assert m['pendingImages']==0
 assert m['coverage']['main']['imagesComplete']
 assert m['coverage']['main']['indexedImages']==39268
print('PASS:',count,'actual images,',len(m['shards']),'immutable shards, 8910 real-photo products (1 source has no photo),',qc,'QC entries,',pages,'website images; pending coverage is explicit.')
