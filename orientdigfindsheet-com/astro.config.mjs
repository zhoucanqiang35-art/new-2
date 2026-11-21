import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://orientdigfindsheet.com',
  trailingSlash: 'always',
  session: false,
  adapter: cloudflare({ configPath: 'wrangler.worker.jsonc', imageService: 'passthrough', prerenderEnvironment: 'node', inspectorPort: false }),
});
