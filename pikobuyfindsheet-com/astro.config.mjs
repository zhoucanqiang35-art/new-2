import {defineConfig} from 'astro/config';
export default defineConfig({
  site: 'https://pikobuyfindsheet.com',
  output: 'static',
  trailingSlash: 'always',
  build: {format: 'directory'},
});
