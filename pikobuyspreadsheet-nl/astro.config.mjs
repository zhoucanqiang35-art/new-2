import { defineConfig } from 'astro/config';
export default defineConfig({site:'https://pikobuyspreadsheet.at',output:'static',vite:{server:{allowedHosts:['terminal.local']}}});
