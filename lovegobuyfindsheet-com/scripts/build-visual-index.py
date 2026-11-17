"""Index catalog covers, every carousel photo, local covers and warehouse QC photos."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import gzip
import io
import json
import os
from pathlib import Path
import struct
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
DATA = PUBLIC / "data"


def read(path):
    return json.loads(path.read_text())


def fingerprint(source):
    from PIL import Image, ImageOps

    if source.startswith("/"):
        raw = (PUBLIC / source.lstrip("/")).read_bytes()
    else:
        request = Request(source, headers={"User-Agent": "Mozilla/5.0", "Referer": "https://weidian.com/"})
        with urlopen(request, timeout=12) as response:
            raw = response.read(12 * 1024 * 1024)
    with Image.open(io.BytesIO(raw)) as image:
        image = ImageOps.exif_transpose(image).convert("RGBA")
        white = Image.new("RGBA", image.size, "white")
        white.alpha_composite(image)
        return white.convert("RGB").resize((8, 8), Image.Resampling.BILINEAR).tobytes()


def index(snapshots, supplement, cache, workers, offline):
    vectors = {}
    for source in snapshots:
        vectors.update({url: bytes(rgb) for url, rgb in read(source)["images"].items() if len(rgb) == 192})
    if supplement:
        with gzip.open(supplement, "rt") as source:
            vectors.update({url: bytes.fromhex(rgb) for url, rgb in json.load(source).items()})
    if cache and cache.exists():
        vectors.update({url: bytes.fromhex(rgb) for url, rgb in read(cache).items()})

    galleries = {}
    for path in DATA.glob("gallery-*.json"):
        galleries.update(read(path))
    qc = read(DATA / "qc-featured.json")
    products = read(DATA / "catalog.json")
    candidates = []
    for row, product in enumerate(products):
        item = product["weidianId"]
        urls = [product["image"], *galleries.get(item, [])]
        cover = f"/featured/{product['id']}.webp"
        if (PUBLIC / cover.lstrip("/")).exists():
            urls.append(cover)
        urls.extend(photo["url"] for photo in qc.get(item, {}).get("images", []))
        candidates.extend((row, url) for url in dict.fromkeys(urls))

    missing = sorted({url for _, url in candidates if url not in vectors})
    print(f"{len(missing):,} photos need additional source vectors", flush=True)

    def fetch(url):
        for _ in range(2):
            try:
                return url, fingerprint(url)
            except (OSError, ValueError):
                continue
        return url, None

    extra = read(cache) if cache and cache.exists() else {}
    with ThreadPoolExecutor(max_workers=workers) as pool:
        for count, (url, rgb) in enumerate(pool.map(fetch, [] if offline else missing), 1):
            if rgb:
                vectors[url] = rgb
                extra[url] = rgb.hex()
            if count % 250 == 0:
                print(f"Checked {count:,} / {len(missing):,}", flush=True)
                if cache:
                    cache.write_text(json.dumps(extra, separators=(",", ":")))
    if cache:
        cache.write_text(json.dumps(extra, separators=(",", ":")))

    # The vector row index and URL array share a position. Keep the exact
    # matched image available to the search results, including QC photos.
    rows = bytearray()
    urls = []
    unavailable = []
    covered_products = set()
    for row, url in candidates:
        if url not in vectors:
            unavailable.append(url)
            continue
        rows.extend(struct.pack("<H", row))
        rows.extend(vectors[url])
        urls.append(url)
        covered_products.add(row)
    report = {
        "products": len(products),
        "coveredProducts": len(covered_products),
        "indexedImages": len(urls),
        "totalImages": len(candidates),
        "unavailableImages": len(set(unavailable)),
    }
    print(json.dumps(report), flush=True)
    temporary = DATA / "visual-index.bin.tmp"
    temporary.write_bytes(rows)
    os.replace(temporary, DATA / "visual-index.bin")
    (DATA / "visual-photos.json").write_text(json.dumps(urls, separators=(",", ":")))
    (DATA / "visual-coverage.json").write_text(json.dumps(report, separators=(",", ":")))
    if unavailable and cache:
        cache.with_suffix(".unavailable.txt").write_text("\n".join(sorted(set(unavailable))) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("snapshots", nargs="+", type=Path)
    parser.add_argument("--supplement", type=Path)
    parser.add_argument("--cache", type=Path)
    parser.add_argument("--offline", action="store_true")
    parser.add_argument("--workers", type=int, default=32)
    args = parser.parse_args()
    index(args.snapshots, args.supplement, args.cache, args.workers, args.offline)
