# iTaoBuy Spreadsheet

Run `npm ci` and `npm run build` with Node 24. The build restores the catalog and images from the ordered archives in `assets/` and generates the static site in `dist/`.

For Cloudflare Pages, use `itaobuyfindsheet-com` as the root directory, `npm run build` as the build command, and `dist` as the output directory. Set the production branch to `main`.
