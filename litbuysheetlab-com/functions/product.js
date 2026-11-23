export async function onRequest({ request, env, next }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return next();
  }

  const destination = new URL(request.url);
  const productId = destination.searchParams.get('id');
  if (!productId || !/^\d+$/.test(productId)) {
    return next();
  }

  destination.pathname = `/products/${productId}/`;
  const productPage = await env.ASSETS.fetch(new URL(destination.pathname, destination), {
    method: 'HEAD',
    redirect: 'manual',
  });
  if (productPage.status !== 200) {
    return next();
  }

  destination.searchParams.delete('id');
  return Response.redirect(destination.href, 301);
}
