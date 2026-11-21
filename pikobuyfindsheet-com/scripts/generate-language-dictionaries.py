"""Generate static translations from the built site with a local M2M100 CTranslate2 model.

Run after npm run build. Pass a model folder with model.bin, CTranslate2 config
and vocabulary, and the original M2M100 sentencepiece.bpe.model.
Requires ctranslate2, sentencepiece.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
from pathlib import Path
import re


LANGUAGES = 'zh es fr de it pt ru ja ko ar tr pl nl sv da fi no hu ro cs uk'.split()
ATTRIBUTES = {'aria-label', 'alt', 'title', 'placeholder'}
IGNORED = {'script', 'style', 'noscript'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
PHRASES = {
    'ZZ1ZZ result in the synced FindSpreadsheet catalog.',
    'ZZ1ZZ results in the synced FindSpreadsheet catalog.',
    'ZZ1ZZ result from FindSpreadsheet.', 'ZZ1ZZ results from FindSpreadsheet.',
    'ZZ1ZZ visually similar listings. Check the listing and exact variant before ordering.',
    'ZZ1ZZ indexed seller and warehouse photos across ZZ2ZZ of ZZ3ZZ public listings.',
    'ZZ1ZZ saved warehouse QC photos from FindSpreadsheet. Select a photo to enlarge it.',
    'Showing ZZ1ZZ of ZZ2ZZ warehouse QC photos from FindSpreadsheet.',
    'Saved on', 'Checked on',
    'ZZ1ZZ warehouse QC photo from FindSpreadsheet.',
    'ZZ1ZZ warehouse QC photos from FindSpreadsheet.',
    'Warehouse QC photo ZZ1ZZ', 'Open item ZZ1ZZ', 'Weidian item ID ZZ1ZZ',
    'ZZ1ZZ of ZZ2ZZ seller photos', 'Show seller photo ZZ1ZZ',
    'ZZ1ZZ saved warehouse QC photos from FindSpreadsheet. Verify the variant against your order.',
    'Buy on ZZ1ZZ', 'Try sample ZZ1ZZ', 'Choose a photo smaller than ZZ1ZZ MB.',
    'View on FindSpreadsheet','Save product','Remove saved product',
    'Choose a photo to start.', 'Comparing photos across the catalog…',
    'Image search could not finish. Choose a supported photo and try again.',
    'Could not load that language. Please try again.',
    'Saved products could not be loaded.', 'Save a product from its detail page to start a shortlist.',
}
DYNAMIC_FILES = (
    'src/lib/catalog-client.mjs', 'src/lib/qc-client.mjs', 'src/lib/image-search.mjs',
    'src/lib/product-detail.mjs', 'src/pages/saved/index.astro',
)
EXTRA_PATTERN = re.compile(
    r"(?:textContent\s*[:=]\s*|external\(|\?\s*|:\s*|\?\?\s*)'([^'\n]+)'"
)
CATEGORIES = [
    'Shoes', 'Hoodies', 'Jackets', 'T-shirts', 'Pants & shorts', 'Headwear',
    'Accessories', 'Short sets', 'Jerseys', 'Electronics', 'Other finds',
]


def normalize(text):
    return ' '.join(text.split())


class SourceText(HTMLParser):
    def __init__(self, output):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.output = output

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        skip = (self.stack and self.stack[-1][1]) or tag in IGNORED or attrs.get('translate') == 'no' or 'data-reference-price' in attrs
        if not skip:
            for key in ATTRIBUTES:
                self.add(attrs.get(key, ''))
        if tag not in VOID:
            self.stack.append((tag, skip))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, text):
        if not self.stack or not self.stack[-1][1]:
            self.add(text)

    def add(self, text):
        key = normalize(text)
        if re.search('[a-zA-Z]', key) and not re.fullmatch('[A-Z]{3}|Pikobuy|FindSpreadsheet|FINDSHEET|Weidian|English', key):
            self.output.add(key)


def source_phrases(root):
    keys = set(PHRASES)
    for file in (root / 'dist').rglob('*.html'):
        reader = SourceText(keys)
        reader.feed(file.read_text())
    for path in DYNAMIC_FILES:
        for phrase in EXTRA_PATTERN.findall((root / path).read_text()):
            phrase = normalize(phrase)
            if re.match(r'^[A-Za-z][A-Za-z0-9 &’.,!?…()–-]+$', phrase) and (' ' in phrase or phrase in ('Saved', 'Search')):
                keys.add(phrase)
    for category in CATEGORIES:
        keys.update((category, category.upper(), 'More in ' + category))
    return sorted(keys)


BRAND = 'Pikobuy'


def clean(en, localized, code):
    if code == 'zh':
        localized = re.sub(r'传输表|电子表单|传播表|撰写表|分布表|电子表面|传播列表', '电子表格', localized)
        localized = re.sub(r'库存\s*QC', '仓库 QC', localized)
    if code == 'ko':
        localized = localized.replace('스프레이시트', '스프레드시트')
    localized = re.sub(r'Z\s*Z\s*(\d+)\s*Z\s*Z', r'ZZ\1ZZ', localized, flags=re.I)
    marks = re.findall(r'ZZ\d+ZZ', en)
    if any(mark not in localized for mark in marks):
        return en
    if BRAND in en and BRAND not in localized:
        localized = re.sub(r'piko\s*buy', BRAND, localized, flags=re.I)
    return localized or en


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('model', type=Path, nargs='?')
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--shared-dictionaries', type=Path)
    parser.add_argument('--output-directory', type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    output_dir = args.output_directory or root / 'public/data/languages'
    output_dir.mkdir(parents=True, exist_ok=True)
    keys = source_phrases(root)
    if args.check:
        failures = {}
        for code in LANGUAGES:
            locale = 'zh-Hans' if code == 'zh' else code
            saved = json.loads((output_dir / (locale + '.json')).read_text())
            missing = sorted(set(keys) - saved.keys())
            if missing:
                failures[locale] = missing
        if failures:
            for locale, missing in failures.items():
                print(f'{locale}: {len(missing)} missing keys, e.g. {missing[:3]}')
            raise SystemExit(1)
        print(f'Checked {len(keys)} exported keys across {len(LANGUAGES)} dictionaries')
        return
    if args.model is None:
        parser.error('model is required unless --check is used')
    import ctranslate2
    import sentencepiece
    shared_dir = args.shared_dictionaries
    processor = sentencepiece.SentencePieceProcessor(model_file=str(args.model / 'sentencepiece.bpe.model'))
    translator = ctranslate2.Translator(str(args.model), device='cpu', compute_type='int8', inter_threads=1, intra_threads=8)

    def generate(code):
        target = 'zh-Hans' if code == 'zh' else code
        saved = shared_dir / (target + '.json') if shared_dir else None
        reused = json.loads(saved.read_text()) if saved and saved.is_file() else {}
        reused = {text: reused[text] for text in keys if text in reused and reused[text] != text}
        missing = [text for text in keys if text not in reused]
        inputs = [['__en__'] + processor.encode(text, out_type=str) + ['</s>'] for text in missing]
        result = translator.translate_batch(
            inputs, target_prefix=[['__' + code + '__']] * len(inputs),
            beam_size=1, max_batch_size=1700, batch_type='tokens', max_decoding_length=130,
            no_repeat_ngram_size=3,
        )
        translations = {text: clean(text, processor.decode(item.hypotheses[0][1:]), code)
                        for text, item in zip(missing, result)}
        translations.update(reused)
        (output_dir / (target + '.json')).write_text(json.dumps(translations, ensure_ascii=False, separators=(',', ':')) + '\n')
        print(f'{target}: {len(translations)} strings', flush=True)

    print(f'Translating {len(keys)} English strings', flush=True)
    with ThreadPoolExecutor(max_workers=1) as pool:
        list(pool.map(generate, LANGUAGES))


if __name__ == '__main__':
    main()
