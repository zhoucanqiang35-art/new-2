# Litbuy Sheet Lab

Astro static catalog deployed from `litbuysheetlab-com` to Cloudflare Pages.

- 8,911 product detail pages, with source item IDs and historical CNY reference prices.
- Compact two-column language/currency menus. English/USD on first use; saved choices persist, and explicit language changes select a corresponding currency.
- Seller batch/colour/size options come from FindSpreadsheet `api/Goods/getSkuData`; the currently cached reference item RS337 includes 21 colour images. Options preview the product photo and source variant reference; checkout and stock confirmation remain on Litbuy.
- The shared detail template contains no related-product recommendations. Source options are cached for 112 items; other valid catalog IDs read the public main-site SKU feed directly, with `/api/sku` as a fallback. A failed source request shows a retry/open-platform message rather than replacing colours with generic gallery pictures.
- Seven guide screenshots contain responsive SVG arrows and step labels.
- All 12 homepage FAQ questions remain in three expandable topic groups.
- Image search ranks products plus local page/guide illustrations. The published index has 56,161 image entries. Of the 43,360 images in this site's known catalog/seller inventory, 43,359 were retrievable and indexed; one unavailable source image is reported rather than fabricated. Source options newly fetched after publication require a later index refresh.
- Analytics `G-QXBPND9VPN`, Bing verification and the generated 8,931-URL sitemap remain in the base layout/build.

## Build and verify

`npm ci`, `npm run build`, `npm test`.

Cloudflare builds `dist`; `functions/api/sku.js` serves only known catalog seller IDs. `/product/?id=` preserves its existing server redirect. `_routes.json` limits Functions to the legacy product route and the SKU endpoint.

## Refresh public source data

From this folder, run `python scripts/collect-options.py` only while the upstream is healthy. It uses bounded concurrency, cached files and stops on rate limits or repeated source failures. Temporary public responses are ignored by Git. Run `node scripts/package-options.mjs` to package successful option snapshots. For the image index, remove `.cache/options-finished`, run `python scripts/expand-image-index.py`, then create `.cache/options-finished` when source collection finishes. The builder drains newly discovered images and records actual coverage; unavailable images must not be counted as searchable. Commit the updated snapshot and hashed/current index manifest together.
