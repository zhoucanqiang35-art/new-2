import languages from "../languages.json";
import extraUiCopy from "../ui-copy.json";
const extraCopy:Record<string,Record<string,string>>=extraUiCopy;
import {loadProductNames, productName, useProductNames} from "./product-names";

type Dictionary = Record<string, string>;
type AttrValue = {source: string; rendered: string};
const dialog = document.querySelector<HTMLElement>("#language-dialog")!;
const trigger = document.querySelector<HTMLButtonElement>("#open-language")!;
const current = document.querySelector<HTMLElement>("#current-language")!;
const title = document.querySelector<HTMLElement>("#language-title")!;
const close = document.querySelector<HTMLButtonElement>("#close-language")!;
const status = document.querySelector<HTMLElement>("#language-status")!;
const options = [...dialog.querySelectorAll<HTMLButtonElement>("[data-language]")];
const originalNames = new WeakMap<HTMLElement, string>();
const originals = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, AttrValue>>();
const packs = new Map<string, Promise<Dictionary>>();
const localizedAttributes = ["aria-label", "alt", "placeholder", "title"];
const excluded = "script,style,noscript,svg,[data-i18n-ignore],[data-product-name],kbd";
const dynamic: [RegExp, string][] = [
  [/^Warehouse photos from the Findspreadsheet QC feed \((\d+)\)\.$/, "{0} verified warehouse photos from the FindSpreadsheet QC feed."],
  [/^Show listing photo (\d+)$/, "Show product photo {0}"],
  [/^View on (.+)$/, "View on {0}"],
  [/^Enlarge screenshot: (.+)$/, "Enlarge screenshot: {0}"],
  [/^([\d,]+) finds$/, "{0} finds"],
  [/^([\d,]+) find$/, "{0} find"],
  [/^([\d,]+) finds for “(.+)”$/, "{0} finds for “{1}”"],
  [/^([\d,]+) find for “(.+)”$/, "{0} find for “{1}”"],
  [/^Explore all ([\d,]+) finds$/, "Explore all {0} finds"],
  [/^([\d,]+) Weidian listings from FindSpreadsheet$/, "{0} Weidian listings from FindSpreadsheet"],
  [/^Search ([\d,]+) catalog, carousel and warehouse QC photos across ([\d,]+) listings\.$/, "Search {0} catalog, carousel and warehouse QC photos across {1} listings."],
  [/^Showing the (\d+) closest matches\.$/, "Showing the {0} closest matches."],
  [/^(\d+) verified warehouse photos from the FindSpreadsheet QC feed\.$/, "{0} verified warehouse photos from the FindSpreadsheet QC feed."],
  [/^Warehouse QC photo (\d+) from (.+)$/, "Warehouse QC photo {0} from {1}"],
  [/^Warehouse QC photo (\d+)$/, "Warehouse QC photo {0}"],
  [/^Listing photo (\d+)$/, "Listing photo {0}"],
  [/^Show product photo (\d+)$/, "Show product photo {0}"],
  [/^Weidian item #(\d+)$/, "Weidian item #{0}"],
  [/^(.+) · product image (\d+)$/, "{0} · product image {1}"],
];
let dictionary: Dictionary = {};
let lastDetailPageTitle = "";
let active = "en";
let request = 0;
let scheduled = false;

export function translate(source: string): string {
  if (active === "en") return source;
  const key = source.replace(/\s+/g, " ").trim();
  if (/^\$[0-9,]+\.[0-9]{2}$/.test(key)) return source;
  let value = dictionary[key] ?? dictionary[key.toLowerCase()];
  if (!value) {
    for (const [pattern, template] of dynamic) {
      const match = key.match(pattern);
      if (!match) continue;
      const translation = dictionary[template];
      if (translation && [...template.matchAll(/\{\d+\}/g)].every(([part]) => translation.includes(part))) {
        value = translation.replace(/\{(\d+)\}/g, (_, index) => template === "Enlarge screenshot: {0}" ? translate(match[1]) : (match[Number(index) + 1] ?? ""));
      }
      break;
    }
  }
  if (!value && key.endsWith(" Showing the listing gallery photos for reference.")) {
    const suffix = "Showing the listing gallery photos for reference.";
    value = translate(key.slice(0, -(suffix.length + 1))) + " " + translate(suffix);
  }
  return value ? source.replace(/\S[\s\S]*\S|\S/, () => value) : source;
}

function localizedAttr(element: Element, attribute: string) {
  const currentValue = element.getAttribute(attribute);
  if (!currentValue) return;
  const attributes = originalAttributes.get(element) ?? new Map<string, AttrValue>();
  const previous = attributes.get(attribute);
  const source = previous && previous.rendered === currentValue ? previous.source : currentValue;
  let localizedSource = source;
  const item = (element as HTMLElement).dataset.productPhoto;
  if (attribute === "alt" && item) {
    const indexed = source.match(/^(.+)( · product image \d+)$/);
    localizedSource = indexed ? productName(item, indexed[1]) + indexed[2] : productName(item, source);
  }
  const rendered = translate(localizedSource);
  attributes.set(attribute, {source, rendered});
  originalAttributes.set(element, attributes);
  if (rendered !== currentValue) element.setAttribute(attribute, rendered);
}

function apply() {
  observer.disconnect();
  try {
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const item = node as Text;
      if (item.parentElement?.closest(excluded) || (lastDetailPageTitle && item.parentElement?.matches("title")) || !item.data.trim()) continue;
      const original = originals.get(item) ?? item.data;
      originals.set(item, original);
      const value = translate(original);
      if (item.data !== value) item.data = value;
    }
    for (const el of document.querySelectorAll<HTMLElement>("[data-product-name]")) {
      const currentText = el.textContent?.trim();
      if (!currentText || !el.dataset.productName) continue;
      const original = originalNames.get(el) ?? currentText;
      originalNames.set(el, original);
      const localized = productName(el.dataset.productName!, original);
      if (currentText !== localized) el.textContent = localized;
      if (el.id === "detail-title" || el.id === "product-name") {
        const pageTitle = localized + " | Sugargoo Finds List";
        lastDetailPageTitle = pageTitle;
        if (document.title !== pageTitle) document.title = pageTitle;
      }
    }
    for (const element of document.querySelectorAll("[aria-label],[alt],[placeholder],[title],meta[name=description]")) {
      if (element.closest(excluded)) continue;
      for (const attribute of element.matches("meta") ? ["content"] : localizedAttributes) localizedAttr(element, attribute);
    }
  } finally {
    observer.observe(document.body, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: localizedAttributes});
  }
}

