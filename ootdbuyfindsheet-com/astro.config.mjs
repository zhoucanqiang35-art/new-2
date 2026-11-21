import { defineConfig } from 'astro/config';
import { writeFile } from 'node:fs/promises';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  integrations: [{
    name: 'preview-indexing-headers',
    hooks: {
      async 'astro:build:done'({dir}) {
        if (process.env.SITE_INDEXABLE !== '1') {
          await writeFile(new URL('_headers', dir), '/*\n  X-Robots-Tag: noindex, follow\n');
        }
      },
    },
  }],
});
