#!/usr/bin/env python3
"""Translate public catalog/page text in checkpointed batches.

TRANSLATE_LANG selects the target language; TRANSLATE_KIND is titles or pages.
TRANSLATE_BATCH_SIZE (1-25) and TRANSLATE_CONCURRENCY (1-3) are optional.
A 401/403/429 response stops the run; rerunning resumes saved translations.
TRANSLATE_ENDPOINT supports a local test server or the existing HTTPS endpoint.
"""
import asyncio
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

import aiohttp

lang = os.environ.get('TRANSLATE_LANG', 'fi')
kind = os.environ.get('TRANSLATE_KIND', 'titles')
if not re.fullmatch(r'[a-z]{2,3}(?:-[A-Za-z]{2,4})?', lang) or kind not in {'titles', 'pages'}:
    sys.exit('Invalid language or content kind')
endpoint = os.environ.get('TRANSLATE_ENDPOINT', 'https://translate.googleapis.com/translate_a/single')
parsed = urlparse(endpoint)
if parsed.scheme != 'https' and not (parsed.scheme == 'http' and parsed.hostname in {'127.0.0.1', 'localhost', '::1'}):
    sys.exit('Translation endpoint must use HTTPS (except a local test server)')
size = max(1, min(25, int(os.environ.get('TRANSLATE_BATCH_SIZE', '25'))))
concurrency = max(1, min(3, int(os.environ.get('TRANSLATE_CONCURRENCY', '3'))))
work = Path('translation-work')
source = work / ('page-source-en.json' if kind == 'pages' else 'source-en.json')
checkpoint = work / f'{lang}-{kind}.json'
rows = json.loads(source.read_text(encoding='utf-8'))
done = json.loads(checkpoint.read_text(encoding='utf-8')) if checkpoint.exists() else {}
if not isinstance(done, dict):
    sys.exit('Invalid checkpoint')
pending = [item for item in rows if not isinstance(done.get(item['id']), str) or not done[item['id']].strip()]
batches = [pending[i:i + size] for i in range(0, len(pending), size)]
queue = asyncio.Queue()
for batch in batches:
    queue.put_nowait(batch)
stop = asyncio.Event()
failed = []
completed = 0


def save():
    work.mkdir(exist_ok=True)
    tmp = checkpoint.with_suffix(checkpoint.suffix + '.tmp')
    tmp.write_text(json.dumps(done, ensure_ascii=False), encoding='utf-8')
    tmp.replace(checkpoint)


async def run():
    global completed
    async with aiohttp.ClientSession(trust_env=True, timeout=aiohttp.ClientTimeout(total=25)) as session:
        async def worker():
            global completed
            while not stop.is_set():
                try:
                    items = queue.get_nowait()
                except asyncio.QueueEmpty:
                    return
                query = '\n'.join(f'{n + 1:02d}. ' + re.sub(r'\s+', ' ', x['name']).strip() for n, x in enumerate(items))
                try:
                    async with session.get(endpoint, params={'client': 'gtx', 'sl': 'en', 'tl': lang, 'dt': 't', 'q': query}) as response:
                        if response.status in {401, 403, 429}:
                            failed.append(f'HTTP {response.status}; service refused or limited requests')
                            stop.set()
                            continue
                        if response.status != 200:
                            failed.append(f'HTTP {response.status}')
                            stop.set()
                            continue
                        data = await response.json(content_type=None)
                    lines = ''.join(part[0] for part in data[0] if part[0]).splitlines()
                    if len(lines) != len(items):
                        raise ValueError('unexpected translated line count')
                    output = []
                    for n, line in enumerate(lines, 1):
                        match = re.match(r'^\s*0*' + str(n) + r'[.、:)]\s*(.+?)\s*$', line)
                        if not match:
                            raise ValueError('translated line number mismatch')
                        output.append(match.group(1))
                    for item, translated in zip(items, output):
                        done[item['id']] = translated
                    completed += len(items)
                    save()
                    print(f'{lang}/{kind}: {len(done)}/{len(rows)} saved', flush=True)
                except (aiohttp.ClientError, asyncio.TimeoutError, ValueError, KeyError, TypeError, IndexError) as exc:
                    failed.append(f'{type(exc).__name__}: {str(exc)[:160]}')
                    stop.set()
                finally:
                    queue.task_done()
        await asyncio.gather(*(worker() for _ in range(concurrency)))
    save()
    if failed:
        print(f'Stopped; checkpoint saved. {failed[0]}', file=sys.stderr)
        return 1
    print(f'Finished {len(done)}/{len(rows)} entries; review translations before publishing.')
    return 0


sys.exit(asyncio.run(run()))
