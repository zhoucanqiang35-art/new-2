import {getData, type Product} from "./catalog";
import {productCard} from "./product-card";

const input = document.querySelector<HTMLInputElement>("#image-file")!;
const sample = document.querySelector<HTMLButtonElement>("#try-image")!;
const status = document.querySelector<HTMLElement>("#image-status")!;
const preview = document.querySelector<HTMLElement>("#image-preview")!;
const results = document.querySelector<HTMLElement>("#image-results")!;
const more = document.querySelector<HTMLButtonElement>("#image-more")!;
const channels = 192;
const rowBytes = channels + 2;
const pageSize = 24;
type Match = {product: Product; image: string};
let matches: Match[] = [];
let shown = 0;
let previewUrl: string | undefined;

async function loadIndex() {
  const [products, urls, response] = await Promise.all([
    getData<Product[]>("catalog.json"),
    getData<string[]>("visual-photos.json"),
    fetch("/data/visual-index.bin"),
  ]);
  if (!response.ok) throw new Error("Image index unavailable");
  const buffer = await response.arrayBuffer();
  if (!urls.length || buffer.byteLength !== urls.length * rowBytes) throw new Error("Invalid image index");
  return {products, urls, view: new DataView(buffer), bytes: new Uint8Array(buffer)};
}
let index: ReturnType<typeof loadIndex> | undefined;

async function fingerprint(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 8;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing unavailable");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, 8, 8);
    context.drawImage(bitmap, 0, 0, 8, 8);
    return context.getImageData(0, 0, 8, 8).data.filter((_, offset) => offset % 4 !== 3);
  } finally {
    bitmap.close();
  }
}

function showMore() {
  const next = matches.slice(shown, shown + pageSize);
  results.append(...next.map(match => productCard(match.product, match.image)));
  shown += next.length;
  more.hidden = shown >= matches.length;
}

more.addEventListener("click", showMore);
input.addEventListener("change", async () => {
  const file = input.files?.[0];
  if (!file) return;
  input.value = "";
  void search(file);
});

sample.addEventListener("click", async () => {
  input.disabled = sample.disabled = true;
  try {
    const response = await fetch("/home/7953.webp");
    if (!response.ok) throw new Error("Sample photo unavailable");
    await search(new File([await response.blob()], "Crossbody bag.webp", {type: "image/webp"}));
  } catch {
    status.textContent = "The sample photo could not load. Try choosing your own photo.";
  } finally {
    input.disabled = sample.disabled = false;
  }
});

async function search(file: File) {
  if (!file.size || (file.type && !file.type.startsWith("image/")) || file.size > 12 * 1024 ** 2) {
    status.textContent = "Choose a readable image under 12 MB.";
    return;
  }
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  preview.querySelector("img")!.src = previewUrl;
  preview.querySelector("figcaption")!.textContent = file.name;
  preview.hidden = false;
  results.replaceChildren();
  more.hidden = true;
  status.textContent = "Searching product photos…";
  input.disabled = sample.disabled = true;
  try {
    index ??= loadIndex().catch(error => { index = undefined; throw error; });
    const [{products, urls, view, bytes}, rgb] = await Promise.all([index, fingerprint(file)]);
    const best = new Map<number, {score: number; row: number}>();
    for (let row = 0; row < urls.length; row++) {
      const offset = row * rowBytes;
      const id = view.getUint16(offset, true);
      let score = 0;
      for (let channel = 0; channel < channels; channel++) {
        score += Math.abs(rgb[channel] - bytes[offset + 2 + channel]);
      }
      if (products[id] && score < (best.get(id)?.score ?? Infinity)) best.set(id, {score, row});
    }
    matches = [...best].sort((a, b) => a[1].score - b[1].score).slice(0, 120)
      .map(([id, match]) => ({product: products[id], image: urls[match.row]}));
    shown = 0;
    showMore();
    status.textContent = matches.length ? "Showing the " + matches.length + " closest matches." : "No matches found.";
  } catch {
    status.textContent = "Could not read this photo or load the search index. Try another image.";
  } finally {
    input.disabled = sample.disabled = false;
  }
}
