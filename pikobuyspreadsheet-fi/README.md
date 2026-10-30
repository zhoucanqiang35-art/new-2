# PikoBuy Spreadsheet Finland

This folder contains the source of the PikoBuy Spreadsheet Finland review site.

## Build

Requires Node.js compatible with Astro 7. Run `npm ci` followed by `npm run build` from this folder. The generated static site is in `dist/`; the build generates product detail pages from `public/data/catalog.json`.

## Review and deployment

The current source was copied from the review site. Its Astro site URL and noindex settings still target the review environment; update and audit them before production deployment. Uploading this folder to GitHub does not itself publish a website or configure the domain.

Product data is a snapshot from 19 October 2026. QC photos are not included in the export and are not live. Review catalog completeness, image search, purchasing links, translations and hosting configuration before launch. Do not assume that the catalog or QC information updates automatically.
