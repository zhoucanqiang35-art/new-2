import {sellerSpecificationsUrl, sellerVariantGroups} from "./seller-variants.mjs";

type SellerPhoto = {url: string; label: string};
type SellerVariantGroup = {name: string; options: SellerPhoto[]};
const snapshotPrefixes = new Set(["7868", "7869", "7870", "7872", "7873"]);

async function cachedVariants(item: string): Promise<SellerVariantGroup[]> {
  const prefix = item.slice(0, 4);
  if (!snapshotPrefixes.has(prefix)) return [];
  try {
    const response = await fetch("/seller-photos/" + prefix + ".json.gz");
    if (!response.ok || !response.body) return [];
    const stream = response.body.pipeThrough(new DecompressionStream("gzip"));
    const snapshots: Record<string, SellerPhoto[]> = await new Response(stream).json();
    const options = (snapshots[item] ?? []).filter(option => option.label.trim());
    return options.length ? [{name: "", options}] : [];
  } catch {
    return [];
  }
}

async function loadVariants(item: string): Promise<SellerVariantGroup[] | null> {
  const live = async () => {
    const response = await fetch(sellerSpecificationsUrl(item), {
      credentials: "omit",
      signal: AbortSignal.timeout(6500),
    });
    if (!response.ok) throw new Error("Seller specifications unavailable");
    return sellerVariantGroups(await response.json(), item) as SellerVariantGroup[];
  };
  const proxy = async () => {
    const response = await fetch("/api/seller-photos?id=" + encodeURIComponent(item), {
      signal: AbortSignal.timeout(6500),
    });
    if (!response.ok) throw new Error("Seller specifications unavailable");
    const data: unknown = await response.json();
    if (!Array.isArray(data) || !data.every(group => typeof group.name === "string" && Array.isArray(group.options))) {
      throw new Error("Invalid seller specifications");
    }
    return data as SellerVariantGroup[];
  };
  try {
    return await live();
  } catch {
    const saved = await cachedVariants(item);
    if (saved.length) return saved;
    return proxy().catch(() => null);
  }
}

export async function showSellerPhotos(item: string, onSelect: (variant: SellerPhoto) => void) {
  const container = document.querySelector<HTMLElement>("#seller-photos")!;
  const status = document.querySelector<HTMLElement>("#seller-photo-status")!;
  const groups = await loadVariants(item);
  if (!groups?.length) {
    status.textContent = groups === null
      ? "Seller options could not load. View them on the original listing."
      : "The seller provides no images for individual options.";
    return;
  }

  for (const {name, options} of groups) {
    const section = document.createElement("div");
    section.className = "seller-variant-group";
    const heading = document.createElement("h3");
    heading.textContent = name || "Style";
    const selection = document.createElement("span");
    selection.className = "seller-variant-selection";
    selection.setAttribute("aria-live", "polite");
    selection.dataset.i18nIgnore = "";
    heading.append(selection);

    const list = document.createElement("ul");
    list.className = "seller-photos";
    for (const [index, option] of options.entries()) {
      const {url, label} = option;
      const entry = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", label || "Product option " + (index + 1));
      button.title = label || "Product option " + (index + 1);
      if (label) button.dataset.i18nIgnore = "";
      const image = new Image(48, 48);
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.referrerPolicy = "no-referrer";
      image.addEventListener("error", () => {
        entry.remove();
        if (!list.childElementCount) section.remove();
        if (!container.childElementCount) {
          status.textContent = "Seller option images could not load.";
          status.hidden = false;
        }
      }, {once: true});
      image.src = url;
      button.append(image);
      button.addEventListener("click", () => {
        clearSellerSelection();
        button.setAttribute("aria-pressed", "true");
        selection.textContent = label;
        onSelect(option);
      });
      entry.append(button);
      list.append(entry);
    }
    section.append(heading, list);
    container.append(section);
  }
  container.hidden = false;
  status.hidden = true;
}

export function clearSellerSelection() {
  document.querySelector('#seller-photos [aria-pressed="true"]')?.setAttribute("aria-pressed", "false");
  for (const name of document.querySelectorAll(".seller-variant-selection")) name.textContent = "";
}
