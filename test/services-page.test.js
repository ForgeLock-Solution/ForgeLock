import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { AppView } from '../src/views/app-view.js';
import { AppModel } from '../src/models/app-model.js';

test('la página de servicios tiene contenido descriptivo, imágenes accesibles y CTA', async () => {
    const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
    assert.match(html, /<title>Planes de landing pages \| ForgeLock<\/title>/);
    assert.match(html, /Landing pages para presentar tu negocio/);
    assert.match(html, /Catálogos digitales/);
    assert.match(html, /Branding y diseño digital/);
    assert.doesNotMatch(html, /Automatización de WhatsApp|Sistemas y automatización|Soluciones personalizadas|CRM|pasarelas de pago/);
    assert.match(html, /Landing Básica[\s\S]*?Una ronda de cambios/);
    assert.match(html, /Landing Profesional[\s\S]*?Dos rondas de cambios/);
    assert.equal((html.match(/Ejemplo conceptual de diseño/g) ?? []).length >= 4, true);
    assert.equal((html.match(/Quiero este diseño/g) ?? []).length, 4);
    assert.match(html, /https:\/\/wa\.me\/573043402589/);
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
});

test('las tarjetas de servicios existentes enlazan a la ficha ampliada en otra pestaña', async () => {
    const dom = new JSDOM('<div id="services-container"></div>');
    globalThis.document = dom.window.document;
    AppView.renderServices();
    const links = [...document.querySelectorAll('a[href="./servicios.html"]')];
    assert.equal(links.length, AppModel.services.length);
    assert.equal(AppModel.services.length, 3);
    assert.doesNotMatch(document.querySelector('#services-container').textContent, /automatización|sistemas empresariales|integraciones|soluciones personalizadas/i);
    links.forEach((link, index) => {
        assert.ok(link.textContent.includes(AppModel.services[index][0]));
        assert.equal(link.target, '_blank');
        assert.equal(link.rel, 'noopener noreferrer');
    });
    dom.window.close();
});
