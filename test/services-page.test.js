import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { AppView } from '../src/views/app-view.js';
import { AppModel } from '../src/models/app-model.js';
import { SERVICE_CATALOG, SERVICE_BY_ID, SERVICE_WHATSAPP_NUMBER, serviceQueryUrl } from '../src/models/service-catalog.js';
import { ServicePageModel } from '../src/models/service-page-model.js';
import { ServicePageView } from '../src/views/service-page-view.js';
import { ServicePageController } from '../src/controllers/service-page-controller.js';

function createServiceDom(url = 'https://example.test/servicios.html') {
    const dom = new JSDOM(`<body>
      <div id="services-catalogue-container"></div>
      <p id="servicios-hero-text" aria-live="polite">Elige un servicio para conocer la información disponible y contactar a ForgeLock.</p>
      <article id="detalle-servicio"><span id="detalle-etiqueta"></span><h3 id="detalle-titulo"></h3><p id="detalle-descripcion"></p><div id="detalle-informacion"></div><a id="detalle-enlace"></a><a id="detalle-cta"></a></article>
      <section data-landing-content></section>
      <section data-landing-content></section>
      <section id="proceso" data-landing-content></section>
    </body>`, { url });
    globalThis.document = dom.window.document;
    globalThis.window = dom.window;
    return dom;
}

test('el catálogo tiene nueve servicios, imágenes locales y textos comerciales permitidos', async () => {
    assert.equal(SERVICE_CATALOG.length, 9);
    assert.equal(new Set(SERVICE_CATALOG.map((service) => service.id)).size, 9);
    assert.equal(SERVICE_CATALOG.filter((service) => service.group === 'featured').length, 6);
    assert.equal(SERVICE_CATALOG.filter((service) => service.group === 'digital').length, 3);
    assert.equal(AppModel.featuredSolutions.length, 4);
    assert.ok(AppModel.featuredSolutions.some((service) => service.id === 'automatizacion-whatsapp'));

    for (const service of SERVICE_CATALOG) {
        assert.match(service.image, /^\.\/resource\/service\/[a-z0-9-]+\.webp$/);
        const image = await readFile(new URL(`../${service.image.slice(2)}`, import.meta.url));
        assert.equal(image.subarray(0, 4).toString(), 'RIFF');
        assert.equal(image.subarray(8, 12).toString(), 'WEBP');
        assert.ok(service.imageAlt.length > 10, `${service.id} requiere texto alternativo descriptivo`);
        assert.ok(service.message.includes(service.name) || service.id === 'soluciones-personalizadas');
        assert.ok(service.heroText, `${service.id} requiere el texto autorizado para el hero`);
        assert.equal(service.relatedIds.length >= 2, true);
        assert.equal(service.relatedIds.includes(service.id), false);
        assert.ok(service.relatedIds.every((id) => Object.hasOwn(SERVICE_BY_ID, id)), `${service.id} tiene una relación rota`);
    }

    assert.equal(SERVICE_BY_ID.integraciones.description, 'Conectamos plataformas, pasarelas de pago, CRMs y herramientas.');
    assert.equal(SERVICE_BY_ID['desarrollo-web'].description, 'Páginas corporativas, landing pages y catálogos digitales.');
    assert.equal(SERVICE_BY_ID['soluciones-personalizadas'].pricingLabel, 'Cotiza según tu necesidad');
    assert.match(SERVICE_BY_ID.branding.description, /^Diseñamos la identidad visual y las piezas digitales/);
    assert.equal(SERVICE_BY_ID.landing.pricing.length, 2);
    assert.equal(SERVICE_BY_ID.catalogos.pricing, null);
    assert.equal(AppModel.services, SERVICE_CATALOG);
    assert.equal(ServicePageModel.services, SERVICE_BY_ID);

    const pending = JSON.parse(await readFile(new URL('../internal-data/pending-offers.json', import.meta.url), 'utf8'));
    assert.equal(pending.visibility, 'internal-only');
    assert.ok(pending.offers.length > 0);
    assert.ok(pending.offers.every((offer) => offer.approved === false));
});

