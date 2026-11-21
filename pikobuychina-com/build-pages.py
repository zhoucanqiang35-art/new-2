"""Rebuild the PikobuyChina Cloudflare Pages output from the bundled inputs."""
import base64
import hashlib
import json
import subprocess
import sys
import tarfile
from pathlib import Path
from tempfile import TemporaryDirectory

ROOT = Path(__file__).resolve().parent
INPUTS = ROOT / 'build-inputs'
with TemporaryDirectory(prefix='pikobuychina-') as scratch:
    archive = Path(scratch) / 'inputs.tar.gz'
    digest = hashlib.sha256()
    with archive.open('wb') as output:
        for part in sorted(INPUTS.glob('catalog-*.b64')):
            data = base64.b64decode(part.read_bytes(), validate=True)
            output.write(data)
            digest.update(data)
    if digest.hexdigest() != (INPUTS / 'sha256.txt').read_text().strip():
        raise SystemExit('The PikobuyChina build inputs are incomplete or mismatched.')
    with tarfile.open(archive, 'r:gz') as package:
        package.extractall(ROOT, filter='data')

subprocess.run([sys.executable, 'build.py', '--production'], cwd=ROOT, check=True)
dist = ROOT / 'dist'
locales = json.loads((ROOT / 'locales.json').read_text())
for doc in sorted(dist.rglob('index.html')):
    relative = doc.parent.relative_to(dist)
    if relative == Path('.') or relative.as_posix() in locales:
        continue
    doc.rename(dist / (relative.as_posix() + '.html'))
subprocess.run(['node', 'build-assets.mjs', '--production', str(dist)], cwd=ROOT, check=True)
