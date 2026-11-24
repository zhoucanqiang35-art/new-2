"""Recreate the LoveGoBuy product translations from the shared catalog."""
import json
import sys
from pathlib import Path

source = Path(sys.argv[1]) / "loongbuyfindsheet-com" / "public"
public = Path(__file__).resolve().parents[1] / "public"
output = public / "product-locales"
output.mkdir(exist_ok=True)

def read(path):
    return json.loads(path.read_text(encoding="utf-8"))

product_ids = {
    product["weidianId"]: product["id"]
    for product in read(source / "catalog.json")
    if product.get("weidianId")
}
catalog = read(public / "data" / "catalog.json")
for locale in sorted((public / "locales").glob("*.json")):
    if locale.stem == "en":
        continue
    names = read(source / "i18n" / "catalog" / locale.name)["names"]
    translated = {}
    for product in catalog:
        item_id = product["weidianId"]
        name = names.get(product_ids.get(item_id))
        if not name:
            raise ValueError(f"Missing {locale.stem} translation for Weidian item {item_id}")
        translated[item_id] = name
    (output / locale.name).write_text(
        json.dumps(translated, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
print(f"Prepared product translations for {len(catalog)} items")

