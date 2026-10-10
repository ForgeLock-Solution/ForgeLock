import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('la página de servicios tiene contenido descriptivo, imágenes accesibles y CTA', async () => {
    const html = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
    assert.match(html, /<title>Servicios digitales para negocios \| ForgeLock Solution<\/title>/);
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
    const html = await readFile(new URL('../src/views/app-view.js', import.meta.url), 'utf8');
    assert.match(html, /href="\.\/servicios\.html" target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /Más información/);
});
