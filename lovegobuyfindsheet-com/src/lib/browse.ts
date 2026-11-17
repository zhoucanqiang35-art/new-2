import {categoryLabel, detailsUrl, featuredImage, getData, priceLabel, type Product} from "./catalog";

const form = document.querySelector<HTMLFormElement>("#search-form")!;
const query = document.querySelector<HTMLInputElement>("#query")!;
const sort = document.querySelector<HTMLSelectElement>("#sort")!;
const status = document.querySelector<HTMLElement>("#catalog-status")!;
const results = document.querySelector<HTMLElement>("#results")!;
const pagination = document.querySelector<HTMLElement>("#pagination")!;
const previous = document.querySelector<HTMLButtonElement>("#prev")!;
const next = document.querySelector<HTMLButtonElement>("#next")!;
const catalogSection = document.querySelector<HTMLElement>("#catalog")!;
const dialog = document.querySelector<HTMLDialogElement>("#image-dialog")!;
const imageInput = document.querySelector<HTMLInputElement>("#image-file")!;
const imageStatus = document.querySelector<HTMLElement>("#image-status")!;
const pageSize = 24;
let catalog: Promise<Product[]> | undefined;
let index: Promise<ArrayBuffer> | undefined;
let category = "";
let page = 1;
let visualMatches: Product[] | null = null;
let revision = 0;
let showingFeatured = true;

function products() {
  return catalog ??= getData<Product[]>("catalog.json").catch(error => { catalog = undefined; throw error; });
}
function visualIndex() {
  return index ??= fetch("/data/visual-index.bin").then(response => {
    if (!response.ok) throw new Error("Index unavailable");
    return response.arrayBuffer();
  }).catch(error => { index = undefined; throw error; });
}

function readLocation() {
  const params = new URLSearchParams(location.search);
  query.value = params.get("q") ?? "";
  category = params.get("category") ?? "";
  sort.value = params.get("sort") ?? "featured";
  if (!sort.value) sort.value = "featured";
  page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
}
function writeLocation() {
  const url = new URL(location.href);
  url.search = "";
  if (query.value.trim()) url.searchParams.set("q", query.value.trim());
  if (category) url.searchParams.set("category", category);
  if (sort.value !== "featured") url.searchParams.set("sort", sort.value);
  if (page > 1) url.searchParams.set("page", String(page));
  url.hash = "catalog";
  history.replaceState(null, "", url);
}

function productCard(product: Product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.innerHTML = '<a><div class="product-image"><img alt="" width="320" height="320" loading="lazy"></div><div class="product-copy"><span class="product-tag"></span><h3></h3><span class="product-price"><span></span><b aria-hidden="true">↗</b></span></div></a>';
  card.querySelector("a")!.href = detailsUrl(product.weidianId);
  card.querySelector("img")!.src = featuredImage(product);
  card.querySelector("h3")!.textContent = product.name;
  card.querySelector(".product-tag")!.textContent = categoryLabel(product.category);
  card.querySelector(".product-price span")!.textContent = priceLabel(product.price);
  return card;
}

function filterRows(all: Product[]) {
  const keywords = query.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const rows = (visualMatches ?? all).filter(p => {
    const text = [p.name, p.weidianId, categoryLabel(p.category)].join(" ").toLowerCase();
    return (!category || p.category === category) && keywords.every(word => text.includes(word));
  });
  if (sort.value === "latest") return rows.sort((a, b) => Number(b.id) - Number(a.id));
  if (sort.value === "asc" || sort.value === "desc") {
    const price = (p: Product) => Number(p.price) > 0 ? Number(p.price) : null;
    return rows.sort((a, b) => {
      const left = price(a);
      const right = price(b);
      if (left === null) return right === null ? 0 : 1;
      if (right === null) return -1;
      return sort.value === "asc" ? left - right : right - left;
    });
  }
  return rows;
}

