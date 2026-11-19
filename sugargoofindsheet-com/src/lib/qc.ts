import { getData } from './catalog';

interface Record {
  status: string;
  images?: { url: string; agent: string }[];
}
type Index = { [key: string]: Record };

export function itemFromInput(input: string) {
  const value = input.trim();
  if (/^\d{5,20}$/.test(value)) return value;
  try {
    let url = new URL(/^https?:\/\//i.test(value) ? value : 'https://' + value);
    if (url.hostname === 'sugargoo.com' || url.hostname === 'www.sugargoo.com') {
      const route = new URL(url.hash ? url.hash.slice(1) : url.pathname + url.search, url.origin);
      url = new URL(route.searchParams.get('productLink') ?? '');
    }
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    if (url.hostname !== 'weidian.com' && !url.hostname.endsWith('.weidian.com')) return null;
    const id = url.searchParams.get('itemID') ?? url.searchParams.get('itemId');
    return id && /^\d{5,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export async function lookupQc(id: string, status: HTMLElement, gallery: HTMLElement, isCurrent = () => true) {
  status.textContent = 'Checking saved warehouse photos…';
  gallery.replaceChildren();
  try {
    const [checks, featured] = await Promise.all([getData<Index>('qc.json'), getData<Index>('qc-featured.json')]);
    if (!isCurrent()) return;
    const record = featured[id] ?? checks[id];
    const photos = record?.images ?? [];
    if (!photos.length) {
      status.textContent = record?.status === 'none'
        ? 'The saved check found no warehouse photos for this listing.'
        : 'No warehouse photos are available in the preview for this listing.';
      return;
    }

    status.textContent = 'Warehouse photos from the Findspreadsheet QC feed (' + photos.length + ').';
    gallery.replaceChildren(...photos.map((photo, index) => {
      const link = document.createElement('a');
      link.href = photo.url;
      link.target = '_blank';
      link.rel = 'noopener';
      const image = new Image();
      image.src = photo.url;
      image.alt = 'Warehouse QC photo ' + (index + 1) + (photo.agent ? ' via ' + photo.agent : '');
      image.width = image.height = 260;
      image.loading = 'lazy';
      link.append(image);
      return link;
    }));
  } catch {
    if (isCurrent()) status.textContent = 'The QC lookup could not load. Please try again.';
  }
}
