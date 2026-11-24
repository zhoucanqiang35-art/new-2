import snapshot from "./currency-rates.json";
import localeCurrencies from "./currencies.json";
let active = "USD";
let locale = "en";
const rates: Record<string, number> = snapshot.rates;
export function currencyForLanguage(language: string) {
  return (localeCurrencies as Record<string, string>)[language] || "USD";
}
export function setCurrency(code: string, language = locale) {
  active = rates[code] ? code : "USD";
  locale = language;
  const trigger = document.querySelector<HTMLButtonElement>("#open-currency");
  if (trigger) trigger.innerHTML = active + ' <span aria-hidden="true">⌄</span>';
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-currency]")) {
    button.setAttribute("aria-pressed", String(button.dataset.currency === active));
  }
  refreshPrices();
}
export function formatPrice(price: string) {
  const cny = Number(price);
  if (!price.trim() || !Number.isFinite(cny) || cny <= 0) return "Price on listing";
  const value = cny / rates.CNY * rates[active];
  return new Intl.NumberFormat(locale === "en" ? "en-US" : locale, {
    style: "currency", currency: active,
    currencyDisplay: active === "USD" ? "narrowSymbol" : "symbol",
  }).format(value);
}
export function refreshPrices() {
  for (const node of document.querySelectorAll<HTMLElement>("[data-price-cny]")) {
    const label = formatPrice(node.dataset.priceCny!);
    if (node.textContent !== label) node.textContent = label;
  }
}
