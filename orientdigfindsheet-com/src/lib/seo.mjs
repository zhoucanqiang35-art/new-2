export const siteOrigin = 'https://orientdigfindsheet.com';
export const indexable = import.meta.env.PUBLIC_ORIENTDIG_INDEXABLE === 'true';

export function canonicalUrl(path) {
  return new URL(path, siteOrigin).href;
}