test('las tarjetas de portada y servicios usan el catálogo y enlazan al detalle elegido', () => {
    const home = new JSDOM('<header id="header-container"></header><div id="services-container"></div>');
    globalThis.document = home.window.document;
    AppView.renderHeader();
    AppView.renderServices();
    const homeCards = [...document.querySelectorAll('#services-container [data-service-card]')];
    assert.equal(homeCards.length, SERVICE_CATALOG.length);
    assert.ok(document.querySelector('#header-container nav a[href="#servicios"]'));
    assert.ok(document.querySelector('#mobile-menu a[href="#servicios"]'));
    assert.equal(document.querySelector('#services-container #servicios')?.id, 'servicios');

    const dom = createServiceDom();
    ServicePageView.renderCatalog();
    const pageCards = [...document.querySelectorAll('#services-catalogue-container [data-service-card]')];
    assert.equal(pageCards.length, SERVICE_CATALOG.length);
    assert.ok(document.querySelector('#presencia-digital #servicios-digitales-titulo'));
    for (const service of SERVICE_CATALOG) {
        for (const cardSet of [homeCards, pageCards]) {
            const card = cardSet.find((node) => node.dataset.serviceCard === service.id);
            assert.ok(card, `falta tarjeta ${service.id}`);
            assert.equal(card.querySelector('h3').textContent, service.name);
            assert.equal(card.querySelector('img').getAttribute('src'), service.image);
            assert.equal(card.querySelector('a[aria-label^="Consultar por WhatsApp"]').target, '_blank');
            assert.equal(card.querySelector('a[aria-label^="Consultar por WhatsApp"]').rel, 'noopener noreferrer');
            const detailLink = service.fichePath
                ? card.querySelector(`a[href$="${service.fichePath}"]`)
                : card.querySelector('a[href*="?servicio="]');
            assert.equal(detailLink.tabIndex, 0);
            assert.match(detailLink.className, /focus-visible:outline/);
            assert.match(detailLink.textContent, new RegExp(`Conocer ${service.name}`));
            if (service.fichePath) assert.ok(detailLink.href.endsWith(service.fichePath));
            else assert.equal(new URL(detailLink.href, 'https://example.test/').searchParams.get('servicio'), service.id);
        }
    }
    assert.equal(serviceQueryUrl(SERVICE_BY_ID['automatizacion-whatsapp']), './servicio-automatizacion-whatsapp.html');
    assert.equal(serviceQueryUrl(SERVICE_BY_ID.landing), './servicios.html?servicio=landing#detalle-servicio');
    assert.equal(home.window.document.querySelectorAll('#services-container section[aria-labelledby="servicios-principales-titulo"] [data-service-card]').length, 6);
    assert.equal(home.window.document.querySelectorAll('#services-container section[aria-labelledby="servicios-digitales-titulo"] [data-service-card]').length, 3);
    home.window.close();
    dom.window.close();
});

test('la portada muestra cuatro soluciones, selecciona WhatsApp y enlaza cada una con su servicio', () => {
    const dom = new JSDOM('<div id="solutions-carousel-container"></div>', { url: 'https://example.test/' });
    globalThis.document = dom.window.document;
    AppModel.state.activeBannerIndex = 0;

    for (let index = 0; index < AppModel.featuredSolutions.length; index += 1) {
        AppModel.state.activeBannerIndex = index;
        AppView.renderSolutions();
        const buttons = [...document.querySelectorAll('#soluciones button[data-banner]')];
        assert.equal(buttons.length, 4, 'la portada debe conservar cuatro soluciones destacadas');
        assert.ok(buttons.some((button) => button.textContent.includes('Automatiza tu WhatsApp Business')));
        assert.equal(buttons.filter((button) => button.getAttribute('aria-pressed') === 'true').length, 1);

        const service = AppModel.featuredSolutions[index];
        const panel = document.querySelector('#solution-panel');
        assert.equal(panel.getAttribute('aria-live'), 'polite');
        assert.equal(panel.querySelector('h3').textContent, service.title);
        assert.equal(panel.querySelector('p.text-lg').textContent, service.heroText);
        assert.equal(panel.querySelector('a[href*="wa.me"]').textContent.trim(), 'Quiero esta solución');
        assert.equal(panel.querySelector('a[href*="servicio"], a[href*="servicios.html?"]').getAttribute('href'), service.detailsUrl);
    }

    AppModel.state.activeBannerIndex = 0;
    AppView.renderSolutions();
    assert.equal(document.querySelector('#solution-panel h3').textContent, 'Automatiza tu WhatsApp Business');
    assert.equal(document.querySelectorAll('#solution-panel [data-solution-highlights] > div').length, 2);
    assert.deepEqual([...document.querySelectorAll('#solution-panel [data-solution-highlights] > div')].map((chip) => chip.textContent.trim()), [
        'Bots para atención automática', 'Registro de información'
    ]);
    assert.equal(AppModel.featuredSolutions[0].id, 'automatizacion-whatsapp');
    dom.window.close();
});

