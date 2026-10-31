const legacyServicePages = Object.freeze({
    'automatizacion-whatsapp': '/servicio-automatizacion-whatsapp'
});

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const isLegacyServicesPath = url.pathname === '/servicios' || url.pathname === '/servicios.html';
        const selectedService = url.searchParams.get('servicio');
        const destinationPath = legacyServicePages[selectedService];

        if (isLegacyServicesPath && destinationPath && ['GET', 'HEAD'].includes(request.method)) {
            return new Response(null, {
                status: 302,
                headers: {
                    Location: new URL(destinationPath, url.origin).href,
                    'X-Robots-Tag': 'noindex, follow'
                }
            });
        }

        const response = await env.ASSETS.fetch(request);
        const headers = new Headers(response.headers);
        headers.set('X-Robots-Tag', 'noindex, follow');
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers
        });
    }
};
