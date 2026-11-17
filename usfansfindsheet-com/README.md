# USFans Findsheet

Independent USFans product discovery site. This project lives in the
`usfansfindsheet-com` folder of the shared repository.

## Cloudflare Workers Builds

| Setting | Value |
| --- | --- |
| Repository | `zhoucanqiang35-art/new-2` |
| Production branch | `main` |
| Root directory | `usfansfindsheet-com` |
| Worker name | `usfansfindsheet-com` |
| Build command | `npm run build:cloudflare` |
| Deploy command | `npm run deploy:cloudflare` |
| Build watch path | `usfansfindsheet-com/*` |

Cloudflare binds the Astro pages, assets and image index from `dist/client`.
The Worker entry point in `dist/server/index.js` renders product and catalog
routes and serves the search and QC APIs. Use the Node version in
`.node-version`.

```sh
npm ci
npm run build:cloudflare
npm run deploy:cloudflare -- --dry-run
```

For an authenticated manual deploy, run `npm run deploy:cloudflare` after
building. Use Workers & Pages → the Worker → Settings → Domains & Routes to
attach `usfansfindsheet.com` once it is active in the same Cloudflare account.

The imported preview preserves its noindex setting. The checked-in image index
records its scope, including external galleries and QC data that could not be
collected. Indexed FindSpreadsheet QC results resolve through the live public
image endpoint. Historical snapshot references carry no reusable signatures.

Cloudflare builds validate the homepage, search API and every image-index shard
before deploying. Each deployment message includes the source revision.
Check the live source revision at `https://usfansfindsheet.com/api/health`.

## Cloudflare Pages

Connect the same GitHub repository and set production branch to `main`.
Use root directory `usfansfindsheet-com`, build command `npm run build:pages`,
output directory `dist/client` and include path `usfansfindsheet-com/*`.
Use Node 24. The Pages advanced-mode entry point is generated as
`dist/client/_worker.js` so dynamic catalog and search routes remain available.
