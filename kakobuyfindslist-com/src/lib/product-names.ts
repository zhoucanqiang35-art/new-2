type Names = Record<string, string>;
const packs = new Map<string, Promise<Names>>();
let names: Names = {};

export function loadProductNames(locale: string): Promise<Names> {
  if (locale === "en") return Promise.resolve({});
  if (!packs.has(locale)) {
    packs.set(locale, fetch("/product-locales/" + encodeURIComponent(locale) + ".json")
      .then(response => {
        if (!response.ok) throw new Error("Product language unavailable");
        return response.json() as Promise<Names>;
      }).catch(error => { packs.delete(locale); throw error; }));
  }
  return packs.get(locale)!;
}

export function useProductNames(localized: Names) {
  names = localized;
}

export function productName(id: string, original: string) {
  return names[id] || original;
}
