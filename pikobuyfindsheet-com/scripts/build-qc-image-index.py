"""Index the warehouse QC snapshots for both image-search entry points."""
import json
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parents[1] / 'public'
snapshots = json.loads((root / 'data/qc-snapshot.json').read_text())
photos = []
for item_id, snapshot in snapshots.items():
    for photo in snapshot['photos']:
        path = photo['url']
        with Image.open(root / path.removeprefix('/')) as image:
            pixels = list(image.convert('RGB').resize((8, 8), Image.Resampling.BILINEAR).getdata())
        # Match the 4-by-4 blocks and 5-bit channels in the seller image index.
        feature = [
            round(sum(pixels[(y + dy) * 8 + x + dx][channel]
                      for dx in range(2) for dy in range(2)) / 4) >> 3
            for y in range(0, 8, 2) for x in range(0, 8, 2) for channel in range(3)
        ]
        photos.append({'id': item_id, 'photo': path, 'feature': feature})
(root / 'data/qc-visual.json').write_text(json.dumps(photos, separators=(',', ':')) + '\n')
