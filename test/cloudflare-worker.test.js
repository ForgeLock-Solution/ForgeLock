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

test('Cloudflare agrega noindex a cualquier respuesta del binding de activos', async () => {
    const cases = [
        ['https://forgelock.forge-look19.workers.dev/', 200],
        ['https://forgelock.forge-look19.workers.dev/assets/main.js', 200],
        ['https://forgelock.forge-look19.workers.dev/politica-privacidad.html', 200],
        ['https://forgelock.forge-look19.workers.dev/no-existe', 404]
    ];
    for (const [url, status] of cases) {
        const response = await worker.fetch(new Request(url), {
            ASSETS: { fetch: () => new Response('asset', { status }) }
        });
        assert.equal(response.status, status);
        assert.match(response.headers.get('x-robots-tag') ?? '', /^noindex,\s*follow$/i);
    }
});
