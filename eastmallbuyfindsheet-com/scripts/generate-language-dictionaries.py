"""Generate static translations from the built site with a local M2M100 CTranslate2 model.

Run after npm run build. Pass a model folder with model.bin, CTranslate2 config
and vocabulary, and the original M2M100 sentencepiece.bpe.model.
Requires ctranslate2, sentencepiece and opencc-python-reimplemented.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
from pathlib import Path
import re

import ctranslate2
from opencc import OpenCC
import sentencepiece

LANGUAGES = 'zh es fr de it pt ru ja ko ar tr pl nl sv da fi no hu ro cs uk'.split()
ATTRIBUTES = {'aria-label', 'alt', 'title', 'placeholder'}
IGNORED = {'script', 'style', 'noscript'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
PHRASES = {
    'ZZ1ZZ listings', 'ZZ1ZZ listing', 'Page ZZ1ZZ of ZZ2ZZ',
    'Historical warehouse photos for Weidian item ZZ1ZZ.',
    'Weidian item ZZ1ZZ', 'View seller photo ZZ1ZZ', 'Buy on ZZ1ZZ',
    'Warehouse QC photo ZZ1ZZ', 'ZZ1ZZ visually similar listings from the saved index.',
    'No matching listings. Try another search or category.',
    'The saved QC check found no warehouse photos for this item.',
    'The last saved QC check was pending.',
    'Estimated item price', 'estimated item price',
    'Other shopping agents', 'Close', 'Previous photo', 'Next photo',
    'Could not load that language. Please try again.',
}
DYNAMIC_FILES = (
    'src/lib/browser.mjs', 'src/lib/detail.mjs', 'src/lib/directory.mjs',
    'src/lib/image-search.mjs', 'src/components/QcFinder.astro', 'src/pages/saved.astro',
)
EXTRA_PATTERN = re.compile(
    r"(?:textContent\s*[:=]\s*|external\(|\?\s*|:\s*|\?\?\s*)'([^'\n]+)'"
)
CATEGORIES = [
    'Shoes', 'Hoodies & Sweaters', 'Jackets', 'T-Shirts', 'Pants & Shorts', 'Headwear',
    'Accessories', 'Short Sets', 'Jerseys', 'Electronics', 'Other Finds',
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
        if re.search('[a-zA-Z]', key) and not re.fullmatch('[A-Z]{3}|EastMallBuy|Findspreadsheet|Findsheet', key):
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


BRAND = 'EastMallBuy'


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
        localized = re.sub(r'east\s*mall\s*buy', BRAND, localized, flags=re.I)
    return localized or en


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('model', type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    output_dir = root / 'public/data/languages'
    output_dir.mkdir(parents=True, exist_ok=True)
    keys = source_phrases(root)
    processor = sentencepiece.SentencePieceProcessor(model_file=str(args.model / 'sentencepiece.bpe.model'))
    translator = ctranslate2.Translator(str(args.model), device='cpu', compute_type='int8', inter_threads=3, intra_threads=3)
    inputs = [['__en__'] + processor.encode(text, out_type=str) for text in keys]

    def generate(code):
        result = translator.translate_batch(
            inputs, target_prefix=[['__' + code + '__']] * len(inputs),
            beam_size=1, max_batch_size=1200, batch_type='tokens', max_decoding_length=320,
        )
        translations = {text: clean(text, processor.decode(item.hypotheses[0][1:]), code)
                        for text, item in zip(keys, result)}
        if code == 'zh':
            overrides = json.loads((root / 'scripts/zh-editorial-overrides.json').read_text())
            translations.update({key: value for key, value in overrides.items() if key in translations})
        target = 'zh-Hans' if code == 'zh' else code
        (output_dir / (target + '.json')).write_text(json.dumps(translations, ensure_ascii=False, separators=(',', ':')) + '\n')
        if code == 'zh':
            traditional = OpenCC('s2t')
            (output_dir / 'zh-Hant.json').write_text(json.dumps(
                {text: traditional.convert(value) for text, value in translations.items()},
                ensure_ascii=False, separators=(',', ':')) + '\n')
        print(f'{target}: {len(translations)} strings', flush=True)

    print(f'Translating {len(keys)} English strings', flush=True)
    with ThreadPoolExecutor(max_workers=3) as pool:
        list(pool.map(generate, LANGUAGES))


if __name__ == '__main__':
    main()
