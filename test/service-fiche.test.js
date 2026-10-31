import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { SERVICE_BY_ID, serviceQueryUrl } from '../src/models/service-catalog.js';
import { renderServiceFiche } from '../src/views/service-fiche-view.js';

test('la ficha piloto se genera como HTML estático con SEO, texto aprobado y CTA propio', async () => {
    const service = SERVICE_BY_ID['automatizacion-whatsapp'];
    const html = renderServiceFiche(service);
    const document = new JSDOM(html).window.document;

    assert.equal(document.querySelector('title').textContent, service.ficheTitle);
    assert.equal(document.querySelector('meta[name="description"]').content, service.ficheMetaDescription);
    assert.equal(document.querySelector('link[rel="canonical"]').href, 'https://forgelock-solution.github.io/ForgeLock/servicio-automatizacion-whatsapp.html');
    assert.equal(document.querySelector('h1').textContent, service.name);
    assert.equal(document.querySelector('main article > p:nth-of-type(2)').textContent, service.ficheLongDescription);
    assert.equal(document.querySelectorAll('a[data-related-service]').length, 2);
    assert.match(document.querySelector('a[aria-label^="Consultar por WhatsApp"]').href, /wa\.me\/573043402589/);
    assert.equal(serviceQueryUrl(service), './servicio-automatizacion-whatsapp.html');
    assert.match(await readFile(new URL('../servicio-automatizacion-whatsapp.html', import.meta.url), 'utf8'), /Una solución para atender conversaciones por WhatsApp de forma automática y registrar la información que comparten las personas\. El alcance se define según las necesidades de atención de cada negocio\./);
    assert.doesNotMatch(html, /Cotiza según|precio|plazo|entrega/);
});
