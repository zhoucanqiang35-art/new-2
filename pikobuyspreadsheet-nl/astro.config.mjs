import { defineConfig } from 'astro/config';
export default defineConfig({site:'https://pikobuyspreadsheet.nl',output:'static',vite:{server:{allowedHosts:['terminal.local']}}});
