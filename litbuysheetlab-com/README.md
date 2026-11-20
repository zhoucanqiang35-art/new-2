# Litbuy Sheet Lab

Astro static catalog for https://litbuysheetlab.com, deployed by Cloudflare Pages from this source directory.

## Build and checks

- Root directory: `litbuysheetlab-com`
- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`
- Regression checks after build: `npm test` and `npm run preview:check`

The build generates 8,911 product pages and 11 category pages from the source catalog, plus the main and information pages. `/sitemap.xml` is generated at build time and includes 8,931 canonical URLs. Do not upload an old `dist` directory in place of building current source. Build output is intentionally ignored by Git.

## Catalog and prices

All source records are retained, including items without a valid Weidian number. Only valid seller IDs receive direct buying-agent links. The data snapshot is dated 2026-10-19; prices are reference CNY amounts, not live Litbuy quotes. Currency estimates use Frankfurter reference rates and show the reference date. Failed rate requests retain original CNY or explicitly dated cached rates. Platform conversions and fees can differ.

## Images and QC

Source and seller photos are labelled as listing images, never as verified warehouse QC. Actual QC availability is not inferred from the existence of a gallery. The current client-side visual index has usable descriptors for 35,688 of 39,269 source images. Matching is approximate and missing images may not match. Uploads are processed in the browser.

## Compatibility and operations

Legacy `/product/?id=...` URLs redirect in the browser to `/products/ID/`. Product pages are rendered in the initial HTML and do not download the entire catalog or all galleries. The English homepage also uses pre-rendered product cards. Catalog filters and paging retain keywords, category, price bounds, image-result state and sorting in the URL.

Existing GA4 measurement `G-QXBPND9VPN`, Bing verification and referral destinations are preserved. Privacy, about, contact-routing and referral-disclosure pages explain the independent role of this site. Contact details are not invented. Core new controls and price/QC notices are localized; unsupported new long-form translations fall back to English. Existing product title translations remain source data and may contain abbreviations.
