"""Build the search index from verified fingerprints and images displayed by this site.

Pass a directory containing the shared image-index.json plus its shards, the
directory containing QC thumbnails and records.json from the same-item source,
and optionally a JSON map of verified additional product URL fingerprints.
The fingerprints contain visual features only. Signed source links stay out of output.
"""
import base64
import hashlib
import io
import json
import re
import shutil
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageOps

shared, qc = map(Path, sys.argv[1:3])
public = Path('public')
def read(path):
    return json.loads(path.read_text())
def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':'))+'\n')

products = {row['id']:row for row in read(public/'catalog.json') if re.fullmatch(r'\d+',str(row['weidianId']))}
galleries = read(public/'galleries.json')
by_weidian = defaultdict(list)
catalog_images = defaultdict(set)
for product_id, product in products.items():
    by_weidian[product['weidianId']].append(product_id)
    for url in [product['image'], *galleries.get(product_id,[])]:
        catalog_images[url].add(product_id)

features = {}
for index in (public/'search-index.json', shared/'image-index.json'):
    if not index.exists():
        continue
    for shard in read(index)['shards']:
        for _, descriptor, url, kind in read(index.parent/shard['url'].lstrip('/')):
            if kind == 'product' and url in catalog_images:
                features[url] = descriptor
if len(sys.argv) > 3:
    for url, descriptor in read(Path(sys.argv[3])).items():
        if url in catalog_images:
            features[url] = descriptor
if set(features) != set(catalog_images):
    raise SystemExit(f'Missing fingerprints for {len(set(catalog_images)-set(features))} catalog photos')

def fingerprint(image):
    rgba = ImageOps.exif_transpose(image).convert('RGBA')
    matte = Image.new('RGBA', rgba.size, 'white')
    matte.alpha_composite(rgba)
    small = ImageOps.pad(matte.convert('RGB'), (64,64), method=Image.Resampling.BILINEAR, color='white')
    values = list(small.convert('L').resize((8,8),Image.Resampling.BILINEAR).getdata())
    values.extend(v for pixel in small.resize((4,4),Image.Resampling.BILINEAR).getdata() for v in pixel)
    result = bytearray()
    accumulator = bits = 0
    for value in values:
        accumulator = (accumulator << 6) | (value >> 2)
        bits += 6
        if bits >= 8:
            bits -= 8
            result.append((accumulator >> bits) & 255)
    return base64.b64encode(result).decode()

def local_fingerprint(path):
    if path.suffix == '.svg':
        output = subprocess.run(['inkscape',str(path),'--export-type=png','--export-filename=-','--export-width=256'],capture_output=True,check=True).stdout
        with Image.open(io.BytesIO(output)) as image:
            return fingerprint(image)
    with Image.open(path) as image:
        return fingerprint(image)

rows = [[sorted(catalog_images[url]),features[url],url,'product'] for url in sorted(features)]
static = {}
def add_page(url, title, href, descriptor):
    target = 'page:' + hashlib.sha256(url.encode()).hexdigest()[:16]
    static[target] = {'title':title,'href':href,'image':url}
    rows.append([[target],descriptor,url,'page'])

for path in sorted((public/'assets').rglob('*')):
    if path.suffix.lower() not in ('.png','.jpg','.jpeg','.webp','.svg','.ico'):
        continue
    if 'qc-cache' in path.parts:
        continue
    url = '/'+path.relative_to(public).as_posix()
    descriptor = local_fingerprint(path)
    product = re.fullmatch(r'(?:home|product)-(\d+)',path.stem)
    if product and product[1] in products:
        rows.append([[product[1]],descriptor,url,'product'])
    else:
        is_guide = 'guide' in path.parts
        add_page(url,'Buying guide image' if is_guide else 'Site image','/guides/how-to-buy/' if is_guide else '/',descriptor)

# The cached thumbnails preserve the source watermark and are keyed by Weidian item ID.
snapshot = {}
for item_id, photos in read(qc/'records.json').items():
    if item_id not in by_weidian:
        continue
    snapshot[item_id] = []
    for photo in photos:
        name = photo['name']
        if not re.fullmatch(r'[0-9a-f]{20}\.webp',name):
            continue
        image = public/'assets/qc-cache'/name
        image.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(qc/name,image)
        url = '/'+image.relative_to(public).as_posix()
        entry = {'url':url,'label':photo['label']}
        if photo.get('source'):
            entry['source'] = photo['source']
        if photo.get('measurement'):
            entry['measurement'] = True
        snapshot[item_id].append(entry)
        rows.append([by_weidian[item_id],local_fingerprint(image),url,'qc'])
write(public/'qc-snapshot.json',snapshot)

platforms = read(public/'platforms.json')
platform_cache = qc/'platforms'
for platform in platforms:
    url = platform['image']
    path = platform_cache/(hashlib.sha256(url.encode()).hexdigest()+'.png')
    if path.exists():
        add_page(url,'Purchasing platform logo','/#spreadsheet',local_fingerprint(path))

target = public/'search-index'
target.mkdir(exist_ok=True)
shards=[]
for offset in range(0,len(rows),3200):
    group=rows[offset:offset+3200]
    content = json.dumps(group,ensure_ascii=False,separators=(',',':')).encode()
    name='photos-'+hashlib.sha256(content).hexdigest()[:16]+'.json'
    (target/name).write_bytes(content)
    shards.append({'url':'/search-index/'+name,'count':len(group)})
active = {Path(shard['url']).name for shard in shards}
for obsolete in target.glob('photos-*.json'):
    if obsolete.name not in active:
        obsolete.unlink()
manifest={'count':len(rows),'products':len(products),'catalogPhotos':len(features),'qcPhotos':sum(map(len,snapshot.values())),'qcProducts':len(snapshot),'sitePhotos':len(rows)-len(features)-sum(map(len,snapshot.values())),'platformPhotos':sum((platform_cache/(hashlib.sha256(row['image'].encode()).hexdigest()+'.png')).exists() for row in platforms),'targets':static,'shards':shards}
write(public/'search-index.json',manifest)
print({key:value for key,value in manifest.items() if key not in ('targets','shards')})
