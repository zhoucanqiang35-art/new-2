#!/usr/bin/env python3
"""Export the public Findspreadsheet product listings for PonyBuy text search."""

import argparse
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen

ORIGIN = "https://findspreadsheet.com"
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src/data/search-catalog.json"
BATCH = 10


class CatalogPage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.records = []
        self.dates = {}
        self.views = {}
        self.view_id = None
        self.next_href = None
        self.anchor = None

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "a":
            self.anchor = attrs.get("href")
        if tag == "div" and "product-card" in (attrs.get("class") or "").split():
            self.dates[attrs["data-id"]] = int(attrs.get("data-date") or 0)
        if tag == "span" and "data-fs-view-aid" in attrs:
            self.view_id = attrs["data-fs-view-aid"]
        if "data-cart-add" in attrs and "data-cart-url" in attrs:
            record_id = attrs["data-cart-id"]
            path = attrs["data-cart-url"]
            photo = attrs.get("data-cart-image") or ""
            market_id = attrs.get("data-cart-weidian") or ""
            if not re.fullmatch(r"/[\w-]+/[^/?#]+\.html", path) or not re.fullmatch(r"\d+", record_id):
                raise ValueError(f"Unexpected product URL: {path}")
            recovered = f"/media/listing-photos/{record_id}.webp"
            if (ROOT / "public" / recovered.lstrip("/")).is_file():
                photo = recovered
            elif photo.startswith(ORIGIN + "/uploads/"):
                photo = photo.removeprefix(ORIGIN)
            elif not photo.startswith(("/uploads/", "https://si.geilicdn.com/")):
                photo = ""
            if not re.fullmatch(r"\d{8,20}", market_id):
                market_id = ""
            price = attrs.get("data-cart-price")
            self.records.append([
                record_id, market_id, attrs["data-cart-title"], path, photo,
                float(price) if price and float(price) > 0 else None,
                self.views.get(record_id, 0), self.dates.get(record_id, 0),
            ])

    def handle_endtag(self, tag):
        if tag == "span":
            self.view_id = None
        if tag == "a":
            self.anchor = None

    def handle_data(self, data):
        if self.view_id and data.strip().isdigit():
            self.views[self.view_id] = int(data.strip())
        if data.strip() == "Next" and self.anchor and self.anchor.startswith("/AllProducts/"):
            self.next_href = self.anchor


def fetch(page, cache):
    path = "/AllProducts/" if page == 1 else f"/AllProducts/list_42_{page}/"
    for retry in range(3):
        try:
            cached = cache / f"{page}.html" if cache else None
            if cached and cached.is_file():
                raw = cached.read_text()
            else:
                request = Request(ORIGIN + path, headers={"User-Agent": "Mozilla/5.0", "Accept": "text/html"})
                with urlopen(request, timeout=18) as response:
                    if response.geturl() != ORIGIN + path:
                        raise ValueError(f"Unexpected redirect for page {page}: {response.geturl()}")
                    raw = response.read().decode("utf-8")
            document = CatalogPage()
            document.feed(raw)
            if not document.records:
                raise ValueError(f"No product cards on page {page}")
            if document.next_href and document.next_href != f"/AllProducts/list_42_{page + 1}/":
                raise ValueError(f"Unexpected next page from page {page}: {document.next_href}")
            if cached and not cached.exists():
                cached.write_text(raw)
            return document
        except (OSError, ValueError) as error:
            if retry == 2:
                raise RuntimeError(f"Failed to read catalog page {page}") from error


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", type=Path, help="Optional scratch directory for catalog page snapshots.")
    args = parser.parse_args()
    if args.cache:
        args.cache.mkdir(parents=True, exist_ok=True)
    records = {}
    page = 1
    with ThreadPoolExecutor(max_workers=BATCH) as pool:
        while True:
            requests = {p: pool.submit(fetch, p, args.cache) for p in range(page, page + BATCH)}
            for number, request in requests.items():
                result = request.result()
                for row in result.records:
                    records.setdefault(row[0], row)
                if not result.next_href:
                    for extra, job in requests.items():
                        if extra > number:
                            job.cancel()
                    OUTPUT.write_text(json.dumps(list(records.values()), ensure_ascii=False, separators=(",", ":")) + "\n")
                    print(f"Imported {len(records)} unique products from {number} pages.")
                    return
            page += BATCH
            print(f"Read {page - 1} pages, {len(records)} unique products.", flush=True)


if __name__ == "__main__":
    main()