const observer = new MutationObserver(() => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; apply(); });
});

function preference() {
  const url = new URL(location.href).searchParams.get("lang");
  if (url && languages.some(entry => entry.code === url)) return url;
  try { return localStorage.getItem("sugargoo-language") ?? "en"; }
  catch { return "en"; }
}

async function select(code: string, save = false) {
  const selected = languages.find(entry => entry.code === code) ?? languages[0];
  const sequence = ++request;
  status.hidden = true;
  dialog.setAttribute("aria-busy", "true");
  try {
    if (selected.code !== "en" && !packs.has(selected.code)) {
      packs.set(selected.code, fetch("/locales/" + selected.code + ".json").then(response => {
        if (!response.ok) throw new Error("Could not load language");
        return response.json();
      }).catch(error => {
        packs.delete(selected.code);
        throw error;
      }));
    }
    const [loaded, products] = await Promise.all([
      selected.code === "en" ? {} : packs.get(selected.code)!,
      loadProductNames(selected.code),
    ]);
    if (request !== sequence) return;
    dictionary = Object.fromEntries(Object.entries({...loaded,...(extraCopy[selected.code]||{})}).flatMap(([key,value]) => [[key,value],[key.toLowerCase(),value]]));
    useProductNames(products);
    active = selected.code;
    document.documentElement.lang = selected.code;
    document.documentElement.dir = selected.dir;
    current.textContent = selected.name;
    title.textContent = translate("Choose a language");
    trigger.setAttribute("aria-label", translate("Language") + ": " + selected.name);
    close.setAttribute("aria-label", translate("Close language picker"));
    for (const button of options) button.setAttribute("aria-pressed", String(button.dataset.language === selected.code));
    apply();
    document.dispatchEvent(new Event("catalog-language-changed"));
    try { localStorage.setItem("sugargoo-language", selected.code); } catch {}
    if (save) {
      const url = new URL(location.href);
      url.searchParams.set("lang", selected.code);
      history.replaceState(history.state, "", url);
      closePanel(dialog.contains(document.activeElement));
    }
  } catch {
    if (request !== sequence) return;
    status.textContent = translate("Unable to load this language. Try again.");
    status.hidden = false;
  } finally {
    if (request === sequence) dialog.removeAttribute("aria-busy");
  }
}

function closePanel(returnFocus = false) {
  if (dialog.hidden) return;
  dialog.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
  if (returnFocus) trigger.focus();
}

trigger.addEventListener("click", () => {
  if (!dialog.hidden) closePanel();
  else {
    dialog.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    (options.find(button => button.getAttribute("aria-pressed") === "true") ?? options[0]).focus();
  }
});
close.addEventListener("click", () => closePanel(true));
document.addEventListener("click", event => {
  if (event.target instanceof Node && !dialog.contains(event.target) && !trigger.contains(event.target)) closePanel();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !dialog.hidden) {
    event.preventDefault();
    closePanel(true);
  }
});
for (const button of options) button.addEventListener("click", () => void select(button.dataset.language!, true));
addEventListener("popstate", () => void select(preference()));
void select(preference());
