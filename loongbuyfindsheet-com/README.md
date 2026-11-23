# LoongBuy Findsheet

This Astro project lives in the `loongbuyfindsheet-com` directory of the
`zhoucanqiang35-art/new-2` repository.

## Cloudflare Workers Builds

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Worker name | `loongbuyfindsheet-com` |
| Root directory | `loongbuyfindsheet-com` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Build watch path | `loongbuyfindsheet-com/*` |

Astro outputs the pages and assets to `dist/client`. The Cloudflare Worker
handles `/api/qc` and serves its static assets through the `ASSETS`
binding. Use Node 24.

```sh
npm ci
npm run build
npx wrangler deploy --dry-run
```

Cloudflare builds on `main` use the production canonical URLs and sitemap.
Other branches and local builds default to the preview origin and block crawlers.

## Cloudflare Pages

Connect the same repository with production branch `main`, root directory
`loongbuyfindsheet-com`, build command `npm run build:pages`, and output directory
`dist/client`. Set the build watch path to `loongbuyfindsheet-com/*`. The Pages
Function for `/api/qc` reuses the same handler as the Workers build.
