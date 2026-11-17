import { defineConfig } from 'astro/config';
import { productionOrigin, previewOrigin } from './src/lib/seo.js';

export default defineConfig({
  site: process.env.CF_PAGES_BRANCH === 'main' ? productionOrigin : previewOrigin,
  output: 'static',
  outDir: './dist/client',
});
