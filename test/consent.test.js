import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { JSDOM, VirtualConsole } from 'jsdom';
const bootstrap = await readFile(new URL('../src/services/consent.js', import.meta.url), 'utf8');
const { AnalyticsService } = await import('../src/services/analytics-service.js');

for (const page of ['index.html', 'servicios.html']) {
    const html = await readFile(new URL(`../${page}`, import.meta.url), 'utf8');
    function open({ stored, blocked = false } = {}) {
        const virtualConsole = new VirtualConsole();
        virtualConsole.on('jsdomError', (error) => {
            // La recarga real se comprueba en Edge; JSDOM no implementa navegación.
            if (!error.message.startsWith('Not implemented: navigation')) throw error;
        });
        const dom = new JSDOM(html, { url: 'https://forgelock-solution.github.io/ForgeLock/', runScripts: 'outside-only', virtualConsole });
        if (stored) dom.window.localStorage.setItem('forgelock_analytics_consent', stored);
        if (blocked) Object.defineProperty(dom.window, 'localStorage', { get() { throw new Error('Blocked'); } });
        dom.window.eval(bootstrap);
        return dom;
    }
    test(`${page}: no carga etiquetas antes de aceptar y permite revisar el rechazo`, () => {
        const dom = open(); const { document } = dom.window;
        assert.equal(document.querySelector('#cookie-consent').classList.contains('hidden'), false);
        assert.equal(document.querySelectorAll('script[src*="googletagmanager.com"]').length, 0);
        document.querySelector('#cookie-reject').click();
        assert.equal(document.querySelector('#cookie-consent').classList.contains('hidden'), true);
        document.querySelector('#cookie-settings').click();
        assert.equal(document.activeElement.id, 'cookie-reject');
        document.querySelector('#cookie-accept').click();
        dom.window.__FORGELOCK_LOAD_ANALYTICS();
        assert.equal(document.querySelectorAll('script[src*="googletagmanager.com"]').length, 2);
        assert.equal(document.activeElement.id, 'cookie-settings');
        dom.window.close();
    });
    test(`${page}: respeta elección persistida y funciona con almacenamiento bloqueado`, () => {
        for (const options of [{ stored: 'accepted' }, { stored: 'rejected' }, { blocked: true }]) {
            const dom = open(options); const { document } = dom.window;
            assert.equal(document.querySelectorAll('script[src*="googletagmanager.com"]').length, options.stored === 'accepted' ? 2 : 0);
            if (options.blocked) {
                document.querySelector('#cookie-accept').click();
                document.querySelector('script[src*="gtag/js"]').onload();
                assert.equal(dom.window.__FORGELOCK_ANALYTICS_CONSENT, 'accepted');
                assert.equal(document.documentElement.dataset.forgeLockAnalytics, 'loaded');
            }
            dom.window.close();
        }
    });
    test(`${page}: reintenta una carga fallida y una respuesta antigua no concede consentimiento`, () => {
        const dom = open({ stored: 'accepted' }); const { document } = dom.window;
        document.querySelector('script[src*="gtag/js"]').onerror();
        assert.equal(document.documentElement.dataset.forgeLockAnalytics, 'load_error');
        dom.window.__FORGELOCK_LOAD_ANALYTICS();
        assert.equal(document.querySelectorAll('script[src*="gtag/js"]').length, 1);
        const script = document.querySelector('script[src*="gtag/js"]');
        document.querySelector('#cookie-reject').click();
        const count = dom.window.dataLayer.length;
        script.onload();
        assert.equal(dom.window.dataLayer.length, count);
        assert.equal(document.documentElement.dataset.forgeLockAnalytics, 'denied');
        dom.window.close();
    });
}

test('inicializar analítica dos veces conserva loaded y registra un solo clic sin datos personales', () => {
    const dom = new JSDOM('<a href="https://wa.me/573043402589?text=privado">WhatsApp</a><div id="servicios"></div>', { url: 'https://forgelock-solution.github.io/ForgeLock/' });
    globalThis.window = dom.window; globalThis.document = dom.window.document;
    window.__FORGELOCK_ANALYTICS_CONSENT = 'accepted';
    document.documentElement.dataset.forgeLockAnalytics = 'loaded';
    const events = []; window.gtag = (...args) => events.push(args);
    let observed = false;
    window.IntersectionObserver = class { observe() { observed = true; } };
    AnalyticsService.init(); AnalyticsService.init();
    assert.equal(document.documentElement.dataset.forgeLockAnalytics, 'loaded');
    document.querySelector('a').addEventListener('click', e => e.preventDefault());
    document.querySelector('a').click();
    assert.deepEqual(events, [['event', 'whatsapp_click', { link_url: 'https://wa.me', link_text: 'WhatsApp' }]]);
    assert.equal(observed, true);
    window.__FORGELOCK_ANALYTICS_CONSENT = 'rejected';
    document.querySelector('a').click(); assert.equal(events.length, 1);
    dom.window.close();
});

test('la vista de servicios empieza a observarse después del consentimiento', () => {
    const dom = new JSDOM('<div id="servicios"></div>');
    globalThis.window = dom.window; globalThis.document = dom.window.document;
    window.__FORGELOCK_ANALYTICS_CONSENT = 'rejected';
    let observed = 0;
    window.IntersectionObserver = class { observe() { observed++; } };
    AnalyticsService.init(); assert.equal(observed, 0);
    window.__FORGELOCK_ANALYTICS_CONSENT = 'accepted';
    document.documentElement.dataset.forgeLockAnalytics = 'loaded';
    document.dispatchEvent(new window.Event('forgelock:analytics-ready'));
    assert.equal(observed, 1);
    dom.window.close();
});