async function render({scroll = false, update = true} = {}) {
  const current = ++revision;
  showingFeatured = false;
  next.textContent = "Next →";
  for (const chip of document.querySelectorAll<HTMLButtonElement>(".chip")) {
    const active = chip.dataset.category === category;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", String(active));
  }
  status.textContent = "Loading catalog…";
  pagination.hidden = true;
  try {
    const all = await products();
    if (current !== revision) return;
    const filtered = filterRows(all);
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.min(page, pageCount);
    if (update && !visualMatches) writeLocation();
    status.replaceChildren(document.createTextNode(visualMatches
      ? filtered.length + " visually similar products"
      : new Intl.NumberFormat("en").format(filtered.length) + " finds" + (query.value.trim() ? " for “" + query.value.trim() + "”" : "")));
    if (visualMatches) {
      const clear = document.createElement("button");
      clear.type = "button";
      clear.className = "link-button";
      clear.textContent = "Clear photo search";
      clear.onclick = () => { visualMatches = null; page = 1; void render(); };
      status.append(clear);
    }
    results.replaceChildren(...filtered.slice((page - 1) * pageSize, page * pageSize).map(productCard));
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "notice";
      empty.textContent = "No matches. Try a broader search or select All finds.";
      results.append(empty);
    }
    pagination.hidden = pageCount <= 1;
    previous.disabled = page <= 1;
    next.disabled = page >= pageCount;
    document.querySelector("#pages")!.textContent = page + " / " + pageCount;
    if (scroll) catalogSection.scrollIntoView({block: "start"});
  } catch {
    if (current !== revision) return;
    status.textContent = "The catalog could not load. Try searching again.";
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  visualMatches = null;
  category = "";
  page = 1;
  void render({scroll: true});
});
for (const control of document.querySelectorAll<HTMLElement>("[data-category]")) {
  control.addEventListener("click", event => {
    if (event instanceof MouseEvent && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    event.preventDefault();
    category = control.dataset.category ?? "";
    query.value = "";
    visualMatches = null;
    page = 1;
    void render({scroll: control.tagName === "A"});
  });
}
sort.addEventListener("change", () => { page = 1; void render(); });
previous.addEventListener("click", () => { page--; void render({scroll: true}); });
next.addEventListener("click", () => { if (!showingFeatured) page++; void render({scroll: true}); });
for (const button of document.querySelectorAll("[data-image-trigger]")) {
  button.addEventListener("click", () => { imageStatus.textContent = ""; dialog.showModal(); });
}
dialog.addEventListener("close", () => { imageInput.value = ""; });

async function fingerprint(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image processing unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 8, 8);
    ctx.drawImage(bitmap, 0, 0, 8, 8);
    return ctx.getImageData(0, 0, 8, 8).data.filter((_, offset) => offset % 4 !== 3);
  } finally {
    bitmap.close();
  }
}

imageInput.addEventListener("change", async () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/") || file.size > 12 * 1024 ** 2) {
    imageStatus.textContent = "Choose an image under 12 MB.";
    return;
  }
  imageStatus.textContent = "Finding similar catalog photos…";
  imageInput.disabled = true;
  try {
    const [all, buffer, rgb] = await Promise.all([products(), visualIndex(), fingerprint(file)]);
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    const scores = new Map<number, number>();
    const width = 194;
    if (!bytes.length || bytes.length % width) throw new Error("Invalid image index");
    for (let offset = 0; offset < bytes.length; offset += width) {
      const id = view.getUint16(offset, true);
      let difference = 0;
      for (let channel = 0; channel < rgb.length; channel++) difference += Math.abs(rgb[channel] - bytes[offset + 2 + channel]);
      if (difference < (scores.get(id) ?? Infinity)) scores.set(id, difference);
    }
    if (!dialog.open) return;
    visualMatches = [...scores].sort((a, b) => a[1] - b[1]).slice(0, 60).map(([id]) => all[id]).filter(Boolean);
    category = "";
    query.value = "";
    sort.value = "featured";
    page = 1;
    dialog.close();
    void render({scroll: true});
  } catch {
    imageStatus.textContent = "Could not read the photo or search the catalog. Try another image.";
  } finally {
    imageInput.disabled = false;
    imageInput.value = "";
  }
});
readLocation();
if (location.search) void render({update: false});
else {
  // Keep the editorial selection visible while enabling pagination into the full catalog.
  void products().then(all => {
    if (revision || !all.length) return;
    pagination.hidden = false;
    previous.disabled = true;
    document.querySelector("#pages")!.textContent = "Explore all " + new Intl.NumberFormat("en").format(all.length) + " finds";
    next.textContent = "Browse all →";
  }).catch(() => {});
}
