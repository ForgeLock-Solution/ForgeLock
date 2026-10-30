import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { AppView } from '../src/views/app-view.js';
import { AppModel } from '../src/models/app-model.js';

test('la página de servicios tiene contenido descriptivo, imágenes accesibles y CTA', async () => {
    const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
    assert.match(html, /<title>Servicios digitales para negocios \| ForgeLock<\/title>/);
    assert.match(html, /Páginas web y landing pages/);
    assert.match(html, /Catálogos digitales/);
    assert.match(html, /Branding y diseño digital/);
    assert.match(html, /Sistemas y automatización/);
    assert.match(html, /alt="[^"]+"/);
    assert.match(html, /Más información|Solicitar información/);
    assert.match(html, /https:\/\/wa\.me\/573043402589/);
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
});

test('las tarjetas de servicios existentes enlazan a la ficha ampliada en otra pestaña', async () => {
    const dom = new JSDOM('<div id="services-container"></div>');
    globalThis.document = dom.window.document;
    AppView.renderServices();
    const links = [...document.querySelectorAll('a[href="./servicios.html"]')];
    assert.equal(links.length, AppModel.services.length);
    links.forEach((link, index) => {
        assert.ok(link.textContent.includes(AppModel.services[index][0]));
        assert.equal(link.target, '_blank');
        assert.equal(link.rel, 'noopener noreferrer');
    });
    dom.window.close();
});
