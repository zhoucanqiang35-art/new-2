import {getData} from "./catalog";

interface QcRecord {
  status: string;
  images?: {url: string; agent: string}[];
}
type QcIndex = Record<string, QcRecord>;
let qc: Promise<[QcIndex, QcIndex]> | undefined;
function records() {
  return qc ??= Promise.all([getData<QcIndex>("qc.json"), getData<QcIndex>("qc-featured.json")])
    .catch(error => { qc = undefined; throw error; });
}

export function itemFromInput(input: string) {
  const value = input.trim();
  if (/^\d{5,20}$/.test(value)) return value;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : "https://" + value);
    const host = url.hostname.toLowerCase();
    const id = host === "lovegobuy.com" || host === "www.lovegobuy.com"
      ? (url.searchParams.get("shop_type") === "weidian" ? url.searchParams.get("id") : null)
      : host === "weidian.com" || host.endsWith(".weidian.com") ? url.searchParams.get("itemID") ?? url.searchParams.get("itemId") : null;
    return id && /^\d{5,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export async function showQc(id: string, status: HTMLElement, gallery: HTMLElement, isCurrent = () => true) {
  gallery.replaceChildren();
  status.textContent = "Checking preview QC records…";
  try {
    const [states, featured] = await records();
    if (!isCurrent()) return false;
    const record = featured[id] ?? states[id];
    if (record?.images?.length) {
      status.textContent = record.images.length + " verified warehouse photos from the FindSpreadsheet QC feed.";
      gallery.replaceChildren(...record.images.map((photo, index) => {
        const link = document.createElement("a");
        link.href = photo.url;
        link.target = "_blank";
        link.rel = "noopener";
        const image = new Image();
        image.src = photo.url;
        image.alt = "Warehouse QC photo " + (index + 1) + (photo.agent ? " from " + photo.agent : "");
        image.loading = "lazy";
        image.width = image.height = 220;
        link.append(image);
        return link;
      }));
      return true;
    } else {
      status.textContent = record?.status === "none"
        ? "The saved FindSpreadsheet check returned no warehouse photos for this item."
        : record?.status === "pending"
          ? "The saved FindSpreadsheet check was pending for this item."
          : "This item has no verified QC record in the preview.";
    }
  } catch {
    if (isCurrent()) status.textContent = "QC records could not load. Try again.";
  }
  return false;
}
