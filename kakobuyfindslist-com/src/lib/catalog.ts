export interface Product {
  id: string;
  weidianId: string;
  name: string;
  image: string;
  sourcePath: string;
  category: string;
  price: string;
}

export const registration = "https://ikako.vip/r/wtqaa";
export const upstream = "https://findspreadsheet.com";
export const categories = [
  ["shoes", "Shoes"], ["hoodies-sweaters", "Hoodies & sweaters"], ["jackets", "Jackets"],
  ["t-shirts", "T-shirts"], ["pants-shorts", "Pants & shorts"], ["accessories", "Accessories"],
  ["jersey", "Jerseys"], ["headwear", "Headwear"], ["ShortSets", "Sets"],
  ["electronics", "Electronics"], ["other-stuff", "Other finds"],
];

export const highlighted = ["4502", "8648", "7357", "7652", "8477", "7953", "7079", "9018"];
export const featuredImage = (product: Product) => highlighted.includes(product.id) ? "/featured/" + product.id + ".webp" : product.image;
export const categoryLabel = (key: string) => categories.find(([slug]) => slug === key)?.[1] ?? key;
export const sourceUrl = (product: Product) => new URL(product.sourcePath, upstream).href;
export const detailsUrl = (item: string) => "/product/?id=" + encodeURIComponent(item);
export function sellerUrl(item: string) {
  const source = new URL("https://weidian.com/item.html");
  source.searchParams.set("itemID", item);
  return source.href;
}

export function buyUrl(item: string) {
  const url = new URL("https://item2.kakobuy.com/item/details");
  url.searchParams.set("url", sellerUrl(item));
  return url.href;
}

// Wise reference rate for this preview snapshot, 2026-11-17.
const cnyPerUsd = 6.665;
const usd = new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"});

export function usdPrice(price: string) {
  const value = Number(price);
  return price.trim() && Number.isFinite(value) && value > 0
    ? value / cnyPerUsd
    : null;
}

export function priceLabel(price: string) {
  const value = usdPrice(price);
  return value === null ? "Price on listing" : usd.format(value);
}

export async function getData<T>(file: string): Promise<T> {
  const response = await fetch("/data/" + file);
  if (!response.ok) throw new Error("Unable to load " + file);
  return response.json();
}


export async function galleryPhotos(product: Product) {
  const key = product.weidianId.slice(0, 4);
  const galleries = await getData<Record<string, string[]>>("gallery-" + key + ".json");
  return galleries[product.weidianId]?.length ? galleries[product.weidianId] : [product.image];
}
