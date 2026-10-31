import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../src/platform/cloudflare-worker.js';

test('Cloudflare redirige por HTTP la ficha piloto desde la URL histórica con query', async () => {
    for (const path of ['/servicios', '/servicios.html']) {
        const request = new Request(`https://forgelock.forge-look19.workers.dev${path}?servicio=automatizacion-whatsapp`);
        const response = await worker.fetch(request, { ASSETS: { fetch: () => new Response('asset') } });
        assert.equal(response.status, 302);
        assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/i);
        assert.equal(response.headers.get('location'), 'https://forgelock.forge-look19.workers.dev/servicio-automatizacion-whatsapp');
    }
});

test('Cloudflare conserva la selección por query como ruta de compatibilidad', async () => {
    let requestedUrl = '';
    const request = new Request('https://forgelock.forge-look19.workers.dev/servicios?servicio=branding');
    const response = await worker.fetch(request, {
        ASSETS: { fetch: (assetRequest) => { requestedUrl = assetRequest.url; return new Response('servicios'); } }
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/i);
    assert.equal(await response.text(), 'servicios');
    assert.equal(requestedUrl, request.url);
});
