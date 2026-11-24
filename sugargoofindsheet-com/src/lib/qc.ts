import { getData } from './catalog';

interface Record {
  status: string;
  images?: { url: string; agent: string }[];
}
type Index = { [key: string]: Record };

export {itemFromInput} from './search-query.mjs';

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
