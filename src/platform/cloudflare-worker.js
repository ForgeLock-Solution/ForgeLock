const legacyServicePages = Object.freeze({
  'automatizacion-whatsapp': '/servicios/automatizacion-whatsapp/'
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const selectedService = url.searchParams.get('servicio');
    const destinationPath = legacyServicePages[selectedService];
    if ((url.pathname === '/servicios' || url.pathname === '/servicios.html') &&
        destinationPath && ['GET', 'HEAD'].includes(request.method)) {
      return new Response(null, {
        status: 302,
        headers: {
          'location': new URL(destinationPath, url.origin).href,
          'x-robots-tag': 'noindex, follow'
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
