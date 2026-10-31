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
    const main = document.querySelector('main');
    const article = main.querySelector('article');
    assert.equal(main.firstElementChild.tagName, 'FIGURE');
    assert.equal(main.firstElementChild.querySelector('img').getAttribute('src'), service.image);
    assert.equal(main.firstElementChild.querySelector('img').getAttribute('alt'), service.imageAlt);
    assert.equal(document.querySelector('h1').textContent, service.name);
    assert.equal(article.querySelector('p.mt-5').textContent, service.ficheLongDescription);
    assert.equal(article.querySelector('#ficha-precio-titulo').nextElementSibling.textContent, 'Cotiza según tu necesidad');
    assert.equal(article.querySelectorAll('a[aria-label^="Consultar por WhatsApp"]')[0].textContent, 'Consultar por WhatsApp');
    assert.ok(article.querySelector('a[aria-label^="Consultar por WhatsApp"]').href.includes(encodeURIComponent('Automatización de WhatsApp')));
    assert.ok(article.querySelector('#servicios-relacionados-titulo'));
    assert.equal(document.querySelectorAll('a[data-related-service]').length, 2);
    assert.match(document.querySelector('a[aria-label^="Consultar por WhatsApp"]').href, /wa\.me\/573043402589/);
    assert.equal(serviceQueryUrl(service), './servicio-automatizacion-whatsapp.html');
    assert.match(await readFile(new URL('../servicio-automatizacion-whatsapp.html', import.meta.url), 'utf8'), /Una solución para atender conversaciones por WhatsApp de forma automática y registrar la información que comparten las personas\. El alcance se define según las necesidades de atención de cada negocio\./);
    assert.match(html, /<h2 id="ficha-precio-titulo"[^>]*>Precio<\/h2>\s*<p class="mt-2 text-slate-700">Cotiza según tu necesidad<\/p>/);
    assert.ok(html.indexOf('<figure') < html.indexOf('<article aria-labelledby="ficha-titulo"'));
    assert.doesNotMatch(html, /<p class="mt-2 text-slate-700">[^<]*(?:\$\s?\d|días hábiles|entrega)/);
});
