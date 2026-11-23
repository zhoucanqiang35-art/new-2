import { defineConfig } from 'astro/config';
import { productionOrigin, previewOrigin } from './src/lib/seo.js';

const branch = process.env.CF_PAGES_BRANCH ?? process.env.WORKERS_CI_BRANCH;

export default defineConfig({
  site: branch === 'main' ? productionOrigin : previewOrigin,
  output: 'static',
  outDir: './dist/client',
});
