# LoveGoBuy Findsheet

Independent LoveGoBuy catalog preview using Astro 7 SSG and FindSpreadsheet exports. Keep this directory next to litbuysheetlab-com and usfansfindsheet-com in new-2. The build prepares the preview data from those directories when generated files are absent.

## Run locally

Use Node 22.23.4 or later and Python 3.

1. Run npm ci.
2. Run npm run build to prepare the catalog and produce dist/.
3. Run npm run preview to serve the built site.

Run npm run dev after preparing the data for development. Refresh the source exports and rerun scripts/prepare-catalog.py with the parent repository as its argument to refresh the generated catalog. Rebuild the visual index with scripts/build-visual-index.py and the two source image-index snapshots. Use the shipped --supplement scripts/image-supplement.json.gz with --offline for the current snapshots. Fetching new vectors from source photos requires Pillow.

Cloudflare Workers static assets can use this directory as the root, npm run build as the build command, and npx wrangler deploy as the deployment command. The preview declares noindex and blocks crawlers in robots.txt. Production domain and indexing configuration are awaiting production rollout.
