"""Merge the shared FindSpreadsheet visual index with public listings added to this catalog."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import re
from struct import pack, unpack_from
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('shared_index', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
source = 'https://findspreadsheet.com'
catalog_path = root / 'src/data/catalog.json'
catalog = json.loads(catalog_path.read_text())
items = catalog['items']
by_path = {item['path']: index for index, item in enumerate(items)}
shared_items = json.loads((args.shared_index / 'catalog.json').read_text())
shared_photos = json.loads((args.shared_index / 'visual-photos.json').read_text())
shared_features = (args.shared_index / 'visual-index.bin').read_bytes()
if len(shared_features) != len(shared_photos) * 194:
    raise ValueError('Shared image index does not match its photo manifest')

def compact(rgb):
    return bytes(
        round(sum(rgb[((y + dy) * 8 + x + dx) * 3 + c]
                  for dx, dy in ((0, 0), (1, 0), (0, 1), (1, 1))) / 4) >> 3
        for y in range(0, 8, 2) for x in range(0, 8, 2) for c in range(3)
    )

def get(url, max_bytes):
    for attempt in range(2):
        try:
            with urlopen(Request(url, headers={'User-Agent': 'FindSpreadsheet Catalog Index'}), timeout=10) as response:
                return response.read(max_bytes)
        except (OSError, ValueError):
            if attempt == 1:
                return None

def gallery(item):
    body = get(source + item['path'], 2_000_000)
    paths = [item['image']]
    if body:
        section = body.decode('utf-8', 'replace').split('class="product-gallery"', 1)
        if len(section) == 2:
            gallery_html = section[1].split('class="product-price"', 1)[0]
            paths.extend(re.findall(r'data-src="(/uploads/[^"]+)"', gallery_html))
    return list(dict.fromkeys(paths)), body is not None

def read_image(task):
    row, path = task
    body = get(source + path, 12_000_000)
    if not body:
        return row, path, None
    try:
        with Image.open(BytesIO(body)) as picture:
            photo = picture.convert('RGBA').resize((8, 8), Image.Resampling.BILINEAR)
            white = Image.new('RGBA', photo.size, 'white')
            white.alpha_composite(photo)
            return row, path, compact(white.convert('RGB').tobytes())
    except (ValueError, OSError):
        return row, path, None

photos = []
features = bytearray()
covered = set()
seen = set()

def add(row, path, feature):
    if (row, path) not in seen:
        seen.add((row, path))
        covered.add(row)
        photos.append(path)
        features.extend(pack('<H', row))
        features.extend(feature)

for index, photo in enumerate(shared_photos):
    offset = index * 194
    previous = shared_items[unpack_from('<H', shared_features, offset)[0]]
    row = by_path.get(previous['sourcePath'])
    if row is None:
        continue
    if photo.startswith(source + '/'):
        photo = photo[len(source):]
    elif not photo.startswith('https://'):
        photo = items[row]['image']
    add(row, photo, compact(shared_features[offset + 2:offset + 194]))

missing = [index for index in range(len(items)) if index not in covered]
print(f'{len(photos)} shared photo records, {len(missing)} listings need indexing', flush=True)
with ThreadPoolExecutor(max_workers=17) as pool:
    tasks = []
    failed_pages = 0
    for row, (paths, ok) in zip(missing, pool.map(gallery, (items[index] for index in missing))):
        failed_pages += not ok
        if len(paths) > 1:
            items[row]['gallery'] = paths
        tasks.extend((row, path) for path in paths)
    print(f'{len(tasks)} supplemental photos to fetch, {failed_pages} gallery pages unavailable', flush=True)
    failed_photos = 0
    for index, (row, path, feature) in enumerate(pool.map(read_image, tasks)):
        if feature is None:
            failed_photos += 1
        else:
            add(row, path, feature)
        if (index + 1) % 500 == 0:
            print(f'{index + 1}/{len(tasks)} supplemental photos processed', flush=True)

output = root / 'public/data'
output.mkdir(parents=True, exist_ok=True)
(output / 'visual-index.bin').write_bytes(features)
(output / 'visual-photos.json').write_text(json.dumps({
    'products': len(items), 'covered': len(covered), 'photos': photos,
    'featureBits': 5,
    'imageIndexKey': sha256('\n'.join(item['path'] for item in items).encode()).hexdigest(),
    'unavailableImages': failed_photos, 'unavailableGalleries': failed_pages,
}, separators=(',', ':')))
catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, separators=(',', ':')))
print(f'{len(photos)} photos for {len(covered)}/{len(items)} public listings; {failed_photos} photo fetches failed', flush=True)
