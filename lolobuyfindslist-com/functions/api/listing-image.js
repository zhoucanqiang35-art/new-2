export async function onRequestGet({request}) {
  const file = new URL(request.url).searchParams.get('file') ?? '';
  if (!/^[A-Za-z0-9_-]{12,200}\.(?:jpe?g|png|webp)$/i.test(file)) {
    return new Response(null, {status: 400});
  }

  try {
    const upstream = await fetch('https://si.geilicdn.com/' + file, {
      redirect: 'manual',
      cf: {cacheEverything: true, cacheTtlByStatus: {'200-299': 604800, '400-599': 0}},
    });
    const contentType = upstream.headers.get('content-type')?.split(';')[0].trim();
    if (!upstream.ok || !/^image\/(?:jpeg|png|webp)$/.test(contentType ?? '')) {
      return new Response(null, {status: 404});
    }
    return new Response(upstream.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, {status: 502});
  }
}
