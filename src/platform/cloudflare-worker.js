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
            return Response.redirect(new URL(destinationPath, url.origin), 302);
        }

        return env.ASSETS.fetch(request);
    }
};
