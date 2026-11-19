import {categoryLabel, getData, highlighted, type Product} from "./catalog";
import {translate} from "./language-picker";
import {productName} from "./product-names";
import {productCard} from "./product-card";
import {setupBrowseGrid} from "./browse-grid";

const query = document.querySelector<HTMLInputElement>("#query")!;
const sort = document.querySelector<HTMLSelectElement>("#sort")!;
const status = document.querySelector<HTMLElement>("#catalog-status")!;
const results = document.querySelector<HTMLElement>("#results")!;
const pagination = document.querySelector<HTMLElement>("#pagination")!;
const previous = document.querySelector<HTMLButtonElement>("#prev")!;
const next = document.querySelector<HTMLButtonElement>("#next")!;
const catalogSection = document.querySelector<HTMLElement>("#catalog")!;
const smallViewport = matchMedia("(max-width: 640px)");
const catalogPageSize = () => smallViewport.matches ? (location.pathname === "/browse/" ? 12 : 8) : 24;
let pageSize = catalogPageSize();
let catalog: Promise<Product[]> | undefined;
let category = "";
let page = 1;
let revision = 0;
let showingFeatured = true;
const gridTemplate = document.querySelector<HTMLTemplateElement>("#browse-card-template");
const grid = gridTemplate && setupBrowseGrid(gridTemplate, (resetPage) => {
  if (resetPage) page = 1;
  void render({update: true});
});
const featuredRank = new Map(highlighted.map((id, index) => [id, index]));

function products() {
  return catalog ??= getData<Product[]>("catalog.json").catch(error => { catalog = undefined; throw error; });
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
  for (const key of ["q", "category", "sort", "page"]) url.searchParams.delete(key);
  if (query.value.trim()) url.searchParams.set("q", query.value.trim());
  if (category) url.searchParams.set("category", category);
  if (sort.value !== "featured") url.searchParams.set("sort", sort.value);
  if (page > 1) url.searchParams.set("page", String(page));
  url.hash = "catalog";
  history.replaceState(null, "", url);
}

function filterRows(all: Product[]) {
  const keywords = query.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const rows = all.filter(p => {
    const text = [p.name, productName(p.weidianId, p.name), p.weidianId, categoryLabel(p.category), translate(categoryLabel(p.category))].join(" ").toLowerCase();
    return (!grid || grid.accepts(p)) && (!category || p.category === category) && keywords.every(word => text.includes(word));
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
  if (grid) return rows.sort((a, b) => (featuredRank.get(a.id) ?? highlighted.length) - (featuredRank.get(b.id) ?? highlighted.length));
  return rows;
}

async function render({scroll = false, update = true} = {}) {
  const current = ++revision;
  showingFeatured = false;
  next.textContent = "Next";
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
    if (update) writeLocation();
    const count = new Intl.NumberFormat("en").format(filtered.length);
    status.textContent = count + (filtered.length === 1 ? " find" : " finds")
      + (query.value.trim() ? " for “" + query.value.trim() + "”" : "");
    results.replaceChildren(...filtered.slice((page - 1) * pageSize, page * pageSize).map(product => grid ? grid.card(product) : productCard(product)));
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "notice";
      empty.textContent = grid?.favorites ? "No saved products match these filters." : "No matches. Try a broader search or select All finds.";
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

for (const control of document.querySelectorAll<HTMLElement>("[data-category]")) {
  control.addEventListener("click", event => {
    if (event instanceof MouseEvent && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    event.preventDefault();
    category = control.dataset.category ?? "";
    query.value = "";
    page = 1;
    void render({scroll: control.tagName === "A"});
  });
}
sort.addEventListener("change", () => { page = 1; void render(); });
previous.addEventListener("click", () => { page--; void render({scroll: true}); });
next.addEventListener("click", () => { if (!showingFeatured) page++; void render({scroll: true}); });
readLocation();
if (query.value || category || sort.value !== "featured" || page > 1 || location.pathname === "/browse/") void render({update: false});
else {
  // Keep the editorial selection visible while enabling pagination into the full catalog.
  void products().then(all => {
    if (revision || !all.length) return;
    pagination.hidden = false;
    previous.disabled = true;
    document.querySelector("#pages")!.textContent = "Explore all " + new Intl.NumberFormat("en").format(all.length) + " finds";
    next.textContent = "Browse all";
  }).catch(() => {});
}

document.addEventListener("catalog-language-changed", () => {
  if (grid || query.value.trim()) void render({update: false});
});

smallViewport.addEventListener("change", () => {
  const firstResult = (page - 1) * pageSize;
  pageSize = catalogPageSize();
  page = Math.floor(firstResult / pageSize) + 1;
  if (!showingFeatured) void render();
});
