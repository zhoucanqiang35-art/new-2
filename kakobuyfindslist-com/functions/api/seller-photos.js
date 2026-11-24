import {sellerSpecificationsUrl, sellerVariantGroups} from "../../src/lib/seller-variants.mjs";

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
    const response = await fetch(sellerSpecificationsUrl(id), {
      headers: {Accept: "application/json"},
      redirect: "error",
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) return Response.json([], {status: 502});
    const groups = sellerVariantGroups(await response.json(), id);
    const result = Response.json(groups, {
      headers: {"Cache-Control": "public, max-age=300, s-maxage=1800"},
    });
    if (cache) waitUntil(cache.put(cacheUrl.href, result.clone()));
    return result;
  } catch {
    return Response.json([], {status: 502});
  }
}