test('servicios.html conserva la selección directa por query sin redirigir', () => {
    const dom = createServiceDom('https://example.test/servicios.html?servicio=automatizacion-procesos#detalle-servicio');
    ServicePageController.init();
    assert.equal(window.location.pathname, '/servicios.html');
    assert.equal(window.location.search, '?servicio=automatizacion-procesos');
    assert.equal(document.querySelector('#detalle-servicio').dataset.service, 'automatizacion-procesos');
    assert.equal(document.querySelector('#detalle-titulo').textContent, 'Automatización de Procesos');
    dom.window.close();
});

test('el detalle seleccionado comunica contenido propio, CTA y estado accesible', () => {
    const dom = createServiceDom('https://example.test/servicios.html?servicio=integraciones');
    for (const service of SERVICE_CATALOG) {
        assert.equal(ServicePageView.update(service.id), true);
        const selected = document.querySelector(`[data-service-card="${service.id}"] a[aria-current="page"]`);
        assert.equal(selected.getAttribute('aria-current'), 'page');
        assert.equal(document.querySelectorAll('[data-service-card] a[aria-current="page"]').length, 1);
        assert.equal(document.querySelector('#detalle-servicio').dataset.service, service.id);
        assert.equal(document.querySelector('#detalle-titulo').textContent, service.detailTitle || service.name);
        assert.equal(document.querySelector('#detalle-descripcion').textContent, service.description);
        assert.equal(document.querySelector('#servicios-hero-text').textContent, `${service.heroText} Consulta la información disponible y contacta a ForgeLock.`);
        assert.equal(document.querySelector('#detalle-cta').getAttribute('aria-label'), `Consultar por WhatsApp sobre ${service.name}`);
        assert.equal(new URL(document.querySelector('#detalle-cta').href).searchParams.get('text'), service.message);
        assert.equal(document.querySelectorAll('[data-landing-content]:not([hidden])').length, service.id === 'landing' ? 3 : 0);
    }
    assert.equal(document.querySelector('#detalle-informacion').textContent, SERVICE_BY_ID.branding.detailInfo);
    assert.match(SERVICE_BY_ID['soluciones-personalizadas'].detailInfo, /Cotiza según tu necesidad/);
    assert.equal(ServicePageView.update('missing-service'), false);
    dom.window.close();
});

test('servicios elimina las pestañas y presenta las nueve tarjetas en el HTML construido', async () => {
    const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
    assert.match(html, /<title>Servicios ForgeLock para negocios \| Web, sistemas y automatización<\/title>/);
    assert.match(html, /services-catalogue-container/);
    assert.match(html, /<section id="proceso" data-landing-content/);
    const menu = new JSDOM(html).window.document;
    assert.ok(menu.querySelector('nav[aria-label="Navegación principal"] a[href="#presencia-digital"]'));
    assert.ok(menu.querySelector('details nav[aria-label="Navegación móvil"] a[href="#presencia-digital"]'));
    assert.match(html, /El pago se divide en tres partes: 30% para iniciar, 30% cuando el proyecto llegue al 50% y 40% al terminar/);
    assert.doesNotMatch(html, /role="tablist"|role="tab"|data-service="landing"/);
    assert.match(html, /<img width="1200" height="1000" class="hero-service-image[^\"]*" src="\.\/resource\/hero\/servicios-hero\.webp" alt="Emprendedor trabajando frente a su computador en su negocio" fetchpriority="high" loading="eager"/);
    assert.doesNotMatch(html, /500\.000 COP|15 días hábiles|250\.000 COP|20 productos/);
});

