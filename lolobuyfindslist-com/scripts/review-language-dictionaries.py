"""Apply editorial terminology and repair duplicated model output after translation."""
import json
from pathlib import Path
import re

from opencc import OpenCC

root = Path(__file__).resolve().parents[1]
overrides = json.loads((root / 'scripts/editorial-translations.json').read_text())
traditional = OpenCC('s2t')
overrides['zh-Hant'] = {key: traditional.convert(value) for key, value in overrides['zh-Hans'].items()}

for path in (root / 'public/data/languages').glob('*.json'):
    data = json.loads(path.read_text())
    for source, value in data.items():
        if ' | ' in source and '|' not in value:
            leading, trailing = source.split(' | ', 1)
            localized = data.get(leading, leading)
            if len(localized) <= max(80, len(leading) * 4) and '⁇' not in localized:
                value = f'{localized} | {trailing}'
        damaged = '⁇' in value or len(value) > max(70, len(source) * 4)
        repeated = re.search(r'(.{4,30}?)(?:\s*\1){5,}', value)
        if damaged or repeated:
            value = source
        data[source] = value
    data.update(overrides.get(path.stem, {}))
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
