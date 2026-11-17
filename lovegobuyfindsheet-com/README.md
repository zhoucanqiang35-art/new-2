# LoveGoBuy Findsheet

Independent LoveGoBuy catalog preview using Astro 7 SSG and FindSpreadsheet exports. Keep this directory next to litbuysheetlab-com, usfansfindsheet-com, and loongbuyfindsheet-com in new-2. The build prepares the preview data from those directories when generated files are absent.

## Run locally

Use Node 22.23.4 or later and Python 3.

1. Run npm ci.
2. Run npm run build to prepare the catalog and produce dist/.
3. Run npm run preview to serve the built site.

Run npm run dev after preparing the data for development. Refresh the source exports and rerun scripts/prepare-catalog.py with the parent repository as its argument to refresh the generated catalog. Rebuild the visual index with scripts/build-visual-index.py and the two source image-index snapshots. Use the shipped --supplement scripts/image-supplement.json.gz with --offline for the current snapshots. Fetching new vectors from source photos requires Pillow.

## Cloudflare Pages

Connect the new-2 repository to a Pages project named lovegobuyfindsheet-com. Configure main as the production branch, lovegobuyfindsheet-com as the root directory, npm run build as the build command, and dist as the output directory. The repository pins Node 24.22.1. The build uses Python 3 and reads the sibling data directories from the same Git checkout.

The preview declares noindex and blocks crawlers in robots.txt. Update indexing settings as part of a public domain rollout.
