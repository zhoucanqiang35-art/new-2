import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://rizzitgofindsheet-com.pages.dev',
  output: 'static',
  trailingSlash: 'always',
});
