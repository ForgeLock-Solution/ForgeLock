import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { AppView } from '../src/views/app-view.js';
import { AppModel } from '../src/models/app-model.js';
import { ServicePageModel } from '../src/models/service-page-model.js';
import { ServicePageView } from '../src/views/service-page-view.js';

test('la página de servicios tiene contenido descriptivo, imágenes accesibles y CTA', async () => {
    const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
    assert.match(html, /<title>Servicios digitales para negocios \| ForgeLock<\/title>/);
    assert.match(html, /Landing pages para presentar tu negocio/);
    assert.match(html, /Catálogos digitales/);
    assert.match(html, /Branding y diseño digital/);
    assert.match(html, /class="hero-service-image[^\"]*" src="\.\/resource\/isotipo\.png" alt="Isotipo de ForgeLock: candado con elementos digitales"/);
    assert.doesNotMatch(html, /hero-service-image[^>]+images\.unsplash\.com/);
    assert.doesNotMatch(html, /Automatización de WhatsApp|Sistemas y automatización|Soluciones personalizadas|CRM|pasarelas de pago/);
    assert.match(html, /Landing Básica[\s\S]*?Una ronda de cambios/);
    assert.match(html, /Landing Profesional[\s\S]*?Dos rondas de cambios/);
    assert.equal((html.match(/Ejemplo conceptual de diseño/g) ?? []).length >= 4, true);
    assert.equal((html.match(/Quiero este diseño/g) ?? []).length, 4);
    assert.match(html, /https:\/\/wa\.me\/573043402589/);
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
});

test('las tarjetas de servicios enlazan el servicio elegido en la ficha', async () => {
    const dom = new JSDOM('<header id="header-container"></header><div id="services-container"></div>');
    globalThis.document = dom.window.document;
    AppView.renderHeader();
    AppView.renderServices();
    const links = [...document.querySelectorAll('a[href^="./servicios.html?servicio="]')];
    assert.equal(links.length, AppModel.services.length);
    assert.equal(AppModel.services.length, 3);
    assert.ok(document.querySelector('#header-container nav a[href="#servicios"]'), 'el enlace de escritorio debe apuntar al destino existente');
    assert.ok(document.querySelector('#mobile-menu a[href="#servicios"]'), 'el menú móvil debe incluir Servicios');
    assert.equal(document.querySelector('#services-container #servicios')?.id, 'servicios');
    assert.ok(document.querySelector('#services-container #servicios').classList.contains('scroll-mt-24'));
    assert.doesNotMatch(document.querySelector('#services-container').textContent, /automatización|sistemas empresariales|integraciones|soluciones personalizadas/i);
    assert.doesNotMatch(document.querySelector('#services-container').textContent, /500\.000 COP|15 días hábiles|250\.000 COP|20 productos/);
    links.forEach((link, index) => {
        assert.ok(link.textContent.includes(AppModel.services[index][0]));
        assert.equal(link.target, '');
        assert.equal(new URL(link.getAttribute('href'), 'https://example.test/').searchParams.get('servicio'), ['landing', 'catalogos', 'branding'][index]);
    });
    dom.window.close();
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

test('cada pestaña presenta el servicio elegido, su CTA y su estado accesible', async () => {
    const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
    const dom = new JSDOM(html, { url: 'https://example.test/servicios.html' });
    globalThis.document = dom.window.document;
    globalThis.window = dom.window;

    for (const id of Object.keys(ServicePageModel.services)) {
        ServicePageView.update(id);
        const service = ServicePageModel.services[id];
        const selected = document.querySelector(`[data-service="${id}"]`);
        assert.equal(selected.getAttribute('aria-selected'), 'true');
        assert.equal(selected.tabIndex, 0);
        assert.equal(document.querySelector('#detalle-titulo').textContent, service.title);
        assert.equal(document.querySelector('#detalle-descripcion').textContent, service.description);
        assert.equal(document.querySelector('#detalle-informacion').textContent, service.information);
        assert.equal(document.querySelector('#detalle-cta').textContent, service.action);
        assert.equal(document.querySelector('#detalle-enlace').hidden, !service.detailsHref);
        assert.equal(document.querySelector('#detalle-enlace').classList.contains('inline-flex'), Boolean(service.detailsHref));
        assert.equal(document.querySelectorAll('[role="tab"][aria-selected="true"]').length, 1);
        assert.equal(document.querySelectorAll('[data-landing-content]:not([hidden])').length, id === 'landing' ? 4 : 0);
    }

    assert.match(ServicePageModel.services.catalogos.information, /no hay un precio, alcance ni plazo publicados/);
    assert.match(ServicePageModel.services.branding.information, /no hay entregables, precio ni plazo publicados/);
    dom.window.close();
});

test('el selector de servicios se recorre con flechas y conserva el foco', async () => {
    const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
    const dom = new JSDOM(html, { url: 'https://example.test/servicios.html' });
    globalThis.document = dom.window.document;
    globalThis.window = dom.window;
    const register = document.addEventListener.bind(document);
    document.addEventListener = (type, listener, options) => {
        if (type !== 'DOMContentLoaded') register(type, listener, options);
    };
    const { ServicePageController } = await import('../src/controllers/service-page-controller.js');
    ServicePageController.init();
    const landingTab = document.querySelector('#tab-landing');
    landingTab.focus();
    landingTab.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    assert.equal(document.activeElement.id, 'tab-catalogos');
    assert.equal(document.querySelector('#tab-catalogos').getAttribute('aria-selected'), 'true');
    assert.equal(document.querySelector('#detalle-titulo').textContent, ServicePageModel.services.catalogos.title);
    dom.window.close();
});

test('las páginas públicas declaran iconos locales y el manifiesto referencia tamaños reales', async () => {
    const pages = ['index.html', 'servicios.html', '404.html', 'aviso-legal.html', 'politica-cookies.html', 'politica-privacidad.html'];
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
