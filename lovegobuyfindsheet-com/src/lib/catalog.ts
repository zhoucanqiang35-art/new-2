export interface Product {
  id: string;
  weidianId: string;
  name: string;
  image: string;
  sourcePath: string;
  category: string;
  price: string;
}

export const registration = "https://www.lovegobuy.com/?invite_code=HR595U";
export const upstream = "https://findspreadsheet.com";
export const categories = [
  ["shoes", "Shoes"], ["hoodies-sweaters", "Hoodies & sweaters"], ["jackets", "Jackets"],
  ["t-shirts", "T-shirts"], ["pants-shorts", "Pants & shorts"], ["accessories", "Accessories"],
  ["jersey", "Jerseys"], ["headwear", "Headwear"], ["ShortSets", "Sets"],
  ["electronics", "Electronics"], ["other-stuff", "Other finds"],
];

export const highlighted = ["4509", "7366", "7980", "7653", "8573", "8510", "8324", "6837"];
export const featuredImage = (product: Product) => highlighted.includes(product.id) ? "/featured/" + product.id + ".webp" : product.image;
export const categoryLabel = (key: string) => categories.find(([slug]) => slug === key)?.[1] ?? key;
export const detailsUrl = (item: string) => "/product/" + encodeURIComponent(item) + "/";
export function buyUrl(item: string) {
  const url = new URL("https://www.lovegobuy.com/product");
  url.search = new URLSearchParams({id: item, shop_type: "weidian", invite_code: "161CPG"}).toString();
  return url.href;
}
export {formatPrice as priceLabel} from "./currency";
export async function getData<T>(file: string): Promise<T> {
  const response = await fetch("/data/" + file);
  if (!response.ok) throw new Error("Unable to load " + file);
  return response.json();
}
