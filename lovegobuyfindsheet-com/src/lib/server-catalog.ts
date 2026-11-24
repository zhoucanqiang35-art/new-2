import {readFileSync,existsSync} from "node:fs";
import type {Product} from "./catalog";
export const products: Product[] = JSON.parse(readFileSync("public/data/catalog.json", "utf8"));
const galleryFiles = new Map<string, Record<string, string[]>>();
const qc = JSON.parse(readFileSync("public/data/qc-featured.json", "utf8"));
export function productData(product: Product) {
  const prefix = product.weidianId.slice(0,4);
  if (!galleryFiles.has(prefix)) {
    const path = "public/data/gallery-" + prefix + ".json";
    galleryFiles.set(prefix, existsSync(path) ? JSON.parse(readFileSync(path,"utf8")) : {});
  }
  const pictures = [...new Set([product.image, ...(galleryFiles.get(prefix)?.[product.weidianId] || [])])];
  return {product, pictures, warehouse: qc[product.weidianId]?.images || []};
}
