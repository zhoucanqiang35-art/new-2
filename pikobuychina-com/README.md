# PikobuyChina

Cloudflare Pages project for pikobuychina.com. Configure `main` as the production branch, `pikobuychina-com` as the root directory, `npm run build` as the build command and `dist` as the output directory. Use Node 24 and Python 3.12 or later.

Run `npm ci` and `npm run build` from this directory. The build checks the bundled catalogue, visual index, images, original page corpus and translations against the checksum in `build-inputs/sha256.txt`. Those inputs are stored as numbered archive parts. The code itself is tracked as ordinary source files.

The build emits static pages and an advanced-mode `_worker.js` for catalogue search, product detail, related products and warehouse QC. Search uses current FindSpreadsheet results and the synchronized snapshot as independent sources. This site is an independent catalogue.
