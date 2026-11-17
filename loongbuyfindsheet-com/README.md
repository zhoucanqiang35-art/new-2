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

This import retains the preview site's crawler directives and canonical URLs.
Review indexing and canonical URLs when promoting the site to the custom domain.
