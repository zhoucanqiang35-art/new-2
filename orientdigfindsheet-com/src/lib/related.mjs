const tokens = name => new Set(name.toLowerCase().match(/[a-z0-9]{4,}/g) ?? []);

export function relatedProducts(item, catalog) {
  const words = tokens(item.name);
  return catalog
    .filter(product => product.category === item.category && product.weidianId !== item.weidianId && product.image)
    .map(product => ({
      product,
      similarity: [...tokens(product.name)].filter(word => words.has(word)).length,
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 6)
    .map(({ product }) => product);
}
