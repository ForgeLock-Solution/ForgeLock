import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('el consentimiento sigue funcionando si localStorage está bloqueado', () => {
    const dom = new JSDOM(html, {
        url: 'https://forgelock-solution.github.io/ForgeLock/',
        runScripts: 'dangerously',
        beforeParse(window) {
            Object.defineProperty(window, 'localStorage', {
                configurable: true,
                get() {
                    throw new window.DOMException('Storage is blocked', 'SecurityError');
                }
            });
        }
    });

    const { document } = dom.window;
    const banner = document.querySelector('#cookie-consent');
    assert.ok(banner);
    assert.equal(banner.classList.contains('hidden'), false);

    assert.doesNotThrow(() => document.querySelector('#cookie-reject').click());
    assert.equal(banner.classList.contains('hidden'), true);

    assert.equal(document.querySelector('script[src*="googletagmanager.com/gtag/js"]'), null);
    assert.equal(document.querySelector('script[src*="googletagmanager.com/gtm.js"]'), null);
    banner.classList.remove('hidden');
    assert.doesNotThrow(() => document.querySelector('#cookie-accept').click());
    assert.equal(banner.classList.contains('hidden'), true);
    assert.ok(document.querySelector('script[src*="googletagmanager.com/gtag/js"]'));
    assert.ok(document.querySelector('script[src*="googletagmanager.com/gtm.js"]'));

    dom.window.close();
});


test('GTM y GA4 no se insertan antes del consentimiento en la página principal', () => {
    assert.doesNotMatch(html, /googletagmanager\.com\/gtm\.js\?id=GTM-WJMDTTWM/);
    assert.doesNotMatch(html, /googletagmanager\.com\/ns\.html\?id=GTM-WJMDTTWM/);
    assert.match(html, /__FORGELOCK_LOAD_GTM/);
    assert.match(html, /cookie-accept/);
    assert.match(html, /cookie-reject/);
});

test('la página de servicios también solicita consentimiento y bloquea eventos sin aceptación', async () => {
    const servicesHtml = await readFile(new URL('../servicios.html', import.meta.url), 'utf8');
    const analyticsSource = await readFile(new URL('../src/services/analytics-service.js', import.meta.url), 'utf8');
    assert.match(servicesHtml, /id="cookie-consent"/);
    assert.match(servicesHtml, /id="cookie-accept"/);
    assert.match(servicesHtml, /id="cookie-reject"/);
    assert.doesNotMatch(servicesHtml, /googletagmanager\.com\/gtm\.js\?id=GTM-WJMDTTWM/);
    assert.match(analyticsSource, /hasAnalyticsConsent/);
});
