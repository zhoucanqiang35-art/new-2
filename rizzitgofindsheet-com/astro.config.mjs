import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://rizzitgofindsheet.com',
  output: 'static',
  trailingSlash: 'always',
});
