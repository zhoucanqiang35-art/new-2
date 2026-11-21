# Production build

Run `npm ci` and `npm run build:pages` for the final ootdbuyfindsheet.com deployment. For Cloudflare Pages Git integration, use `main`, root directory `ootdbuyfindsheet-com`, build command `npm run build:pages`, output directory `dist`, and Node `24.22.3`. Publish `dist/` and verify HTTPS, the homepage canonical, /robots.txt, and /sitemap.xml against the final host. Build public previews with the normal `npm run build` command so they retain noindex.

The sitemap lists editorial routes, categories, and selected pre-rendered products. The query-driven /item/ viewer and the image/QC tools remain outside the sitemap. Use the final hostname when submitting the sitemap.

Set `PUBLIC_QC_ENDPOINT` to an approved QC gateway that serves both the production and preview origins if the upstream blocks the default gateway. On upstream errors the visitor sees an error or an explicitly labeled saved photo, rather than a false empty result.
