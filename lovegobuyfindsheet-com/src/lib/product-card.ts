import {categoryLabel, detailsUrl, featuredImage, priceLabel, type Product} from "./catalog";

export function productCard(product: Product, imageUrl?: string) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.innerHTML = '<a><div class="product-image"><img alt="" width="320" height="320" loading="lazy"></div><div class="product-copy"><span class="product-tag"></span><h3></h3><span class="product-price"><span></span><b aria-hidden="true">↗</b></span></div></a>';
  card.querySelector("a")!.href = detailsUrl(product.weidianId);
  const photo = card.querySelector("img")!;
  photo.src = imageUrl || featuredImage(product);
  if (imageUrl && imageUrl !== featuredImage(product)) {
    photo.addEventListener("error", () => { photo.src = featuredImage(product); }, {once: true});
  }
  card.querySelector("h3")!.textContent = product.name;
  card.querySelector(".product-tag")!.textContent = categoryLabel(product.category);
  card.querySelector(".product-price span")!.textContent = priceLabel(product.price);
  return card;
}

