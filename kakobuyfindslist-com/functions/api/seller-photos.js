const imageHosts = new Set(["si.geilicdn.com", "img.geilicdn.com"]);

function sellerImage(value) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value, "https://weidian.com/");
    return url.protocol === "https:" && imageHosts.has(url.hostname)
      && !url.username && !url.password && !url.port ? url.href : null;
  } catch {
    return null;
  }
}

function decodeAttribute(value) {
  const named = {amp: "&", quot: '"', apos: "'", lt: "<", gt: ">"};
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
    if (code[0] !== "#") return named[code.toLowerCase()] ?? entity;
    const hex = code[1].toLowerCase() === "x";
    const point = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  });
}

export function parseSellerPhotos(html, id) {
  const tag = html.match(/<[^>]*\bid=["']__rocker-render-inject__["'][^>]*>/i)?.[0];
  const value = tag?.match(/\bdata-obj=(["'])(.*?)\1/s)?.[2];
  if (!value) return [];
  const data = JSON.parse(decodeAttribute(value)).result?.default_model;
  const item = data?.item_info;
  if (String(item?.item_id) !== id) return [];

  const photos = new Map();
  for (const group of data.sku_properties?.attr_list ?? []) {
    for (const option of group.attr_values ?? []) {
      const url = sellerImage(option.img);
      if (url && !photos.has(url)) photos.set(url, String(option.attr_value ?? "").trim().slice(0, 150));
    }
  }
  for (const photo of item.imgs ?? []) {
    const url = sellerImage(typeof photo === "string" ? photo : photo?.url);
    if (url && !photos.has(url)) photos.set(url, "");
  }
  return [...photos].slice(0, 160).map(([url, label]) => ({url, label}));
}

export async function onRequestGet({request, waitUntil}) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  if (!/^\d{5,20}$/.test(id)) return Response.json([], {status: 400});

  const cacheUrl = new URL(url.pathname, url.origin);
  cacheUrl.searchParams.set("id", id);
  const cache = globalThis.caches?.default;
  const cached = await cache?.match(cacheUrl.href);
  if (cached) return cached;

  try {
    const response = await fetch("https://weidian.com/item.html?itemID=" + id, {
      headers: {"Accept-Language": "en-US,en;q=0.9"},
      redirect: "error",
      signal: AbortSignal.timeout(6500),
    });
    if (!response.ok) return Response.json([], {status: 502});
    const photos = parseSellerPhotos(await response.text(), id);
    const result = Response.json(photos, {
      headers: {"Cache-Control": photos.length ? "public, max-age=21600" : "public, max-age=300"},
    });
    if (cache) waitUntil(cache.put(cacheUrl.href, result.clone()));
    return result;
  } catch {
    return Response.json([], {status: 502});
  }
}
