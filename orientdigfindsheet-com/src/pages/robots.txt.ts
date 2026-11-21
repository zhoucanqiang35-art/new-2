import type { APIRoute } from 'astro';
import { canonicalUrl, indexable } from '../lib/seo.mjs';

export const prerender = true;

export const GET: APIRoute = () => new Response(
  indexable ? 'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ' + canonicalUrl('/sitemap.xml') + '\n'
    : 'User-agent: *\nDisallow: /\n',
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
