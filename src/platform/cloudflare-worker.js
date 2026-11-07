export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (
      (url.pathname === '/servicios' || url.pathname === '/servicios.html') &&
      url.searchParams.get('servicio') === 'automatizacion-whatsapp'
    ) {
      return new Response(null, {
        status: 302,
        headers: {
          'location': `${url.origin}/servicio-automatizacion-whatsapp`,
          'x-robots-tag': 'noindex'
        }
      });
    }

    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const response = await env.ASSETS.fetch(request);
      const newHeaders = new Headers(response.headers);
      newHeaders.set('x-robots-tag', 'noindex, follow');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }

    return new Response('ForgeLock Cloudflare Worker', {
      headers: { 'content-type': 'text/plain', 'x-robots-tag': 'noindex, follow' }
    });
  }
};
