"""Check upstream covers for high-traffic listings that have only one seller photo."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
from urllib.request import Request, urlopen

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--limit', type=int, default=50, help='Maximum covers to check; use 0 for all single-photo listings.')
args = parser.parse_args()
if args.limit < 0:
    parser.error('--limit must be 0 or larger')
catalog = json.loads((root / 'src/data/catalog.json').read_text())['items']
thumbnails = json.loads((root / 'src/data/product-thumbnails.json').read_text())
single = sorted((item for item in catalog if len(item['gallery']) == 1),
                key=lambda item: item['views'], reverse=True)
paths = list(dict.fromkeys(item['image'] for item in single))
paths = paths[:args.limit] if args.limit else paths


def check(path):
    local = thumbnails.get(path)
    backup = bool(local and (root / 'public' / local.lstrip('/')).is_file())
    try:
        request = Request('https://findspreadsheet.com' + path, method='HEAD')
        with urlopen(request, timeout=12) as response:
            return response.headers.get_content_type().startswith('image/'), backup
    except OSError:
        return False, backup


failed = 0
with ThreadPoolExecutor(max_workers=6) as pool:
    for path, (reachable, backup) in zip(paths, pool.map(check, paths)):
        if not reachable:
            print(path, 'local fallback available' if backup else 'needs a local fallback')
            failed += not backup
print(f'Checked {len(paths)} upstream covers. {failed} need attention.')
raise SystemExit(int(bool(failed)))
