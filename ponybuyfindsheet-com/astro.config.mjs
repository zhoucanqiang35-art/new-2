import { defineConfig } from 'astro/config';

const cloudflareProduction = process.env.CF_PAGES === '1' && process.env.CF_PAGES_BRANCH === 'main';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_ORIGIN || (cloudflareProduction ? 'https://ponybuyfindsheet.com' : undefined),
  trailingSlash: 'always',
});
