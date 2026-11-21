"""Build site dictionaries from dist with a local M2M100 CTranslate2 model."""
import argparse
import csv
from html.parser import HTMLParser
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = 'zh-Hans es fr de it pt ru ja ko ar tr pl nl sv da fi no hu ro cs uk'.split()
ATTRIBUTES = {'aria-label', 'alt', 'title', 'placeholder'}
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
DYNAMIC = (
    'browse.mjs', 'image-search.mjs', 'qc-search.mjs', 'qc.mjs', 'item.mjs',
    'shopping-controls.mjs', 'agents.mjs'
)
PHRASES = {
    'Buy on ZZ1ZZ', 'View on Findspreadsheet', 'Page ZZ1ZZ of ZZ2ZZ',
    'ZZ1ZZ listing', 'ZZ1ZZ listings', 'ZZ1ZZ saved photos', 'Weidian item ZZ1ZZ',
    'ZZ1ZZ visually similar listings from the saved index.',
    'ZZ1ZZ saved warehouse photos for Weidian item ZZ2ZZ.',
    'Checking saved QC for item ZZ1ZZ…', 'Warehouse QC photo ZZ1ZZ',
    'Show warehouse photo ZZ1ZZ', 'Show product photo ZZ1ZZ',
    'Choose a photo smaller than ZZ1ZZ MB.',
    'ZZ1ZZ warehouse photos from the main site.', 'Product unavailable',
    'Warehouse inspection photos for this Weidian ID.', 'Check warehouse QC',
    'This item is outside the saved catalog.', 'Check this Weidian item on OrientDig',
}
PHRASES.update('Warehouse source: ' + agent for agent in ('mulebuy', 'superbuy', 'orientdig'))
LABEL_ALIASES = {
    'OrientDig product spreadsheet': 'OrientDig Spreadsheet',
    'Image search & warehouse QC': 'Image Search & QC',
    'Image search & QC': 'Image Search & QC',
    'Image search': 'Search by image',
}


def normalize(text):
    return ' '.join(text.split())

class Extract(HTMLParser):
    def __init__(self, keys):
        super().__init__(convert_charrefs=True)
        self.keys = keys
        self.stack = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        skip = (self.stack and self.stack[-1][1]) or tag in {'script', 'style', 'noscript'} or (
            attrs.get('translate') == 'no' or 'data-price-cny' in attrs or 'data-currency-code' in attrs
        )
        if not skip:
            for attr in ATTRIBUTES:
                self.add(attrs.get(attr, ''))
        if tag not in VOID:
            self.stack.append((tag, skip))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, text):
        if not self.stack or not self.stack[-1][1]:
            self.add(text)

    def add(self, text):
        text = normalize(text)
        if re.search('[a-zA-Z]', text) and not re.fullmatch(r'[A-Z]{3}|[^ ]* · \d+|OrientDig|Findspreadsheet', text):
            self.keys.add(text)

def phrases():
    keys = set(PHRASES)
    for file in (ROOT / 'dist').rglob('*.html'):
        Extract(keys).feed(file.read_text())
    for name in DYNAMIC:
        contents = (ROOT / 'src/lib' / name).read_text()
        for match in re.findall(r"""['"]([A-Z][A-Za-z0-9 ,.?!…’()&–/-]+)['"]""", contents):
            if ' ' in match:
                keys.add(normalize(match))
    return sorted(keys)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('model', type=Path)
    parser.add_argument('--seed', type=Path)
    parser.add_argument('--locales', nargs='+', choices=LANGUAGES, default=LANGUAGES)
    parser.add_argument('--threads', type=int, default=4)
    args = parser.parse_args()
    import ctranslate2
    import sentencepiece
    model = args.model
    sentencepiece = sentencepiece.SentencePieceProcessor(model_file=str(model / 'sentencepiece.bpe.model'))
    translator = ctranslate2.Translator(str(model), device='cpu', compute_type='int8', intra_threads=args.threads)
    output = ROOT / 'public/data/languages'
    output.mkdir(parents=True, exist_ok=True)
    with (ROOT / 'scripts/navigation-translations.tsv').open() as stream:
        curated = {row.pop('locale'): row for row in csv.DictReader(stream, delimiter='\t')}
    for labels in curated.values():
        labels.update({key: labels[source] for key, source in LABEL_ALIASES.items()})
    keys = phrases()
    printable = lambda d: json.dumps(d, ensure_ascii=False, separators=(',', ':')) + '\n'
    print(f'{len(keys)} source phrases', flush=True)
    for locale in args.locales:
        target = 'zh' if locale == 'zh-Hans' else locale
        seed = args.seed / (locale + '.json') if args.seed else None
        existing = json.loads(seed.read_text()) if seed and seed.exists() else {}
        translations = {key: existing[key] for key in keys if key in existing and existing[key] != key}
        translations.update(curated[locale])
        missing = [key for key in keys if key not in translations]
        inputs = [['__en__', *sentencepiece.encode(key, out_type=str), '</s>'] for key in missing]
        results = translator.translate_batch(inputs, target_prefix=[['__' + target + '__']] * len(inputs),
            beam_size=1, max_batch_size=2200, batch_type='tokens', max_decoding_length=105, no_repeat_ngram_size=3)
        for key, result in zip(missing, results):
            value = sentencepiece.decode(result.hypotheses[0][1:]).strip()
            value = re.sub(r'Z\s*Z\s*(\d+)\s*Z\s*Z', r'ZZ\1ZZ', value, flags=re.I)
            markers = re.findall(r'ZZ\d+ZZ',key)
            if not value or any(marker not in value for marker in markers):
                value = key
            translations[key] = value
        (output / (locale + '.json')).write_text(printable(translations))
        print(locale, len(missing), flush=True)
if __name__ == '__main__':
    main()
