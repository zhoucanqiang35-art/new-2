from pathlib import Path
import io
import json
from PIL import Image
import subprocess

root = Path(__file__).resolve().parents[1] / 'dist'
catalog = json.loads((root / 'data/catalog.json').read_text())
by_id = {p['id']:p for p in catalog}
guide_names = ['Product link entry', 'Color, size and quantity', 'Domestic order payment',
               'Warehouse QC inspection', 'Parcel submission', 'International shipping payment']
extras = []
def add(path, title, href, item=None):
    if path.suffix == '.svg':
        im = Image.open(io.BytesIO(subprocess.check_output([
            'node', '-e',
            'require("sharp")(process.argv[1]).resize(120,120,{fit:"inside"}).png().toBuffer().then(b=>process.stdout.write(b)).catch(e=>{console.error(e);process.exitCode=1})',
            str(path)
        ])))
    else:
        im = Image.open(path)
    pixels = Image.new('RGBA', im.size, '#fff')
    pixels.alpha_composite(im.convert('RGBA'))
    rgb = list(pixels.convert('RGB').resize((8, 8), Image.Resampling.BILINEAR).tobytes())
    extras.append(dict(src='/' + path.relative_to(root).as_posix(), title=title, href=href, id=item, rgb=rgb))
for path, title in zip(sorted((root/'guide-images').glob('0*')), guide_names):
    add(path, title, '/guide/#step-' + path.name[:2])
for key, title in [('catalog', 'Search by Weidian ID'), ('product', 'Open the product details')]:
    add(root/'guide-images'/f'site-{key}.webp', title, '/guide/#step-01')
for path in sorted((root/'featured').glob('*.webp')):
    product = by_id[path.stem]
    add(path, product['name'], '/product/?id=' + product['weidianId'], product['weidianId'])
for path, title in [('superbuy-logo.svg', 'Superbuy wordmark'), ('superbuy-favicon.svg', 'Superbuy icon'), ('image-unavailable.svg', 'Image unavailable placeholder')]:
    add(root/'assets'/path, title, '/')
add(root/'assets'/'superbuy-air-delivery.webp', 'Superbuy air delivery hero banner with blue dragon, plane and parcels', '/#home-banner')
add(root/'assets'/'superbuy-air-delivery-mobile.webp', 'Superbuy air delivery mobile banner with blue dragon, plane and parcels', '/#home-banner')
agents = json.loads((root/'data/agents.json').read_text())
for agent in [{'id':'findspreadsheet','name':'FindSpreadsheet'}, *agents]:
    add(root/'agent-icons'/f"{agent['id']}.webp", f"{agent['name']} logo", '/spreadsheet/')
qc = json.loads((root/'data/qc-featured.json').read_text())
for item, data in qc.items():
    for photo in data.get('images', ()):
        path = root / photo['url'].lstrip('/')
        add(path, 'Warehouse QC photo', '/product/?id=' + item, item)
(root/'data/extra-visual.json').write_text(json.dumps(extras,separators=(',',':')))
