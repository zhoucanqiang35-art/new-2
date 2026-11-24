const sellerImageHosts = new Set(["si.geilicdn.com", "img.geilicdn.com"]);

export function sellerVariantGroups(data, item) {
  if (String(data?.weidian_id) !== item || !Array.isArray(data.specifications?.attrs)) {
    throw new Error("No matching seller specifications");
  }

  return data.specifications.attrs.flatMap(group => {
    const options = (Array.isArray(group?.attr_values) ? group.attr_values : []).flatMap(option => {
      if (typeof option?.img !== "string" || !option.img) return [];
      try {
        const url = new URL(option.img, "https://weidian.com/");
        if (url.protocol !== "https:" || !sellerImageHosts.has(url.hostname) || url.username || url.password || url.port) return [];
        const label = String(option.attr_value ?? "").trim().slice(0, 150);
        return [{url: url.href, label}];
      } catch {
        return [];
      }
    });
    const name = String(group?.attr_title ?? "").trim().slice(0, 70);
    return options.length ? [{name, options}] : [];
  });
}

export function sellerSpecificationsUrl(item) {
  const url = new URL("https://findspreadsheet.com/api/Goods/getSkuData");
  url.searchParams.set("weidian_id", item);
  return url.href;
}
