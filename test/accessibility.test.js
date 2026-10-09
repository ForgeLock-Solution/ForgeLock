import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<!doctype html><html lang="es"><body>
<header id="header-container"></header><section id="hero-container"></section>
<section id="solutions-carousel-container"></section><section id="need-finder-container"></section>
<section id="services-container"></section><section id="workflow-container"></section>
<section id="help-banner-container"></section><section id="cta-container"></section>
<footer id="footer-container"></footer><div id="toast-container"></div>
</body></html>`, { url: 'https://forgelock-solution.github.io/ForgeLock/' });

globalThis.window = dom.window;
globalThis.document = dom.window.document;

const { AppModel } = await import('../src/models/app-model.js');
const { AppView } = await import('../src/views/app-view.js');

test('el botón del menú móvil comunica estado y control accesible', () => {
    AppModel.state.isMenuOpen = false;
    AppView.renderHeader();
    let button = document.querySelector('#mobile-menu-btn');
    assert.equal(button.getAttribute('aria-expanded'), 'false');
    assert.equal(button.getAttribute('aria-controls'), 'mobile-menu');
    assert.equal(button.getAttribute('aria-label'), 'Abrir menú');

    AppModel.state.isMenuOpen = true;
    AppView.renderHeader();
    button = document.querySelector('#mobile-menu-btn');
    assert.equal(button.getAttribute('aria-expanded'), 'true');
    assert.equal(button.getAttribute('aria-label'), 'Cerrar menú');
});

test('todos los enlaces externos que abren pestaña nueva tienen protección rel', () => {
    AppView.renderHeader();
    AppView.renderHero();
    AppView.renderSolutions();
    AppView.renderServices();
    AppView.renderWorkflow();
    AppView.renderHelpAndCta();
    AppView.renderFooter();

    const unsafe = [...document.querySelectorAll('a[target="_blank"]')].filter((link) => {
        const rel = new Set((link.getAttribute('rel') || '').split(/\s+/));
        return !rel.has('noopener') || !rel.has('noreferrer');
    });
    assert.deepEqual(unsafe.map((link) => link.outerHTML), []);
});

test('los botones de selección tienen texto accesible', () => {
    AppView.renderSolutions();
    const buttons = [...document.querySelectorAll('[data-banner]')];
    assert.ok(buttons.length > 0);
    buttons.forEach((button) => assert.ok(button.textContent.trim().length > 0));
});

dom.window.close();
