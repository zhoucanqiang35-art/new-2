#!/usr/bin/env python3
"""Build the browser's visual index from the catalog's product photos."""

import argparse
import base64
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import time
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

GRID_SIZE = 12
MAX_IMAGE_BYTES = 12 * 1024 * 1024
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src/data"
PUBLIC = ROOT / "public"
HOSTS = {"findspreadsheet.com", "si.geilicdn.com"}


def photo_records():
    catalog = json.loads((DATA / "catalog.json").read_text())
    options = json.loads((DATA / "product-options.json").read_text())
    warehouse = json.loads((DATA / "qc.json").read_text())
    covers = json.loads((DATA / "category-covers.json").read_text())
    curated_ids = set()
    for item in catalog:
        item_id = str(item["id"])
        curated_ids.add(item_id)
        product = options.get(item_id, {})
        urls = [item["image"], *item.get("images", []), *product.get("gallery", [])]
        urls.extend(
            option["image"]
            for group in product.get("groups", [])
            for option in group["options"]
            if option.get("image")
        )
        urls.extend(photo["image"] for photo in warehouse.get(item_id, []))
        featured = f"/media/home/popular-{item_id}.webp"
        if (PUBLIC / featured.lstrip("/")).is_file():
            urls.append(featured)
        category = item["categorySlug"]
        if covers.get(category) == item_id:
            urls.append(f"/media/home/category-{category}.webp")
        for url in dict.fromkeys(filter(None, urls)):
            yield item_id, url
    listing_ids = {item[1] for item in json.loads((DATA / "search-catalog.json").read_text()) if item[4]}
    for item_id in sorted(listing_ids.intersection(warehouse).difference(curated_ids)):
        for url in dict.fromkeys(photo["image"] for photo in warehouse[item_id]):
            yield item_id, url


def image_bytes(url):
    parsed = urlsplit(url)
    if not parsed.scheme and url.startswith("/media/"):
        path = (PUBLIC / url.lstrip("/")).resolve()
        if not path.is_relative_to(PUBLIC / "media"):
            raise ValueError("Image path is outside public/media")
        return path.read_bytes()
    if parsed.scheme != "https" or parsed.hostname not in HOSTS:
        raise ValueError("Unknown image source")
    request = Request(url, headers={"Accept": "image/*"})
    with urlopen(request, timeout=10) as response:
        final = urlsplit(response.url)
        if final.scheme != "https" or final.hostname not in HOSTS:
            raise ValueError("Unexpected image redirect")
        return response.read(MAX_IMAGE_BYTES + 1)


def descriptor(url, cache):
    cached = cache / sha256(url.encode()).hexdigest() if cache else None
    if cached and cached.is_file():
        return cached.read_text()
    sources = [url]
    if url.startswith("https://si.geilicdn.com/") and "?" not in url:
        sources.insert(0, url + "?imageView2/2/w/128")
    for attempt, source in enumerate([*sources, sources[0]]):
        try:
            data = image_bytes(source)
            if len(data) > MAX_IMAGE_BYTES:
                raise ValueError("Image too large")
            with Image.open(BytesIO(data)) as original:
                image = ImageOps.exif_transpose(original).convert("RGBA")
                background = Image.new("RGBA", image.size, "white")
                background.alpha_composite(image)
                grid = background.convert("RGB").resize(
                    (GRID_SIZE, GRID_SIZE), Image.Resampling.BILINEAR
                )
            value = base64.b64encode(grid.tobytes()).decode("ascii")
            if cached:
                cached.write_text(value)
            return value
        except (OSError, ValueError) as error:
            if attempt == len(sources):
                print(f"Unavailable {url}: {error}", flush=True)
            else:
                time.sleep(0.15 * (attempt + 1))
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", type=Path, help="Optional scratch directory for descriptors.")
    args = parser.parse_args()
    if args.cache:
        args.cache.mkdir(parents=True, exist_ok=True)
    records = list(photo_records())
    urls = list(dict.fromkeys(url for _, url in records))
    descriptions = {}
    with ThreadPoolExecutor(max_workers=20) as pool:
        for index, (url, value) in enumerate(zip(urls, pool.map(lambda url: descriptor(url, args.cache), urls)), 1):
            descriptions[url] = value
            if index % 250 == 0:
                print(f"Processed {index}/{len(urls)} unique image sources.", flush=True)
    unavailable = [url for url in urls if descriptions[url] is None]
    if unavailable:
        raise SystemExit(f"Index unchanged. {len(unavailable)}/{len(urls)} image sources could not be read.")
    entries = [[item_id, url, descriptions[url]] for item_id, url in records]
    data = {"size": GRID_SIZE, "entries": entries}
    (DATA / "image-index.json").write_text(json.dumps(data, separators=(",", ":")) + "\n")
    print(f"Indexed {len(urls)} unique images ({len(entries)} item-image pairs) for {len({item for item, _ in records})} products.")


if __name__ == "__main__":
    main()
