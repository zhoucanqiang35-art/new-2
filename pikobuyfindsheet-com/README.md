# Pikobuy Findsheet

FindSpreadsheet subsite for `pikobuyfindsheet.com`. Astro renders the homepage, spreadsheet, category pages and buying guides. English is the default and the language selector loads 21 additional translation dictionaries.

## Development

- Install with `npm ci` using the version in `.node-version`.
- Run `npm run dev` for the Astro site.
- Run `npm run refresh:catalog` to follow the complete public FindSpreadsheet catalog pagination. This refreshes the local search, sorting and category data.
- Rebuild the visual index after changing the catalog. Run `python3 scripts/build-image-index.py PATH_TO_SHARED_INDEX` with Pillow installed. The shared index directory contains the original catalog JSON, photo manifest and 8-by-8 RGB index. The builder associates existing photo descriptors by listing path and fetches galleries and photos for additional listings.
- Run `node scripts/merge-listing-galleries.mjs` after the visual index is rebuilt. It adds matched FindSpreadsheet listing images to the static product galleries.
- Run `python3 scripts/build-qc-image-index.py` after changing the saved QC photos to include them in image search.
- The translation dictionaries are prebuilt assets. After editorial changes, build the site, then run `python3 scripts/generate-language-dictionaries.py PATH_TO_M2M100_MODEL`. Run `python3 scripts/generate-language-dictionaries.py --check` after building to check for untranslated keys. See the script for model and Python dependencies.
- Run `python3 scripts/check-product-images.py` during catalog maintenance to check upstream covers for popular single-photo listings. Use `--limit 0` to check every single-photo listing.
- Run `npm run build` to produce `dist`. For local testing with the Pages Functions, run `npx wrangler pages dev dist` from the project root.

## Cloudflare Pages

Use this directory as the project root, `npm run build` as the build command and `dist` as the output directory. Keep the project-root `functions/` directory. Set `PUBLIC_SITE_INDEXABLE=true` for the verified production domain. Preview builds retain `noindex,follow`. Set the Pages root directory to `pikobuyfindsheet-com` when deploying from the monorepo.

## FindSpreadsheet integration

| Feature | Source |
| --- | --- |
| Catalog, filters and sorting | Snapshot of all public directory pages at the last refresh |
| Keyword search | Renders snapshot results first and adds available live results |
| Listing details and photos | Public FindSpreadsheet detail when available, with snapshot fallback. The public Weidian SKU data exposed by FindSpreadsheet supplies the seller carousel and style and size choices. The detail page loads a single listing before requesting related products. Main-site photos use resized sources, original URLs and local thumbnails, including backups for high-traffic single-photo listings. |
| Warehouse QC | FindSpreadsheet QC endpoint via same-origin API, with dated public QC snapshots for selected products |
| Image search | Browser-side comparison against indexed product covers, seller galleries and saved warehouse QC photos. The browser retains the latest index version between visits. |
| Agent and currency selection | Shared agent link templates and dated CNY exchange-rate estimates from Frankfurter. Currency follows the selected language until manually overridden. |

Product links use the verified Weidian ID when available. Listings without an ID remain browsable and link to their FindSpreadsheet source. The default USD price uses the main site's display rate. Other currency conversions use the dated reference rates. Checkout charges appear on the selected agent’s site.
