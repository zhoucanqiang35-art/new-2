"""Prepare the LoveGoBuy preview from FindSpreadsheet exports in new-2."""
import json
import sys
from pathlib import Path

source = Path(sys.argv[1])
output = Path(__file__).resolve().parents[1] / "public" / "data"
output.mkdir(parents=True, exist_ok=True)
source_data = source / "litbuysheetlab-com" / "public" / "data"

def read(name):
    return json.loads((source_data / name).read_text())

def write(name, value):
    (output / name).write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")))

products = {}
for product in read("products.json"):
    item_id = product.get("weidianId", "")
    if item_id and item_id.isascii() and item_id.isdigit() and product.get("image"):
        products.setdefault(item_id, product)
catalog = list(products.values())
write("catalog.json", catalog)
galleries = read("galleries.json")
purchase = read("purchase-galleries.json")
gallery_shards = {}
for product in catalog:
    item_id = product["weidianId"]
    pictures = list(dict.fromkeys([product["image"], *purchase.get(item_id, []), *galleries.get(product["id"], [])]))
    gallery_shards.setdefault(item_id[:4], {})[item_id] = pictures[:16]
for prefix, shard in gallery_shards.items():
    write(f"gallery-{prefix}.json", shard)

qc_source = source / "usfansfindsheet-com" / "data" / "main-qc-snapshot.json"
qc = {
    item_id: {"status": record.get("status"), "updatedAt": record.get("updatedAt")}
    for item_id, record in json.loads(qc_source.read_text()).items()
    if item_id in products and record.get("status") in {"none", "pending"}
}
qc["7858402075"] = {"status": "none", "updatedAt": "2026-09-25T19:16:41.784Z"}
write("qc.json", qc)
print(f"{len(catalog)} products, {len(qc)} QC status records")
