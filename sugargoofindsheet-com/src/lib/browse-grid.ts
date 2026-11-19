import { catalogAgents, defaultCatalogAgent } from "./agents";
import { categoryLabel, detailsUrl, featuredImage, priceLabel, type Product } from "./catalog";
import currencyData from "../../public/data/rates.json";

const rates: Record<string, number> = currencyData.rates;

function readPreference(key: string): string | null {
  try { return localStorage.getItem("sugargoo-browse-" + key); }
  catch { return null; }
}

function keepPreference(key: string, value: string) {
  try { localStorage.setItem("sugargoo-browse-" + key, value); }
  catch { /* Preferences remain available in the current tab. */ }
}

function savedItems(): Set<string> {
  try {
    const saved: unknown = JSON.parse(readPreference("saved") ?? "[]");
    return new Set(Array.isArray(saved) ? saved.filter((item): item is string => typeof item === "string") : []);
  } catch { return new Set(); }
}

export function setupBrowseGrid(template: HTMLTemplateElement, refresh: (resetPage?: boolean) => void) {
  const menu = document.querySelector<HTMLDetailsElement>("#market-options")!;
  const summary = menu.querySelector("summary")!;
  const logo = menu.querySelector<HTMLImageElement>("#market-logo")!;
  const agentLabel = menu.querySelector<HTMLElement>("#market-agent")!;
  const currencyLabel = menu.querySelector<HTMLElement>("#market-currency")!;
  const agentOptions = [...menu.querySelectorAll<HTMLButtonElement>("[data-agent]")];
  const currencyOptions = [...menu.querySelectorAll<HTMLButtonElement>("[data-currency]")];
  const savedToggle = document.querySelector<HTMLButtonElement>("#saved-only")!;
  const savedCount = savedToggle.querySelector<HTMLElement>("#saved-count")!;
  const saved = savedItems();
  const preferredAgent = readPreference("agent");
  let agent = catalogAgents.find(item => item.label === (preferredAgent === "Direct link" ? "FindSpreadsheet" : preferredAgent)) ?? defaultCatalogAgent;
  const preferredCurrency = readPreference("currency") ?? "USD";
  let currency = Object.hasOwn(rates, preferredCurrency) ? preferredCurrency : "USD";
  let favorites = new URLSearchParams(location.search).has('saved');

  function updateMenu() {
    if (agent.logo) logo.src = agent.logo;
    logo.hidden = !agent.logo;
    agentLabel.textContent = agent.label;
    currencyLabel.textContent = currency;
    for (const option of agentOptions) option.setAttribute("aria-pressed", String(option.dataset.agent === agent.label));
    for (const option of currencyOptions) option.setAttribute("aria-pressed", String(option.dataset.currency === currency));
  }

  function updateSavedToggle() {
    savedToggle.setAttribute("aria-pressed", String(favorites));
    savedCount.textContent = String(saved.size);
    savedCount.hidden = saved.size === 0;
  }

  for (const option of agentOptions) option.addEventListener("click", () => {
    agent = catalogAgents.find(item => item.label === option.dataset.agent) ?? defaultCatalogAgent;
    keepPreference("agent", agent.label);
    updateMenu();
    refresh();
  });
  for (const option of currencyOptions) option.addEventListener("click", () => {
    currency = option.dataset.currency!;
    keepPreference("currency", currency);
    updateMenu();
    document.dispatchEvent(new Event('catalog-currency-changed'));
    refresh();
  });
  window.addEventListener('storage', event => {
    if (event.key !== 'sugargoo-browse-currency') return;
    currency = event.newValue && Object.hasOwn(rates, event.newValue) ? event.newValue : 'USD';
    updateMenu();
    refresh();
  });
  document.addEventListener("click", event => {
    if (event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
  });
  menu.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      summary.focus();
    }
  });
  savedToggle.addEventListener("click", () => {
    favorites = !favorites;
    updateSavedToggle();
    refresh(true);
  });
  savedToggle.hidden = false;
  updateSavedToggle();
  updateMenu();

  function localizedPrice(raw: string) {
    return priceLabel(raw, currency);
  }

  function card(product: Product) {
    const element = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const href = detailsUrl(product.weidianId);
    element.dataset.browseProduct = product.weidianId;
    for (const link of element.querySelectorAll<HTMLAnchorElement>(".browse-image-link, h3 a, .grid-details")) link.href = href;
    element.querySelector("img")!.src = featuredImage(product);
    element.querySelector(".product-tag")!.textContent = categoryLabel(product.category);
    const title = element.querySelector<HTMLAnchorElement>("h3 a")!;
    title.textContent = product.name;
    title.dataset.productName = product.weidianId;
    const imageLink = element.querySelector<HTMLAnchorElement>(".browse-image-link")!;
    imageLink.setAttribute("aria-label", "View details");
    const price = element.querySelector<HTMLElement>(".product-price")!;
    price.textContent = localizedPrice(product.price);
    price.dataset.priceCny = product.price;
    const buy = element.querySelector<HTMLAnchorElement>(".grid-buy")!;
    buy.href = agent.url(product);
    buy.querySelector("span")!.textContent = "View on " + agent.label;

    const favorite = element.querySelector<HTMLButtonElement>(".save-card")!;
    function labelFavorite() {
      const isSaved = saved.has(product.weidianId);
      favorite.setAttribute("aria-pressed", String(isSaved));
      favorite.setAttribute("aria-label", isSaved ? "Remove saved product" : "Save product");
    }
    favorite.hidden = false;
    labelFavorite();
    favorite.addEventListener("click", () => {
      if (saved.has(product.weidianId)) saved.delete(product.weidianId);
      else saved.add(product.weidianId);
      keepPreference("saved", JSON.stringify([...saved]));
      labelFavorite();
      updateSavedToggle();
      if (favorites) refresh();
    });
    return element;
  }

  return {
    card,
    get favorites() { return favorites; },
    accepts: (product: Product) => !favorites || saved.has(product.weidianId),
  };
}