test('la foto del hero es WebP y se mantiene por debajo de 150 KB', async () => {
    const image = await readFile(new URL('../resource/hero/servicios-hero.webp', import.meta.url));
    assert.equal(image.subarray(0, 4).toString(), 'RIFF');
    assert.equal(image.subarray(8, 12).toString(), 'WEBP');
    assert.ok(image.byteLength < 150 * 1024, `peso recibido: ${image.byteLength} bytes`);
});

test('el encabezado de portada y servicios usa el isotipo aprobado', async () => {
    const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
    const isotipo = await readFile(new URL('../resource/isotipo.png', import.meta.url));
    const dom = new JSDOM('<header id="header-container"></header>');
    globalThis.document = dom.window.document;
    AppView.renderHeader();
    assert.match(document.querySelector('#header-container img').getAttribute('src'), /resource\/isotipo\.png$/);
    assert.match(html, /<img src="\.\/resource\/isotipo\.png" alt=""/);
    assert.equal(isotipo.subarray(1, 4).toString(), 'PNG');
    dom.window.close();
});

test('el encabezado de la ficha piloto usa isotipo y referencias locales de iconos', async () => {
    const html = await readFile(new URL('../servicio-automatizacion-whatsapp.html', import.meta.url), 'utf8');
    assert.match(html, /src="\.\/resource\/isotipo\.png"/);
    assert.match(html, /href="\.\/favicon\.ico"/);
    assert.match(html, /href="\.\/site\.webmanifest"/);
});

test('las páginas legales incluyen el isotipo de marca en el encabezado', async () => {
    for (const file of ['aviso-legal.html', 'politica-cookies.html', 'politica-privacidad.html']) {
        const html = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
        assert.match(html, /<header class="site-header"><a class="brand"[^>]*><img src="\.\/resource\/isotipo\.png" alt="" width="40" height="40"><span>ForgeLock<\/span><\/a><\/header>/, file);
    }
});

test('las páginas públicas declaran iconos locales y el manifiesto referencia tamaños reales', async () => {
    const pages = ['index.html', 'servicios.html', 'servicio-automatizacion-whatsapp.html', '404.html', 'aviso-legal.html', 'politica-cookies.html', 'politica-privacidad.html'];
    for (const page of pages) {
        const html = await readFile(new URL(`../${page}`, import.meta.url), 'utf8');
        assert.match(html, /href="\.\/favicon\.ico"/i, page);
        assert.match(html, /href="\.\/resource\/favicon-48\.png"/i, page);
        assert.match(html, /href="\.\/site\.webmanifest"/i, page);
        assert.doesNotMatch(html, /href="https:\/\/forgelock\.forge-look19\.workers\.dev\/resource\/favicon/i, page);
    }
    const manifest = JSON.parse(await readFile(new URL('../site.webmanifest', import.meta.url), 'utf8'));
    for (const [file, size] of [['favicon-16.png', 16], ['favicon-32.png', 32], ['favicon-48.png', 48]]) {
        const image = await readFile(new URL(`../resource/${file}`, import.meta.url));
        assert.equal(image.subarray(1, 4).toString(), 'PNG');
        assert.equal(image.readUInt32BE(16), size);
        assert.equal(image.readUInt32BE(20), size);
    }
    assert.ok(manifest.icons.some((icon) => icon.src === './resource/favicon-48.png' && icon.sizes === '48x48'));
    assert.ok(manifest.icons.some((icon) => icon.src === './Icon-192.png' && icon.sizes === '192x192'));
});
