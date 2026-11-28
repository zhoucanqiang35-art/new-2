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
    const normalized = /^https?:\/\//i.test(value) ? value : "https://" + value;
    let url = new URL(normalized);
    const agents = ["kakobuy.com", "www.kakobuy.com", "item2.kakobuy.com", "m.kakobuy.com"];
    if (agents.includes(url.hostname) && url.pathname === "/item/details") {
      url = new URL(url.searchParams.get("url") ?? "");
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.hostname !== "weidian.com" && !url.hostname.endsWith(".weidian.com")) return null;
    const id = url.searchParams.get("itemID") ?? url.searchParams.get("itemId");
    return id && /^\d{5,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function renderPhotos(gallery: HTMLElement, photos: {url: string; alt: string}[]) {
  gallery.replaceChildren(...photos.map(photo => {
    const link = document.createElement("a");
    link.href = photo.url;
    link.target = "_blank";
    link.rel = "noopener";
    const image = new Image();
    image.src = photo.url;
    image.alt = photo.alt;
    image.loading = "lazy";
    image.width = image.height = 220;
    link.append(image);
    return link;
  }));
}

export function showListingPhotos(status: HTMLElement, gallery: HTMLElement, photos: string[]) {
  status.textContent = (status.dataset.qcMessage ?? "") + " Showing the listing gallery photos for reference.";
  renderPhotos(gallery, photos.map((url, index) => ({url, alt: "Listing photo " + (index + 1)})));
}

export async function showQc(id: string, status: HTMLElement, gallery: HTMLElement, isCurrent = () => true) {
  gallery.replaceChildren();
  status.textContent = "Checking saved warehouse photos…";
  try {
    const [states, featured] = await records();
    if (!isCurrent()) return false;
    const record = featured[id] ?? states[id];
    if (record?.images?.length) {
      status.textContent = record.images.length + " verified warehouse photos from the FindSpreadsheet QC feed.";
      renderPhotos(gallery, record.images.map((photo, index) => ({
        url: photo.url,
        alt: "Warehouse QC photo " + (index + 1) + (photo.agent ? " from " + photo.agent : ""),
      })));
      return true;
    } else {
      status.dataset.qcMessage = record?.status === "none"
        ? "The saved FindSpreadsheet check returned no warehouse photos for this item."
        : record?.status === "pending"
          ? "The saved FindSpreadsheet check was pending for this item."
          : "No verified warehouse photos are saved for this item.";
      status.textContent = status.dataset.qcMessage;
    }
  } catch {
    if (isCurrent()) {
      status.dataset.qcMessage = "QC records could not load. Try again.";
      status.textContent = status.dataset.qcMessage;
    }
  }
  return false;
}
